import pino from 'pino';
import * as Rx from 'rxjs';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import {
  UnshieldedWallet,
  createKeystore,
  PublicKey,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { mnemonicToSeedSync } from 'bip39';
import { promises as fs } from 'fs';
import path from 'path';

const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });

// Your wallet mnemonic (24 words)
const WALLET_MNEMONIC = 'random balcony finish improve stone timber beach limit imitate valley orchard genuine siren girl stuff absurd exile evil leader drum uncover shine render master';

const NODE_RPC = 'http://localhost:9944';
const INDEXER_URL = 'http://localhost:8088/api/v3/graphql';
const INDEXER_WS = 'ws://localhost:8088/api/v3/graphql/ws';
const PROOF_SERVER = 'http://localhost:6300';

setNetworkId('undeployed');

async function main() {
  try {
    logger.info('🚀 Deploying with YOUR funded wallet');
    logger.info(`   Mnemonic: ${WALLET_MNEMONIC.split(' ').slice(0, 3).join(' ')}...`);
    logger.info('');
    
    // Convert mnemonic to seed
    logger.info('🔑 Converting mnemonic to seed...');
    const seedBuffer = mnemonicToSeedSync(WALLET_MNEMONIC).slice(0, 32); // First 32 bytes
    
    // Derive keys from YOUR existing seed
    logger.info('🔑 Deriving keys from your wallet...');
    const hdWallet = HDWallet.fromSeed(seedBuffer);
    
    if (hdWallet.type !== 'seedOk') {
      throw new Error('Failed to initialize HDWallet');
    }
    
    const derivationResult = hdWallet.hdWallet
      .selectAccount(0)
      .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
      .deriveKeysAt(0);
    
    if (derivationResult.type !== 'keysDerived') {
      throw new Error('Failed to derive keys');
    }
    
    const keys = derivationResult.keys;
    hdWallet.hdWallet.clear();
    
    const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());
    
    logger.info('✅ Keys derived');
    logger.info('');
    
    // Create wallets
    logger.info('💼 Creating wallet components...');
    
    const shieldedConfig = {
      networkId: getNetworkId(),
      indexerClientConnection: {
        indexerHttpUrl: INDEXER_URL,
        indexerWsUrl: INDEXER_WS
      },
      provingServerUrl: new URL(PROOF_SERVER),
      relayURL: new URL(NODE_RPC.replace('http', 'ws'))
    };
    
    const unshieldedConfig = {
      networkId: getNetworkId(),
      indexerClientConnection: {
        indexerHttpUrl: INDEXER_URL,
        indexerWsUrl: INDEXER_WS
      }
    };
    
    const dustConfig = {
      networkId: getNetworkId(),
      costParameters: {
        additionalFeeOverhead: 300_000_000_000_000n,
        feeBlocksMargin: 5,
      },
      indexerClientConnection: {
        indexerHttpUrl: INDEXER_URL,
        indexerWsUrl: INDEXER_WS
      },
      provingServerUrl: new URL(PROOF_SERVER),
      relayURL: new URL(NODE_RPC.replace('http', 'ws'))
    };
    
    const shieldedWallet = ShieldedWallet(shieldedConfig).startWithSecretKeys(shieldedSecretKeys);
    const unshieldedWallet = UnshieldedWallet(unshieldedConfig).startWithPublicKey(
      PublicKey.fromKeyStore(unshieldedKeystore)
    );
    const dustWallet = DustWallet(dustConfig).startWithSecretKey(
      dustSecretKey,
      ledger.LedgerParameters.initialParameters().dust
    );
    
    const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
    await wallet.start(shieldedSecretKeys, dustSecretKey);
    
    logger.info('✅ Wallet created');
    logger.info('');
    
    // Sync
    logger.info('🔄 Syncing...');
    const syncedState = await Rx.firstValueFrom(
      wallet.state().pipe(Rx.filter((s) => s.isSynced))
    );
    
    logger.info('✅ Synced!');
    logger.info('');
    
    // Show balance
    const balance = syncedState.unshielded.balances['74696d654e6967687400000000000000'] ?? 0n;
    logger.info(`💰 Balance: ${balance.toLocaleString()} tokens`);
    logger.info(`📍 Address: ${unshieldedKeystore.getBech32Address()}`);
    logger.info('');
    
    // Check for DUST (needed for transactions)
    const dustBalance = syncedState.dust.walletBalance(new Date());
    logger.info(`⚡ DUST: ${dustBalance.toLocaleString()}`);
    logger.info('');
    
    if (dustBalance === 0n) {
      logger.warn('⚠️  No DUST available - register NIGHT tokens for DUST generation');
      logger.warn('   This is required for transaction fees');
    }
    
    // Save wallet info for manual deployment
    const walletInfo = {
      address: unshieldedKeystore.getBech32Address(),
      balance: balance.toString(),
      dustBalance: dustBalance.toString(),
      networkId: getNetworkId(),
      contractPath: './build_working/contract/index.js',
      constructorArgs: {
        initialBalance: '1000000',
        quorum: '100'
      },
      note: 'Use this wallet info for manual deployment via Midnight tools'
    };
    
    await fs.writeFile(
      path.join(process.cwd(), 'wallet-for-deployment.json'),
      JSON.stringify(walletInfo, null, 2)
    );
    
    logger.info('✅ Wallet info saved to wallet-for-deployment.json');
    logger.info('');
    logger.info('🎯 Next: Deploy via Midnight Lace Wallet or submission portal');
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
