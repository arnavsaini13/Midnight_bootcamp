/**
 * Deploy PrivateDAO Treasury Contract to Midnight Local Network
 * 
 * This script deploys the compiled Compact contract using the Midnight SDK
 */

import * as ledger from '@midnight-ntwrk/ledger-v7';
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Load environment variables
config();

const {
  DEPLOYER_ADDRESS,
  NODE_RPC = 'ws://localhost:9944',
  PROOF_SERVER = 'http://localhost:6300',
  INITIAL_BALANCE = '1000000',
  QUORUM_THRESHOLD = '100',
  MINIMUM_PROPOSER_WEIGHT = '10',
  EXECUTION_DELAY = '10'
} = process.env;

interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  deployedAt: string;
  constructorArgs: {
    initialBalance: string;
    quorumThreshold: string;
    minimumProposerWeight: string;
    executionDelay: string;
  };
}

async function deployContract() {
  console.log('🚀 Starting PrivateDAO Treasury Deployment...\n');

  if (!DEPLOYER_ADDRESS) {
    throw new Error('DEPLOYER_ADDRESS not set in .env file');
  }

  console.log('📋 Configuration:');
  console.log(`   Deployer: ${DEPLOYER_ADDRESS}`);
  console.log(`   Node RPC: ${NODE_RPC}`);
  console.log(`   Proof Server: ${PROOF_SERVER}`);
  console.log(`   Initial Balance: ${INITIAL_BALANCE}`);
  console.log(`   Quorum Threshold: ${QUORUM_THRESHOLD}`);
  console.log(`   Min Proposer Weight: ${MINIMUM_PROPOSER_WEIGHT}`);
  console.log(`   Execution Delay: ${EXECUTION_DELAY} blocks\n`);

  try {
    // Step 1: Load compiled contract
    console.log('📦 Loading compiled contract...');
    const contractPath = path.join(process.cwd(), 'build', 'PrivateDAOTreasury.compact');
    
    if (!existsSync(contractPath)) {
      throw new Error(
        `Compiled contract not found at ${contractPath}\n` +
        `Please run: compact compile PrivateDAOTreasury.compact --output ./build`
      );
    }

    const compiledContract = readFileSync(contractPath);
    console.log('✅ Contract loaded\n');

    // Step 2: Connect to Midnight node
    console.log('🔗 Connecting to Midnight node...');
    const provider = ledger.providers.NodeProvider({
      rpcUrl: NODE_RPC,
      proofServer: PROOF_SERVER
    });
    await provider.connect();
    console.log('✅ Connected to node\n');

    // Step 3: Prepare deployment transaction
    console.log('📝 Preparing deployment transaction...');
    const deploymentTx = await provider.deployContract({
      contract: compiledContract,
      deployer: DEPLOYER_ADDRESS,
      constructorArgs: [
        BigInt(INITIAL_BALANCE),      // initialBalance: Field
        BigInt(QUORUM_THRESHOLD),     // quorumThreshold: Field  
        BigInt(MINIMUM_PROPOSER_WEIGHT), // minimumProposerWeight: Field
        BigInt(EXECUTION_DELAY)       // executionDelay: Field
      ]
    });

    console.log('✅ Transaction prepared\n');

    // Step 4: Submit transaction
    console.log('📤 Submitting deployment transaction...');
    const result = await provider.submitTransaction(deploymentTx);
    console.log('✅ Transaction submitted\n');

    // Step 5: Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    const receipt = await provider.waitForTransaction(result.txHash);
    console.log('✅ Transaction confirmed!\n');

    // Step 6: Extract contract address
    const contractAddress = receipt.contractAddress;
    console.log('🎉 Deployment Successful!\n');
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🔗 Transaction Hash: ${result.txHash}\n`);

    // Step 7: Save deployment info
    const deploymentInfo: DeploymentResult = {
      contractAddress,
      transactionHash: result.txHash,
      deployedAt: new Date().toISOString(),
      constructorArgs: {
        initialBalance: INITIAL_BALANCE,
        quorumThreshold: QUORUM_THRESHOLD,
        minimumProposerWeight: MINIMUM_PROPOSER_WEIGHT,
        executionDelay: EXECUTION_DELAY
      }
    };

    const deploymentPath = path.join(process.cwd(), 'deployment.json');
    writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}\n`);

    // Update .env with contract address
    const envPath = path.join(process.cwd(), '.env');
    let envContent = readFileSync(envPath, 'utf-8');
    if (!envContent.includes('CONTRACT_ADDRESS=')) {
      envContent += `\n# Deployed contract\nCONTRACT_ADDRESS=${contractAddress}\n`;
      writeFileSync(envPath, envContent);
      console.log('✅ CONTRACT_ADDRESS added to .env\n');
    }

    console.log('✨ Next Steps:');
    console.log('   1. Register DAO members: npm run register-members');
    console.log('   2. Create proposals: npm run create-proposal');
    console.log('   3. Vote on proposals: npm run vote\n');

    await provider.disconnect();
    return deploymentInfo;

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Helper function
function existsSync(path: string): boolean {
  try {
    readFileSync(path);
    return true;
  } catch {
    return false;
  }
}

// Run deployment
deployContract().catch(console.error);
