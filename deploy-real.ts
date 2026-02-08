/**
 * Deploy PrivateDAO Treasury Contract
 * Based on example-counter deployment pattern
 */

import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { UnshieldedWallet, createKeystore, InMemoryTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { config } from 'dotenv';
import { WebSocket } from 'ws';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import pino from 'pino';
import * as Rx from 'rxjs';
import { randomBytes } from 'crypto';
import { Buffer } from 'buffer';

config();

// Required for GraphQL subscriptions
// @ts-expect-error: Needed for WebSocket
globalThis.WebSocket = WebSocket;

const logger = pino({
  level: 'info',
  transport: { target: 'pino-pretty' }
});

const NODE_RPC = process.env.NODE_RPC || 'http://localhost:9944';
const INDEXER_URL = process.env.INDEXER_URL || 'http://localhost:8088/api/v3/graphql';
const INDEXER_WS = process.env.INDEXER_WS || 'ws://localhost:8088/api/v3/graphql/ws';
const PROOF_SERVER = process.env.PROOF_SERVER || 'http://localhost:6300';
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;
const INITIAL_BALANCE = process.env.INITIAL_BALANCE || '1000000';
const QUORUM = process.env.QUORUM_THRESHOLD || '100';

// Set network ID
const { setNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
setNetworkId('undeployed');

async function createWalletContext() {
  logger.info('Creating wallet context...');
  
  // Generate a random 32-byte seed
  const seed = randomBytes(32);
  const hdWallet = HDWallet.fromSeed(seed);
  
  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HDWallet from seed');
  }

  // Derive keys for Zswap (shielded), NightExternal (unshielded), and Dust
  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derivationResult.type !== 'keysDerived') {
    throw new Error('Failed to derive keys');
  }

  const keys = derivationResult.keys;
  hdWallet.hdWallet.clear();
  
  // Extract keys for each wallet type  (keys is an array indexed by Roles)
  const shieldedWalletSeed = keys[Roles.Zswap];
  const unshieldedSecretKey = keys[Roles.NightExternal];
  const dustSecretKey = keys[Roles.Dust];
  
  if (!shieldedWalletSeed || !unshieldedSecretKey || !dustSecretKey) {
    throw new Error('Failed to derive all required keys');
  }
  
  // Create secret keys from seed
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(shieldedWalletSeed);
  
  // Create unshielded keystore
  const unshieldedKeystore = createKeystore(unshieldedSecretKey, new InMemoryTransactionHistoryStorage());
  
  logger.info('Network ID: undeployed');
  
  // Create wallet configurations
  const shieldedConfig = {
    networkId: 'undeployed' as const,
    indexerClientConnection: {
      indexerHttpUrl: INDEXER_URL,
      indexerWsUrl: INDEXER_WS
    },
    provingServerUrl: new URL(PROOF_SERVER),
    relayURL: new URL(NODE_RPC.replace('http', 'ws'))
  };
  
  const dustConfig = {
    networkId: 'undeployed' as const,
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
  
  const unshieldedConfig = {
    networkId: 'undeployed' as const,
    indexerClientConnection: {
      indexerHttpUrl: INDEXER_URL,
      indexerWsUrl: INDEXER_WS
    },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  };
  
  // Create wallet components using factory pattern (not constructors)
  logger.info('Creating wallet components...');
  const ShieldedWalletClass = ShieldedWallet(shieldedConfig);
  const shieldedWallet = ShieldedWalletClass.startWithSecretKeys(shieldedSecretKeys);
  
  const DustWalletClass = DustWallet(dustConfig);
  const dustWallet = DustWalletClass.start(dustSecretKey);
  
  const UnshieldedWalletClass = UnshieldedWallet(unshieldedConfig);
  const unshieldedWallet = UnshieldedWalletClass.start(unshieldedKeystore);
  
  // Create wallet facade
  const wallet = new WalletFacade(shieldedWallet, dustWallet, unshieldedWallet);
  
  // Start wallet sync
  await wallet.start();
  logger.info('Wallet started and syncing...');
  
  // Wait for sync
  await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  logger.info('Wallet synced!');
  
  return {
    wallet,
    shieldedSecretKeys,
    dustSecretKey,
    unshieldedKeystore
  };
}

async function createProviders(walletContext: any) {
  logger.info('Creating providers...');
  
  const publicDataProvider = indexerPublicDataProvider(INDEXER_URL);
  const proofProvider = httpClientProofProvider(PROOF_SERVER);
  const zkConfigProvider = new NodeZkConfigProvider(
    join(process.cwd(), 'build_working', 'keys'),
    join(process.cwd(), 'build_working', 'zkir')
  );
  const privateStateProvider = levelPrivateStateProvider({
    indexerUrl: INDEXER_URL,
    indexerWsUrl: INDEXER_URL.replace('http', 'ws'),
    nodeUrl: NODE_RPC,
    dbPath: './.private-state'
  });
  
  // Create wallet and midnight provider
  const state = await Rx.firstValueFrom(walletContext.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  
  const walletProvider = {
    coinPublicKey: walletContext.shieldedSecretKeys.coinPublicKey,
    balanceByTeam: async (team: any) => {
      const state = await Rx.firstValueFrom(walletContext.wallet.state());
      return state.balances.get(team) || BigInt(0);
    },
    balances: async () => {
      const state = await Rx.firstValueFrom(walletContext.wallet.state());
      return state.balances;
    }
  };
  
  const midnightProvider = {
    publicDataProvider,
    proofProvider,
    zkConfigProvider,
    privateStateProvider,
    walletProvider
  };
  
  return { ...midnightProvider, walletProvider };
}

async function deployDAO() {
  logger.info('🚀 Starting PrivateDAO Treasury Deployment\n');
  logger.info(`Configuration:`);
  logger.info(`  Node: ${NODE_RPC}`);
  logger.info(`  Indexer: ${INDEXER_URL}`);
  logger.info(`  Proof Server: ${PROOF_SERVER}`);
  logger.info(`  Initial Balance: ${INITIAL_BALANCE}`);
  logger.info(`  Quorum: ${QUORUM}\n`);
  
  try {
    // Create wallet
    const walletContext = await createWalletContext();
    
    // Create providers
    const providers = await createProviders(walletContext);
    
    // Load compiled contract
    logger.info('Loading compiled contract...');
    const contractModule = await import('./build_working/contract/index.js');
    
    logger.info('Contract loaded. Starting deployment...');
    
    // Deploy contract
    const deployedContract = await deployContract(providers, {
      compiledContract: contractModule,
      privateStateId: 'daoPrivateState',
      initialPrivateState: {},
      constructorArgs: {
        initialBalance: BigInt(INITIAL_BALANCE),
        quorum: BigInt(QUORUM)
      }
    });
    
    const contractAddress = deployedContract.deployTxData.public.contractAddress;
    const txId = deployedContract.deployTxData.public.txId;
    const blockHeight = deployedContract.deployTxData.public.blockHeight;
    
    logger.info('\n✅ DEPLOYMENT SUCCESSFUL!\n');
    logger.info(`Contract Address: ${contractAddress}`);
    logger.info(`Transaction ID: ${txId}`);
    logger.info(`Block Height: ${blockHeight}\n`);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      transactionId: txId,
      blockHeight: Number(blockHeight),
      deployedAt: new Date().toISOString(),
      network: 'local',
      constructorArgs: {
        initialBalance: INITIAL_BALANCE,
        quorum: QUORUM
      }
    };
    
    writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
    logger.info('📝 Deployment info saved to deployment.json\n');
    
    // Stop wallet
    await walletContext.wallet.stop();
    
    return deploymentInfo;
    
  } catch (error) {
    logger.error('❌ Deployment failed:');
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
      logger.error(`Stack: ${error.stack}`);
    } else {
      logger.error(error);
    }
    throw error;
  }
}

deployDAO()
  .then(() => {
    logger.info('🎉 Deployment complete!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
