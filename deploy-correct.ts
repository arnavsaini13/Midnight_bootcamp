import pino from 'pino';
import { randomBytes } from 'crypto';
import * as Rx from 'rxjs';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { unshieldedToken } from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import {
  UnshieldedWallet,
  createKeystore,
  PublicKey,
  type UnshieldedKeystore
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import type { WalletProvider, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NODE_RPC = 'http://localhost:9944';
const INDEXER_URL = 'http://localhost:8088/api/v3/graphql';
const INDEXER_WS = 'ws://localhost:8088/api/v3/graphql/ws';
const PROOF_SERVER = 'http://localhost:6300';
const INITIAL_BALANCE = 1000000n;
const QUORUM = 100n;

setNetworkId('undeployed');

async function main() {
  try {
    logger.info('🚀 Starting PrivateDAO Treasury Deployment');
    logger.info('');
    logger.info('Configuration:');
    logger.info(`  Node: ${NODE_RPC}`);
    logger.info(`  Indexer: ${INDEXER_URL}`);
    logger.info(`  Proof Server: ${PROOF_SERVER}`);
logger.info(`  Initial Balance: ${INITIAL_BALANCE}`);
    logger.info(`  Quorum: ${QUORUM}`);
    logger.info('');
    
    // Step 1: Create HD Wallet and derive keys
    logger.info('📝 Creating HD wallet...');
    const seed = randomBytes(32);
    const hdWallet = HDWallet.fromSeed(seed);
    
    if (hdWallet.type !== 'seedOk') {
      throw new Error('Failed to initialize HDWallet from seed');
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
    
    // Create secret keys
    const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());
    
    logger.info('✅ Keys derived successfully');
    logger.info('');
    
    // Step 2: Create wallet configurations
    logger.info('🔧 Configuring wallets...');
    
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
    
    // Step 3: Create wallet components using factory pattern
    logger.info('💼 Initializing wallet components...');
    
    const shieldedWallet = ShieldedWallet(shieldedConfig).startWithSecretKeys(shieldedSecretKeys);
    const unshieldedWallet = UnshieldedWallet(unshieldedConfig).startWithPublicKey(
      PublicKey.fromKeyStore(unshieldedKeystore)
    );
    const dustWallet = DustWallet(dustConfig).startWithSecretKey(
      dustSecretKey,
      ledger.LedgerParameters.initialParameters().dust
    );
    
    // Step 4: Create WalletFacade
    const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
    await wallet.start(shieldedSecretKeys, dustSecretKey);
    
    logger.info('✅ Wallet facade created and started');
    logger.info('');
    
    // Step 5: Wait for wallet sync
    logger.info('🔄 Waiting for wallet to sync...');
    const syncedState = await Rx.firstValueFrom(
      wallet.state().pipe(Rx.filter((s) => s.isSynced))
    );
    logger.info('✅ Wallet synced!');
    logger.info('');
    
    // Step 6: Create wallet provider
    logger.info('🔗 Creating providers...');
    
    const walletProvider: WalletProvider & MidnightProvider = {
      getCoinPublicKey() {
        return syncedState.shielded.coinPublicKey.toHexString();
      },
      getEncryptionPublicKey() {
        return syncedState.shielded.encryptionPublicKey.toHexString();
      },
      async balanceTx(tx, ttl?) {
        const recipe = await wallet.balanceUnboundTransaction(
          tx,
          { shieldedSecretKeys, dustSecretKey },
          { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) }
        );
        const signFn = (payload: Uint8Array) => unshieldedKeystore.signData(payload);
        return await wallet.finalizeRecipe(recipe);
      },
      submitTx(tx) {
        return wallet.submitTransaction(tx) as any;
      },
    };
    
    const zkConfigPath = path.join(__dirname, 'build_working');
    const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
    
    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: 'treasury-private-state',
        walletProvider
      }),
      publicDataProvider: indexerPublicDataProvider(INDEXER_URL, INDEXER_WS),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(PROOF_SERVER, zkConfigProvider),
      walletProvider,
      midnightProvider: walletProvider
    };
    
    logger.info('✅ Providers configured');
    logger.info('');
    
    // Step 7: Load compiled contract
    logger.info('📦 Loading compiled contract...');
    const contractPath = path.join(__dirname, 'build_working', 'contract', 'index.js');
    const contractUrl = new URL(`file:///${contractPath.replace(/\\/g, '/')}`).href;
    const contractModule = await import(contractUrl);
    
    logger.info('✅ Contract loaded');
    logger.info('');
    
    // Step 8: Deploy contract
    logger.info('🚀 Deploying contract...');
    logger.info(`   Initial Balance: ${INITIAL_BALANCE}`);
    logger.info(`   Quorum: ${QUORUM}`);
    logger.info('');
    
    const deployed = await deployContract(providers, {
      compiledContract: contractModule.default,
      privateStateId: 'treasuryState',
      initialPrivateState: {},
    });
    
    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('  ✅ CONTRACT DEPLOYED SUCCESSFULLY!');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');
    logger.info(`📍 Contract Address: ${deployed.deployTxData.public.contractAddress}`);
    logger.info(`📋 Transaction ID: ${deployed.deployTxData.public.txId}`);
    logger.info(`📦 Block Height: ${deployed.deployTxData.public.blockHeight}`);
    logger.info('');
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: deployed.deployTxData.public.contractAddress,
      transactionId: deployed.deployTxData.public.txId,
      blockHeight: deployed.deployTxData.public.blockHeight,
      timestamp: new Date().toISOString(),
      network: getNetworkId(),
      constructorArgs: {
        initialBalance: INITIAL_BALANCE.toString(),
        quorum: QUORUM.toString()
      }
    };
    
    await fs.writeFile(
      path.join(__dirname, 'deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    logger.info('✅ Deployment info saved to deployment.json');
    logger.info('');
    logger.info('🎉 Deployment complete!');
    
  } catch (error) {
    logger.error('❌ Deployment failed:');
    logger.error(`Error: ${error.message}`);
    logger.error(`Stack: ${error.stack}`);
    logger.error('Fatal error:');
    process.exit(1);
  }
}

main();
