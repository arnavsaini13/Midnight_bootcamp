import { deploy } from '@midnight-ntwrk/midnight-js-contracts';
import { createBalancedTransaction } from '@midnight-ntwrk/midnight-js-types';
import { Contract as CompiledContract } from './build_working/contract/index.js';
import { providers, DiskStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { HttpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { createMnemonic } from '@midnight-ntwrk/wallet-sdk-hd';
import { createLaceWallet } from '@midnight-ntwrk/wallet-sdk-facade';
import { networkId } from '@midnight-ntwrk/midnight-js-network-id';
import { pino } from 'pino';
import { join } from 'path';
import { writeFileSync } from 'fs';

const logger = pino({
  transport: { target: 'pino-pretty' },
  level: 'info'
});

async function deployLocally() {
  logger.info('🏠 LOCAL CONTRACT DEPLOYMENT');
  logger.info('   Deploying to local wallet state (not blockchain network)');
  logger.info('');

  // Configuration
  const config = {
    indexerUrl: 'http://localhost:8088/api/v3/graphql',
    indexerWsUrl: 'ws://localhost:8088/api/v3/graphql',
    proofServer: 'http://localhost:6300',
    zkConfigPath: join(process.cwd(), 'build_working', 'contract'),
    walletStatePath: join(process.cwd(), '.wallet-state'),
  };

  logger.info('📋 Configuration:');
  logger.info(`   Indexer: ${config.indexerUrl}`);
  logger.info(`   Proof Server: ${config.proofServer}`);
  logger.info(`   Contract: ${config.zkConfigPath}`);
  logger.info(`   Wallet State: ${config.walletStatePath}`);
  logger.info('');

  // Create or load wallet mnemonic
  const mnemonic = createMnemonic();
  logger.info('🔑 Wallet created');
  logger.info(`   Mnemonic: ${mnemonic.split(' ').slice(0, 3).join(' ')}...`);
  logger.info('');

  // Setup providers
  logger.info('🔧 Setting up providers...');
  
  const zkConfigProvider = new NodeZkConfigProvider(config.zkConfigPath);
  const proofProvider = new HttpClientProofProvider(config.proofServer);
  const publicDataProvider = indexerPublicDataProvider(config.indexerUrl);
  const privateStateProvider = await providers.diskPrivateStateProvider({
    dataDirectory: config.walletStatePath,
  });

  logger.info('✅ Providers ready');
  logger.info('');

  // Create wallet
  logger.info('💼 Creating wallet instance...');
  const wallet = await createLaceWallet({
    mnemonic,
    networkId: networkId('undeployed'),
    indexerUrl: config.indexerUrl,
    indexerWsUrl: config.indexerWsUrl,
    proofServerUrl: config.proofServer,
  });

  logger.info('✅ Wallet created');
  logger.info(`   Address: ${wallet.address()}`);
  logger.info('');

  // Wait for wallet sync
  logger.info('🔄 Syncing wallet...');
  await wallet.sync();
  logger.info('✅ Wallet synced');
  logger.info('');

  // Deploy contract to local wallet state
  logger.info('🚀 Deploying contract to local wallet state...');
  logger.info('   This deploys to YOUR wallet, not the blockchain network');
  logger.info('');

  try {
    const deployedContract = await deploy(
      CompiledContract,
      zkConfigProvider,
      proofProvider,
      publicDataProvider,
      privateStateProvider,
      wallet
    );

    logger.info('✅ CONTRACT DEPLOYED LOCALLY!');
    logger.info('');
    logger.info('📦 Deployment Details:');
    logger.info(`   Contract Address: ${deployedContract.contractAddress}`);
    logger.info(`   Wallet Address: ${wallet.address()}`);
    logger.info(`   Network: undeployed (local)`);
    logger.info('');

    // Save deployment info
    const deploymentInfo = {
      contractAddress: deployedContract.contractAddress,
      walletAddress: wallet.address(),
      mnemonic: mnemonic,
      network: 'undeployed',
      deployedAt: new Date().toISOString(),
      indexerUrl: config.indexerUrl,
      proofServer: config.proofServer,
      walletStatePath: config.walletStatePath,
    };

    writeFileSync(
      'LOCAL_DEPLOYMENT.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    logger.info('✅ Deployment info saved to LOCAL_DEPLOYMENT.json');
    logger.info('');
    logger.info('🎉 SUCCESS! Your contract is deployed locally!');
    logger.info('');
    logger.info('📝 Next Steps:');
    logger.info('   1. Your wallet now contains the deployed contract');
    logger.info('   2. Start the backend: cd backend && npm run dev');
    logger.info('   3. Start the frontend: cd frontend && npm run dev');
    logger.info('   4. Open http://localhost:3000');
    logger.info('');
    logger.info('💡 The application will interact with your locally deployed contract!');

    return deployedContract;
  } catch (error) {
    logger.error('❌ Deployment failed:', error);
    throw error;
  }
}

// Run deployment
deployLocally()
  .then(() => {
    logger.info('');
    logger.info('════════════════════════════════════════');
    logger.info('  LOCAL DEPLOYMENT COMPLETE!');
    logger.info('════════════════════════════════════════');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
