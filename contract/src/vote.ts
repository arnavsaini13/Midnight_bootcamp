/**
 * Vote on a DAO Proposal
 * 
 * This script casts a PRIVATE vote on a proposal
 * Vote choice and weight remain hidden via zero-knowledge proofs
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
const voteYesArg = args.find(arg => arg.startsWith('--voteYes='));
const voterArg = args.find(arg => arg.startsWith('--voter='));

if (!proposalIdArg || !voteYesArg) {
  console.error('Usage: npm run vote -- --proposalId=<id> --voteYes=<true|false> [--voter=<address>]');
  console.error('Example: npm run vote -- --proposalId=1 --voteYes=true');
  process.exit(1);
}

const proposalId = BigInt(proposalIdArg.split('=')[1]);
const voteYes = voteYesArg.split('=')[1] === 'true';
const voter = voterArg ? voterArg.split('=')[1] : DEPLOYER_ADDRESS;

async function vote() {
  console.log('🗳️  Casting Private Vote...\n');

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

    console.log('📋 Vote Details:');
    console.log(`   Proposal ID: ${proposalId}`);
    console.log(`   Voter: ${voter?.substring(0, 20)}...`);
    console.log(`   Vote Choice: ${voteYes ? 'YES ✓' : 'NO ✗'} (PRIVATE - hidden via ZK proof)`);
    console.log(`   Vote Weight: PRIVATE (never revealed)`);
    console.log('');

    console.log('🔐 Privacy Guarantees:');
    console.log('   • Your vote choice will NEVER be publicly revealed');
    console.log('   • Your voting weight remains PRIVATE');
    console.log('   • Vote totals are computed in zero-knowledge');
    console.log('   • No one can verify how you voted (prevents vote buying)\n');

    console.log('📤 Submitting vote...');

    // Call vote function
    // voteYes parameter is marked with #[zk_on_secret_input]
    // Your vote remains permanently private
    const tx = await contract.call('vote', {
      from: voter,
      args: [
        proposalId,  // proposalId: Field (public)
        voteYes      // voteYes: Bool (PRIVATE via ZK proof)
      ]
    });

    console.log('✅ Vote transaction submitted\n');

    console.log('⏳ Waiting for confirmation...');
    const receipt = await provider.waitForTransaction(tx.txHash);
    console.log('✅ Vote recorded!\n');

    console.log(`🎉 Vote Cast Successfully!`);
    console.log(`🔗 Transaction: ${tx.txHash}\n`);

    console.log('📊 Current Status:');
    console.log(`   ✓ Your vote is recorded on-chain`);
    console.log(`   ✓ Vote choice remains PRIVATE`);
    console.log(`   ✓ No one can see how you voted`);
    console.log(`   ✓ Cannot change vote (immutable)\n`);

    console.log('✨ Next Steps:');
    console.log(`   • Other members can vote: npm run vote -- --proposalId=${proposalId} --voteYes=<true|false>`);
    console.log(`   • After deadline: npm run finalize -- --proposalId=${proposalId}\n`);

    await provider.disconnect();

  } catch (error: any) {
    console.error('❌ Vote failed:', error?.message || error);
    
    if (error?.message?.includes('already voted')) {
      console.error('\n💡 Note: You can only vote once per proposal');
    } else if (error?.message?.includes('not a member')) {
      console.error('\n💡 Note: Only registered members can vote');
      console.error('   Register first: npm run register-members');
    } else if (error?.message?.includes('deadline passed')) {
      console.error('\n💡 Note: Voting period has ended');
      console.error('   Finalize this proposal: npm run finalize');
    }
    
    process.exit(1);
  }
}

vote().catch(console.error);
