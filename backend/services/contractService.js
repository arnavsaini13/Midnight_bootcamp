import { Contract } from '../../build_working/contract/index.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class ContractService {
  constructor() {
    this.contract = null;
    this.deploymentInfo = null;
    this.state = {
      balance: '31330000000',
      members: [],
      proposals: [],
      quorum: '3'
    };
  }

  async initialize() {
    try {
      // Load local deployment info if exists
      const deploymentPath = join(__dirname, '../../LOCAL_DEPLOYMENT.json');
      if (existsSync(deploymentPath)) {
        this.deploymentInfo = JSON.parse(readFileSync(deploymentPath, 'utf-8'));
        console.log('✅ Loaded local deployment:', this.deploymentInfo.contractAddress);
        console.log('   Wallet:', this.deploymentInfo.walletAddress);
        console.log('   Deployed:', this.deploymentInfo.deployedAt);
      } else {
        console.log('⚠️  No local deployment found.');
        console.log('   Run: npx tsx deploy-local.ts');
      }
      
      // Initialize contract instance
      this.contract = new Contract({});
      console.log('✅ Contract service initialized');
      return true;
    } catch (error) {
      console.error('❌ Contract initialization failed:', error.message);
      return false;
    }
  }

  async getBalance() {
    return {
      balance: this.state.balance,
      formatted: `${parseFloat(this.state.balance) / 1e6} NIGHT`
    };
  }

  async getQuorum() {
    return {
      quorum: this.state.quorum,
      percentage: '10%'
    };
  }

  async getContractInfo() {
    return {
      name: 'PrivateDAO Treasury',
      version: '1.0.0',
      deployed: this.deploymentInfo ? true : false,
      contractAddress: this.deploymentInfo?.contractAddress || 'Not deployed locally',
      walletAddress: this.deploymentInfo?.walletAddress || 'N/A',
      deployedAt: this.deploymentInfo?.deployedAt || 'N/A',
      network: this.deploymentInfo?.network || 'undeployed',
      circuits: 8,
      functions: [
        'deposit',
        'getBalance',
        'registerMember',
        'createProposal',
        'voteYes',
        'voteNo',
        'executeProposal',
        'getProposal'
      ],
      features: [
        'Private Voting',
        'Hidden Proposal Amounts',
        'Commitment-based Privacy',
        'Timelock Execution',
        'ZK Proofs'
      ]
    };
  }

  async deductFromBalance(amount) {
    const currentBalance = BigInt(this.state.balance);
    const deductAmount = BigInt(amount);
    
    if (currentBalance < deductAmount) {
      throw new Error(`Insufficient treasury balance. Have: ${currentBalance}, Need: ${deductAmount}`);
    }
    
    this.state.balance = (currentBalance - deductAmount).toString();
    
    return {
      previousBalance: currentBalance.toString(),
      deducted: deductAmount.toString(),
      newBalance: this.state.balance,
      formatted: `${parseFloat(this.state.balance) / 1e6} NIGHT`
    };
  }

  async addToBalance(amount) {
    const currentBalance = BigInt(this.state.balance);
    const addAmount = BigInt(amount);
    
    this.state.balance = (currentBalance + addAmount).toString();
    
    return {
      previousBalance: currentBalance.toString(),
      added: addAmount.toString(),
      newBalance: this.state.balance,
      formatted: `${parseFloat(this.state.balance) / 1e6} NIGHT`
    };
  }
}

export default new ContractService();
