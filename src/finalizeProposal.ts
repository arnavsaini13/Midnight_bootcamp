/**
 * Finalize a DAO Proposal
 * 
 * This script finalizes voting after the deadline
 * Computes PASS/FAIL result using PRIVATE vote totals in zero-knowledge
 * Only the boolean result is revealed - vote totals remain private forever
 */

import * as ledger from '@midnight-ntwrk/ledger-v7';
import { config } from 'dotenv';

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
  console.error('Usage: npm run finalize -- --proposalId=<id>');
  console.error('Example: npm run finalize -- --proposalId=1');
  process.exit(1);
}

const proposalId = BigInt(proposalIdArg.split('=')[1]);

async function finalizeProposal() {
  console.log('🏁 Finalizing DAO Proposal...\n');

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

    console.log('📋 Finalization Details:');
    console.log(`   Proposal ID: ${proposalId}`);
    console.log(`   Finalizer: ${DEPLOYER_ADDRESS?.substring(0, 20)}...\n`);

    console.log('🔐 Privacy-Preserving Vote Tallying:');
    console.log('   • Vote totals computed in ZERO-KNOWLEDGE');
    console.log('   • Quorum checked against snapshot (prevents manipulation)');
    console.log('   • Only PASS/FAIL result will be revealed');
    console.log('   • Vote totals remain PRIVATE forever\n');

    // First, get current block to check if deadline has passed
    console.log('⏰ Checking voting deadline...');
    const currentBlock = await provider.getBlockNumber();
    console.log(`   Current Block: ${currentBlock}\n`);

    console.log('📤 Submitting finalization...');

    // Call finalizeProposal function
    // This function computes the vote result using PRIVATE vote totals
    // Zero-knowledge circuits prove the result is correct without revealing vote counts
    const tx = await contract.call('finalizeProposal', {
      from: DEPLOYER_ADDRESS,
      args: [
        proposalId  // proposalId: Field
      ]
    });

    console.log('✅ Finalization transaction submitted\n');

    console.log('⏳ Computing vote result in zero-knowledge...');
    const receipt = await provider.waitForTransaction(tx.txHash);
    console.log('✅ Vote result computed!\n');

    // Get the proposal to see if it passed
    console.log('📊 Querying final result...');
    const proposal = await contract.query('getProposal', [proposalId]);
    
    const passed = proposal.passed;
    const isFinalized = proposal.isFinalized;

    console.log('🎉 Finalization Complete!\n');

    console.log('📋 Results:');
    console.log(`   Status: ${isFinalized ? 'FINALIZED ✓' : 'NOT FINALIZED ✗'}`);
    console.log(`   Outcome: ${passed ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log(`   Transaction: ${tx.txHash.substring(0, 20)}...\n`);

    console.log('🔒 Privacy Preserved:');
    console.log(`   • YES vote total: PRIVATE (never revealed)`);
    console.log(`   • NO vote total: PRIVATE (never revealed)`);
    console.log(`   • Individual votes: PRIVATE (never revealed)`);
    console.log(`   • Public info: Only PASS/FAIL boolean\n`);

    if (passed) {
      const executionBlock = proposal.executionEligibleBlock;
      console.log('✨ Next Steps:');
      console.log(`   ⏰ Execution eligible at block: ${executionBlock}`);
      console.log(`   🕒 Current block: ${currentBlock}`);
      console.log(`   ⏳ Blocks to wait: ${Math.max(0, Number(executionBlock) - currentBlock)}`);
      console.log(`   🚀 Execute: npm run execute -- --proposalId=${proposalId}\n`);
    } else {
      console.log('❌ Proposal Failed:');
      console.log('   • Did not meet quorum threshold, OR');
      console.log('   • More NO votes than YES votes\n');
      console.log('   This proposal cannot be executed.\n');
    }

    await provider.disconnect();

  } catch (error: any) {
    console.error('❌ Finalization failed:', error?.message || error);
    
    if (error?.message?.includes('deadline not passed')) {
      console.error('\n💡 Note: Voting deadline has not yet passed');
      console.error('   Wait for the voting period to end before finalizing');
    } else if (error?.message?.includes('already finalized')) {
      console.error('\n💡 Note: This proposal has already been finalized');
      console.error(`   Query status: npm run query -- --proposalId=${proposalId}`);
    } else if (error?.message?.includes('does not exist')) {
      console.error('\n💡 Note: Proposal does not exist');
      console.error('   Check the proposal ID and try again');
    }
    
    process.exit(1);
  }
}

finalizeProposal().catch(console.error);
