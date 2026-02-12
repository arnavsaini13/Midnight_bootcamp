/**
 * Execute a DAO Proposal
 * 
 * This script executes a passed proposal after the timelock expires
 * Reveals the PRIVATE amount and uses secrets to prove commitment integrity
 */

import * as ledger from '@midnight-ntwrk/ledger-v7';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';

config();

const {
  DEPLOYER_ADDRESS,
  CONTRACT_ADDRESS,
  NODE_RPC = 'ws://localhost:9944',
  PROOF_SERVER = 'http://localhost:6300'
} = process.env;

// Command line arguments
const args = process.argv.slice(2);
const proposalIdArg = args.find(arg => arg.startsWith('--proposalId='));

if (!proposalIdArg) {
  console.error('Usage: npm run execute -- --proposalId=<id>');
  console.error('Example: npm run execute -- --proposalId=1');
  process.exit(1);
}

const proposalId = BigInt(proposalIdArg.split('=')[1]);

interface ProposalSecrets {
  amountBlinding: string;
  proposerBlinding: string;
  amount: string;
  proposer: string;
}

async function executeProposal() {
  console.log('⚡ Executing DAO Proposal...\n');

  if (!CONTRACT_ADDRESS) {
    console.error('❌ CONTRACT_ADDRESS not found');
    process.exit(1);
  }

  try {
    // Load proposal secrets
    console.log('🔓 Loading proposal secrets...');
    const secretsPath = path.join(process.cwd(), `proposal-${proposalId}-secrets.json`);
    
    let secrets: ProposalSecrets;
    try {
      const secretsData = readFileSync(secretsPath, 'utf-8');
      secrets = JSON.parse(secretsData);
    } catch (error) {
      console.error(`❌ Cannot load secrets from: ${secretsPath}`);
      console.error('   This file was created when you ran: npm run create-proposal');
      console.error('   Make sure you have the correct proposal ID\n');
      process.exit(1);
    }
    console.log('✅ Secrets loaded\n');

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

    console.log('📋 Execution Details:');
    console.log(`   Proposal ID: ${proposalId}`);
    console.log(`   Executor: ${DEPLOYER_ADDRESS?.substring(0, 20)}...`);
    console.log(`   Amount: ${secrets.amount} (was PRIVATE, now being revealed)`);
    console.log(`   Proposer: ${secrets.proposer.substring(0, 20)}... (was PRIVATE, now being revealed)\n`);

    // Check current block vs execution eligible block
    console.log('⏰ Checking timelock...');
    const currentBlock = await provider.getBlockNumber();
    const proposal = await contract.query('getProposal', [proposalId]);
    const executionEligibleBlock = proposal.executionEligibleBlock;
    
    console.log(`   Current Block: ${currentBlock}`);
    console.log(`   Execution Eligible: ${executionEligibleBlock}`);
    
    if (currentBlock < executionEligibleBlock) {
      const blocksToWait = Number(executionEligibleBlock) - currentBlock;
      console.error(`\n❌ Timelock not expired yet!`);
      console.error(`   Need to wait ${blocksToWait} more blocks`);
      console.error(`   This prevents rushed execution and allows for emergency intervention\n`);
      process.exit(1);
    }
    console.log('✅ Timelock expired\n');

    console.log('🔐 Zero-Knowledge Proof Generation:');
    console.log('   • Proving amount matches original commitment');
    console.log('   • Proving proposer identity matches original commitment');
    console.log('   • Using secret blinding factors as witnesses\n');

    console.log('📤 Submitting execution transaction...');

    // Call executeProposal function
    // Secrets are used to prove commitment integrity via zero-knowledge proofs
    const tx = await contract.call('executeProposal', {
      from: DEPLOYER_ADDRESS,
      args: [
        proposalId,                      // proposalId: Field
        BigInt(secrets.amount),          // amount: Field (PRIVATE witness)
        BigInt(secrets.amountBlinding),  // amountBlinding: Field (PRIVATE witness)
        secrets.proposer,                // proposer: Address (PRIVATE witness)
        BigInt(secrets.proposerBlinding) // proposerBlinding: Field (PRIVATE witness)
      ]
    });

    console.log('✅ Execution transaction submitted\n');

    console.log('⏳ Transferring funds...');
    const receipt = await provider.waitForTransaction(tx.txHash);
    console.log('✅ Funds transferred!\n');

    console.log('🎉 Proposal Executed Successfully!\n');

    console.log('📊 Execution Summary:');
    console.log(`   Amount Transferred: ${secrets.amount}`);
    console.log(`   Recipient: ${proposal.recipient}`);
    console.log(`   Proposer: ${secrets.proposer.substring(0, 20)}...`);
    console.log(`   Transaction: ${tx.txHash}\n`);

    console.log('🔒 Privacy During Lifecycle:');
    console.log('   📝 Creation: Amount & proposer HIDDEN via commitments');
    console.log('   🗳️  Voting: All votes PRIVATE via ZK proofs');
    console.log('   🏁 Finalization: Only PASS/FAIL revealed, totals PRIVATE');
    console.log('   ⚡ Execution: Amount & proposer revealed, but votes STILL PRIVATE\n');

    console.log('✅ Complete Privacy Achieved:');
    console.log('   • Individual votes: PERMANENTLY PRIVATE');
    console.log('   • Vote totals: PERMANENTLY PRIVATE');
    console.log('   • Execution details: Revealed only after timelock\n');

    console.log('✨ Query final state:');
    console.log(`   npm run query -- --proposalId=${proposalId}\n`);

    await provider.disconnect();

  } catch (error: any) {
    console.error('❌ Execution failed:', error?.message || error);
    
    if (error?.message?.includes('not finalized')) {
      console.error('\n💡 Note: Proposal must be finalized first');
      console.error(`   Run: npm run finalize -- --proposalId=${proposalId}`);
    } else if (error?.message?.includes('not passed')) {
      console.error('\n💡 Note: Only passed proposals can be executed');
      console.error('   This proposal did not meet quorum or majority');
    } else if (error?.message?.includes('already executed')) {
      console.error('\n💡 Note: This proposal has already been executed');
      console.error('   Each proposal can only be executed once');
    } else if (error?.message?.includes('commitment mismatch')) {
      console.error('\n💡 Note: Invalid secrets provided');
      console.error('   The secrets do not match the original commitments');
      console.error('   Make sure you are using the correct proposal-X-secrets.json file');
    }
    
    process.exit(1);
  }
}

executeProposal().catch(console.error);
