/**
 * Query DAO Proposal Status
 * 
 * This script queries PUBLIC information about a proposal
 * PRIVATE data (vote totals, individual votes, vote weights) is never revealed
 */

import * as ledger from '@midnight-ntwrk/ledger-v7';
import { config } from 'dotenv';

config();

const {
  CONTRACT_ADDRESS,
  NODE_RPC = 'ws://localhost:9944',
  PROOF_SERVER = 'http://localhost:6300'
} = process.env;

// Command line arguments
const args = process.argv.slice(2);
const proposalIdArg = args.find(arg => arg.startsWith('--proposalId='));

if (!proposalIdArg) {
  console.error('Usage: npm run query -- --proposalId=<id>');
  console.error('Example: npm run query -- --proposalId=1');
  process.exit(1);
}

const proposalId = BigInt(proposalIdArg.split('=')[1]);

async function queryProposal() {
  console.log('🔍 Querying DAO Proposal...\n');

  if (!CONTRACT_ADDRESS) {
    console.error('❌ CONTRACT_ADDRESS not found');
    process.exit(1);
  }

  try {
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

    // Query proposal
    console.log('📊 Fetching proposal data...');
    const proposal = await contract.query('getProposal', [proposalId]);
    const currentBlock = await provider.getBlockNumber();
    console.log('✅ Data retrieved\n');

    // Display public information
    console.log('═══════════════════════════════════════════════════');
    console.log(`           PROPOSAL #${proposalId} STATUS`);
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📋 PUBLIC INFORMATION:\n');

    console.log('🎯 Basic Details:');
    console.log(`   Recipient: ${proposal.recipient}`);
    console.log(`   Created at Block: ${proposal.createdAtBlock}`);
    console.log(`   Voting Deadline: Block ${proposal.votingDeadline}`);
    console.log(`   Execution Eligible: Block ${proposal.executionEligibleBlock}`);
    console.log(`   Current Block: ${currentBlock}\n`);

    console.log('📊 Status:');
    console.log(`   Is Finalized: ${proposal.isFinalized ? '✅ YES' : '❌ NO'}`);
    console.log(`   Passed: ${proposal.passed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Executed: ${proposal.executed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Active: ${proposal.isActive ? '✅ YES' : '❌ NO'}\n`);

    console.log('⏰ Timeline:');
    const votingOpen = currentBlock < proposal.votingDeadline;
    const finalizationReady = currentBlock >= proposal.votingDeadline && !proposal.isFinalized;
    const executionReady = proposal.isFinalized && proposal.passed && currentBlock >= proposal.executionEligibleBlock && !proposal.executed;
    
    if (votingOpen) {
      const blocksRemaining = Number(proposal.votingDeadline) - currentBlock;
      console.log(`   🗳️  Voting OPEN (${blocksRemaining} blocks remaining)`);
      console.log(`   Next: Cast votes with 'npm run vote'`);
    } else if (finalizationReady) {
      console.log(`   🏁 Ready for Finalization`);
      console.log(`   Next: npm run finalize -- --proposalId=${proposalId}`);
    } else if (executionReady) {
      console.log(`   ⚡ Ready for Execution`);
      console.log(`   Next: npm run execute -- --proposalId=${proposalId}`);
    } else if (proposal.executed) {
      console.log(`   ✅ Fully Executed`);
    } else if (proposal.isFinalized && !proposal.passed) {
      console.log(`   ❌ Failed (did not pass)`);
    } else if (!proposal.isActive) {
      console.log(`   ⏸️  Inactive`);
    }
    console.log('');

    console.log('🔒 PRIVATE INFORMATION (NEVER REVEALED):\n');
    console.log('   ❌ Proposal Amount: HIDDEN (revealed only at execution)');
    console.log('   ❌ Proposer Identity: HIDDEN (revealed only at execution)');
    console.log('   ❌ YES Vote Total: PERMANENTLY PRIVATE');
    console.log('   ❌ NO Vote Total: PERMANENTLY PRIVATE');
    console.log('   ❌ Individual Votes: PERMANENTLY PRIVATE');
    console.log('   ❌ Vote Weights: PERMANENTLY PRIVATE\n');

    console.log('═══════════════════════════════════════════════════\n');

    console.log('💡 Privacy Explanation:');
    console.log('   The Midnight Protocol ensures that sensitive voting');
    console.log('   information remains private through zero-knowledge proofs.');
    console.log('   Only the final PASS/FAIL result is publicly visible.\n');

    if (proposal.isFinalized && !proposal.executed && proposal.passed) {
      console.log('⚠️  Note: This proposal passed but has not been executed yet.');
      console.log(`   Timelock expires at block ${proposal.executionEligibleBlock}`);
      console.log(`   Current block: ${currentBlock}\n`);
    }

    await provider.disconnect();

  } catch (error: any) {
    console.error('❌ Query failed:', error?.message || error);
    
    if (error?.message?.includes('does not exist')) {
      console.error('\n💡 Note: Proposal does not exist');
      console.error('   Check the proposal ID and try again');
    }
    
    process.exit(1);
  }
}

queryProposal().catch(console.error);
