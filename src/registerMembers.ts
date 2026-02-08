/**
 * Register DAO Members
 * 
 * This script registers members with their voting weights
 * Weight is kept private via zero-knowledge proofs
 */

import * as ledger from '@midnight-ntwrk/ledger-v7';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config();

const {
  DEPLOYER_ADDRESS,
  CONTRACT_ADDRESS,
  NODE_RPC = 'ws://localhost:9944',
  PROOF_SERVER = 'http://localhost:6300'
} = process.env;

interface Member {
  address: string;
  weight: number;
  role: string;
}

// Define your DAO members here
const MEMBERS: Member[] = [
  {
    address: process.env.DEPLOYER_ADDRESS!,
    weight: 50,
    role: 'Founder'
  },
  {
    address: process.env.SHIELDED_ADDRESS!,
    weight: 30,
    role: 'Core Contributor'
  },
  {
    address: process.env.DUST_ADDRESS!,
    weight: 20,
    role: 'Community Member'
  }
];

async function registerMembers() {
  console.log('👥 Registering DAO Members...\n');

  if (!CONTRACT_ADDRESS) {
    console.error('❌ CONTRACT_ADDRESS not found. Please deploy the contract first.');
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

    // Register each member
    for (const member of MEMBERS) {
      console.log(`📝 Registering: ${member.role}`);
      console.log(`   Address: ${member.address.substring(0, 20)}...`);
      console.log(`   Weight: ${member.weight} (PRIVATE)\n`);

      try {
        // Call registerMember function
        // weight parameter is marked with #[zk_on_secret_input] so it remains private
        const tx = await contract.call('registerMember', {
          from: DEPLOYER_ADDRESS,
          args: [
            member.address,    // member: Address (public)
            BigInt(member.weight)  // weight: Field (private via ZK proof)
          ]
        });

        const receipt = await provider.waitForTransaction(tx.txHash);
        console.log(`✅ Registered successfully!`);
        console.log(`   TX: ${tx.txHash.substring(0, 20)}...\n`);

      } catch (error) {
        console.error(`❌ Failed to register ${member.role}:`, error);
      }
    }

    console.log('🎉 Member registration complete!\n');
    console.log('📊 DAO Membership Summary:');
    console.log(`   Total Members: ${MEMBERS.length}`);
    console.log(`   Total Voting Weight: ${MEMBERS.reduce((sum, m) => sum + m.weight, 0)}`);
    console.log(`   Quroum Required: ${process.env.QUORUM_THRESHOLD || 100}\n`);

    console.log('✨ Next Steps:');
    console.log('   Create proposals: npm run create-proposal\n');

    await provider.disconnect();

  } catch (error) {
    console.error('❌ Registration failed:', error);
    process.exit(1);
  }
}

registerMembers().catch(console.error);
