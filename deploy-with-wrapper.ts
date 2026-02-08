import pino from 'pino';
import * as Rx from 'rxjs';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { UnshieldedWallet, createKeystore, PublicKey } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { WalletProvider, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';
import { randomBytes } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { contract } from './wrapped-contract.js';

const logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_RPC = 'http://localhost:9944';
const INDEXER_URL = 'http://localhost:8088/api/v3/graphql';
const INDEXER_WS = 'ws://localhost:8088/api/v3/graphql/ws';
const PROOF_SERVER = 'http://localhost:6300';

setNetworkId('undeployed');

async function deployWithWrappedContract() {
  try {
    logger.info('🚀 DEPLOYING WITH WRAPPED CONTRACT');
    logger.info('   Using CompiledContract.make() wrapper');
    logger.info('');
    
    // Create wallet
    logger.info('🔑 Creating wallet...');
    const seed = randomBytes(32);
    const hdWallet = HDWallet.fromSeed(seed);
    
    if (hdWallet.type !== 'seedOk') throw new Error(' Failed to initialize HDWallet');
    
    const derivationResult = hdWallet.hdWallet
      .selectAccount(0)
      .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
      .deriveKeysAt(0);
    
    if (derivationResult.type !== 'keysDerived') throw new Error('Failed to derive keys');
    
    const keys = derivationResult.keys;
    hdWallet.hdWallet.clear();
    
    const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());
    
    logger.info('✅ Keys derived');
    logger.info('');
    
    // Setup wallets
    const shieldedConfig = {
      networkId: getNetworkId(),
      indexerClientConnection: { indexerHttpUrl: INDEXER_URL, indexerWsUrl: INDEXER_WS },
      provingServerUrl: new URL(PROOF_SERVER),
      relayURL: new URL(NODE_RPC.replace('http', 'ws'))
    };
    
    const unshieldedConfig = {
      networkId: getNetworkId(),
      indexerClientConnection: { indexerHttpUrl: INDEXER_URL, indexerWsUrl: INDEXER_WS }
    };
    
    const dustConfig = {
      networkId: getNetworkId(),
      costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
      indexerClientConnection: { indexerHttpUrl: INDEXER_URL, indexerWsUrl: INDEXER_WS },
      provingServerUrl: new URL(PROOF_SERVER),
      relayURL: new URL(NODE_RPC.replace('http', 'ws'))
    };
    
    const shieldedWallet = ShieldedWallet(shieldedConfig).startWithSecretKeys(shieldedSecretKeys);
    const unshieldedWallet = UnshieldedWallet(unshieldedConfig).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
    const dustWallet = DustWallet(dustConfig).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);
    
    const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
    await wallet.start(shieldedSecretKeys, dustSecretKey);
    
    logger.info('⏳ Syncing wallet...');
    const syncedState = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
    logger.info('✅ Wallet synced!');
    logger.info('');
    
    // Create providers
    logger.info('⚙️  Creating providers...');
    
    const zkConfigPath = path.join(__dirname, 'build_working', 'contract');
    const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
    
    const walletProvider: WalletProvider & MidnightProvider = {
      getCoinPublicKey: () => syncedState.shielded.coinPublicKey.toHexString(),
      getEncryptionPublicKey: () => syncedState.shielded.encryptionPublicKey.toHexString(),
      balanceTx: async (tx, ttl) => {
        const recipe = await wallet.balanceUnboundTransaction(
          tx,
          { shieldedSecretKeys, dustSecretKey },
          { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) }
        );
        return await wallet.finalizeRecipe(recipe);
      },
      submitTx: (tx) => wallet.submitTransaction(tx) as any,
    };
    
    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: path.join(__dirname, 'private-state')
      }),
      publicDataProvider: indexerPublicDataProvider(INDEXER_URL, INDEXER_WS),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(PROOF_SERVER, zkConfigProvider),
      walletProvider,
      midnightProvider: walletProvider
    };
    
    logger.info('✅ Providers configured');
    logger.info('');
    
    // Deploy using wrapped contract
    logger.info('🚀 DEPLOYING CONTRACT WITH SDK WRAPPER...');
    logger.info('   Contract: PrivateDAOTreasury');
    logger.info('   Wrapped: CompiledContract.make()');
    logger.info('');
    
    const deployed = await deployContract(providers, {
      contract,
      initialState: {
        // Your constructor arguments here
      }
    });
    
    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('  🎉 CONTRACT DEPLOYED SUCCESSFULLY!');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('');
    logger.info(`📍 Contract Address: ${deployed.deployTxData.public.contractAddress}`);
    logger.info(`🔗 Transaction Hash: ${deployed.deployTxData.public.txHash}`);
    logger.info(`👛 Deployer: ${unshieldedKeystore.getBech32Address()}`);
    logger.info('');
    logger.info('✅ Your contract is LIVE on the blockchain!');
    logger.info('═══════════════════════════════════════════════════════════');
    
  } catch (error: any) {
    logger.error('❌ Deployment failed:', error.message);
    logger.error('Stack:', error.stack);
  }
}

deployWithWrappedContract();
