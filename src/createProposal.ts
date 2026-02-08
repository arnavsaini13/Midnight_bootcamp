/**
 * Create a DAO Proposal
 * 
 * This script creates a new proposal with PRIVATE amount and proposer identity
 * Uses commitment schemes to hide sensitive information during voting
 */

import * as ledger from '@midnight-ntwrk/ledger-v7';
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { randomBytes } from 'crypto';
import path from 'path';

config();

const {
  DEPLOYER_ADDRESS,
  CONTRACT_ADDRESS,
  NODE_RPC = 'ws://localhost:9944',
  PROOF_SERVER = 'http://localhost:6300'
} = process.env;

// Proposal parameters (customize these)
const PROPOSAL_CONFIG = {
  recipient: process.env.SHIELDED_ADDRESS!, // Who receives funds if passed
  amount: 5000n,                            // PRIVATE: Amount to transfer
  votingDuration: 100n,                     // PUBLIC: Blocks for voting period
};

interface ProposalSecrets {
  amountBlinding: string;
  proposerBlinding: string;
  amount: string;
  proposer: string;
}

async function createProposal() {
  console.log('📝 Creating DAO Proposal...\n');

  if (!CONTRACT_ADDRESS) {
    console.error('❌ CONTRACT_ADDRESS not found');
    process.exit(1);
  }

  try {
    // Generate random blinding factors for privacy
    console.log('🔐 Generating privacy blinding factors...');
    const amountBlinding = BigInt('0x' + randomBytes(32).toString('hex'));
    const proposerBlinding = BigInt('0x' + randomBytes(32).toString('hex'));
    console.log('✅ Privacy factors generated\n');

    // Connect to Midnight
    console.log('🔗 Connecting to Midnight node...');
    const provider = ledger.providers.NodeProvider({
      rpcUrl: NODE_RPC!,
      proofServer: PROOF_SERVER!
    });
    await provider.connect();
    console.log('✅ Connected\n');

    // Load contract
    const contract = await provider.getContract(CONTRACT_ADDRESS);

    console.log('📋 Proposal Details:');
    console.log(`   Recipient: ${PROPOSAL_CONFIG.recipient}`);
    console.log(`   Amount: ${PROPOSAL_CONFIG.amount} (PRIVATE - hidden via commitment)`);
    console.log(`   Voting Duration: ${PROPOSAL_CONFIG.votingDuration} blocks`);
    console.log(`   Proposer: ${DEPLOYER_ADDRESS?.substring(0, 20)}... (PRIVATE - hidden via commitment)\n`);

    console.log('📤 Submitting proposal...');
    
    // Call createProposal function
    // amount, amountBlinding, and proposerBlinding are marked with #[zk_on_secret_input]
    // They remain private via zero-knowledge proofs
    const tx = await contract.call('createProposal', {
      from: DEPLOYER_ADDRESS,
      args: [
        PROPOSAL_CONFIG.recipient,      // recipient: Address (public)
        PROPOSAL_CONFIG.amount,         // amount: Field (PRIVATE)
        PROPOSAL_CONFIG.votingDuration, // votingDuration: Field (public)
        amountBlinding,                 // amountBlinding: Field (PRIVATE witness)
        proposerBlinding                // proposerBlinding: Field (PRIVATE witness)
      ]
    });

    console.log('✅ Transaction submitted\n');

    console.log('⏳ Waiting for confirmation...');
    const receipt = await provider.waitForTransaction(tx.txHash);
    console.log('✅ Proposal created!\n');

    // Extract proposal ID from transaction result
    const proposalId = receipt.returnValue; // The function returns proposalId
    console.log(`🎉 Proposal ID: ${proposalId}`);
    console.log(`🔗 Transaction: ${tx.txHash}\n`);

    // Save proposal secrets for later execution
    // IMPORTANT: Keep these secret values safe! They're needed to execute the proposal
    const proposalSecrets: ProposalSecrets = {
      amountBlinding: amountBlinding.toString(),
      proposerBlinding: proposerBlinding.toString(),
      amount: PROPOSAL_CONFIG.amount.toString(),
      proposer: DEPLOYER_ADDRESS!
    };

    const secretsPath = path.join(process.cwd(), `proposal-${proposalId}-secrets.json`);
    writeFileSync(secretsPath, JSON.stringify(proposalSecrets, null, 2));
    console.log(`🔒 Proposal secrets saved to: ${secretsPath}`);
    console.log(`⚠️  KEEP THIS FILE SECRET - needed for execution!\n`);

    console.log('📊 Privacy Guarantees:');
    console.log('   ✓ Proposal amount is HIDDEN until execution');
    console.log('   ✓ Your identity as proposer is HIDDEN until execution');
    console.log('   ✓ Only recipient address and deadline are public\n');

    console.log('✨ Next Steps:');
    console.log(`   1. Members vote: npm run vote -- --proposalId ${proposalId}`);
    console.log(`   2. After deadline: npm run finalize -- --proposalId ${proposalId}`);
    console.log(`   3. After timelock: npm run execute -- --proposalId ${proposalId}\n`);

    await provider.disconnect();

  } catch (error) {
    console.error('❌ Proposal creation failed:', error);
    process.exit(1);
  }
}

createProposal().catch(console.error);
