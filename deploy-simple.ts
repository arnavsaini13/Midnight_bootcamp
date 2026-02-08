/**
 * Simple Deployment Script for PrivateDAO Treasury
 * Deploys the compiled contract from build_working/contract/
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

const {
  DEPLOYER_ADDRESS,
  NODE_RPC = 'ws://localhost:9944',
  PROOF_SERVER = 'http://localhost:6300',
  INDEXER_URL = 'http://localhost:8088',
  INITIAL_BALANCE = '1000000',
  QUORUM_THRESHOLD = '100'
} = process.env;

async function deploy() {
  console.log('🚀 Deploying PrivateDAO Treasury Contract\n');
  
  if (!DEPLOYER_ADDRESS) {
    console.error('❌ Error: DEPLOYER_ADDRESS not set in .env file');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`   Deployer: ${DEPLOYER_ADDRESS}`);
  console.log(`   Node RPC: ${NODE_RPC}`);
  console.log(`   Proof Server: ${PROOF_SERVER}`);
  console.log(`   Indexer: ${INDEXER_URL}`);
  console.log(`   Initial Balance: ${INITIAL_BALANCE}`);
  console.log(`   Quorum: ${QUORUM_THRESHOLD}\n`);

  // Check if compiled contract exists
  const contractDir = join(process.cwd(), 'build_working', 'contract');
  const contractIndexPath = join(contractDir, 'index.js');
  
  if (!existsSync(contractIndexPath)) {
    console.error(`❌ Compiled contract not found at ${contractIndexPath}`);
    console.error('   Run: compact compile PrivateDAOTreasury_Working.compact ./build_working');
    process.exit(1);
  }

  console.log('✅ Found compiled contract at:', contractDir);

  try {
    // Import the compiled contract
    console.log('\n📦 Loading contract module...');
    const contractModule = await import(`./build_working/contract/index.js`);
    
    console.log('✅ Contract module loaded successfully');
    console.log('\n🔍 Available exports:', Object.keys(contractModule));

    // Check if contract has deploy function
    if (typeof contractModule.deploy === 'function') {
      console.log('\n🚀 Deploying contract with constructor args:');
      console.log(`   initialBalance: ${INITIAL_BALANCE}`);
      console.log(`   quorum: ${QUORUM_THRESHOLD}`);

      const deployment = await contractModule.deploy(
        DEPLOYER_ADDRESS,
        {
          nodeRpc: NODE_RPC,
          proofServer: PROOF_SERVER,
          indexerUrl: INDEXER_URL
        },
        {
          initialBalance: BigInt(INITIAL_BALANCE),
          quorum: BigInt(QUORUM_THRESHOLD)
        }
      );

      console.log('\n✅ DEPLOYMENT SUCCESS!');
      console.log('Contract Address:', deployment.contractAddress);
      console.log('Transaction Hash:', deployment.transactionHash);

      // Save deployment info
      const deploymentInfo = {
        contractAddress: deployment.contractAddress,
        transactionHash: deployment.transactionHash,
        deployedAt: new Date().toISOString(),
        network: 'local',
        deployer: DEPLOYER_ADDRESS,
        constructorArgs: {
          initialBalance: INITIAL_BALANCE,
          quorum: QUORUM_THRESHOLD
        }
      };

      writeFileSync(
        'deployment.json',
        JSON.stringify(deploymentInfo, null, 2)
      );

      console.log('\n📝 Deployment info saved to deployment.json');
      
    } else {
      console.log('\n⚠️  Contract module structure:');
      console.log(JSON.stringify(contractModule, null, 2).slice(0, 500));
      console.log('\n💡 Manual steps required - see the contract module exports above');
    }

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

deploy().catch(console.error);
