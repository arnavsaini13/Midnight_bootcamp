# PrivateDAO Treasury - Deployment Instructions

## 🎯 Overview

This guide walks you through deploying your privacy-preserving DAO Treasury contract to Midnight's local network.

---

## 📋 Prerequisites Checklist

✅ **Docker containers running:**
```powershell
docker ps
# Should show: node, proof-server, indexer (all healthy)
```

✅ **Wallet funded:**
- Your unshielded address has funds for deployment fees
- Check balance in Lace Midnight Preview Wallet

✅ **Environment ready:**
- Node.js and npm installed
- midnight-local-network repository accessible

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Compact CLI

The Compact CLI is needed to compile your `.compact` contract file.

**Option A: Download from GitHub**
```powershell
# Visit: https://github.com/midnightntwrk/compact/releases
# Download: compact-v0.2.0 for Windows
# Extract and add to PATH
```

**Option B: Install via Cargo (if you have Rust)**
```powershell
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
```

**Verify installation:**
```powershell
compact --version
# Should output: compact 0.2.0
```

---

### Step 2: Compile the Contract

```powershell
cd C:\risein\Midnight_bootcamp

# Compile the contract
compact compile PrivateDAOTreasury.compact --output ./build

# Should create: ./build/PrivateDAOTreasury.compact (compiled bytecode)
```

**Expected output:**
```
✓ Compiling PrivateDAOTreasury.compact...
✓ Generating zero-knowledge circuits...
✓ Contract compiled successfully
✓ Output: ./build/PrivateDAOTreasury.compact
```

---

### Step 3: Setup Environment

```powershell
# Copy environment template
copy .env.example .env

# Edit .env and verify your wallet addresses are correct
notepad .env
```

**Your .env should contain:**
```env
DEPLOYER_ADDRESS=mn_addr_undeployed13mlltk36vafmkk4ukm0cx9yn7kknuy50wtem8c9364kf7tqlv69st5eumy
SHIELDED_ADDRESS=mn_shield-addr_undeployed12tyaj99cklwd3nftvpvxxn3rpkgmhjs8d7wr794z6x7m5frdv9n4w45w2qguju0wngc6wm7m6saps9f7097952vxvufzxeyt84836yg2tnz4n
DUST_ADDRESS=mn_dust_undeployed1wvl7n329mzqah2kgk730yy7dlwxhrzvuavkez9phsks2fkqhnuxzszs8x7x

NODE_RPC=ws://localhost:9944
INDEXER_URL=http://localhost:8088
PROOF_SERVER=http://localhost:6300

INITIAL_BALANCE=1000000
QUORUM_THRESHOLD=100
MINIMUM_PROPOSER_WEIGHT=10
EXECUTION_DELAY=10
```

---

### Step 4: Install Dependencies

```powershell
npm install
```

This installs:
- Midnight SDK (`@midnight-ntwrk/ledger-v7`)
- Wallet SDK (`@midnight-ntwrk/wallet-sdk-facade`)
- Compact runtime
- TypeScript utilities

---

### Step 5: Deploy the Contract

```powershell
npm run deploy
```

**What happens:**
1. ✅ Loads compiled contract from `./build/`
2. ✅ Connects to Midnight node at `ws://localhost:9944`
3. ✅ Submits deployment transaction with constructor parameters:
   - `initialBalance`: 1,000,000 (private)
   - `quorumThreshold`: 100
   - `minimumProposerWeight`: 10
   - `executionDelay`: 10 blocks
4. ✅ Waits for confirmation
5. ✅ Saves contract address to `deployment.json` and `.env`

**Expected output:**
```
🚀 Starting PrivateDAO Treasury Deployment...

📦 Loading compiled contract...
✅ Contract loaded

🔗 Connecting to Midnight node...
✅ Connected to node

📝 Preparing deployment transaction...
✅ Transaction prepared

📤 Submitting deployment transaction...
✅ Transaction submitted

⏳ Waiting for confirmation...
✅ Transaction confirmed!

🎉 Deployment Successful!

📍 Contract Address: mn_contract_undeployed1abc...
🔗 Transaction Hash: 0x123...

💾 Deployment info saved to: deployment.json
✅ CONTRACT_ADDRESS added to .env
```

---

### Step 6: Register DAO Members

```powershell
npm run register-members
```

This registers three members (defined in `src/registerMembers.ts`):
- **Founder** (your unshielded address): Weight 50
- **Core Contributor** (your shielded address): Weight 30  
- **Community Member** (your dust address): Weight 20

**Total Voting Weight:** 100 (meets quorum threshold)

**Privacy Note:** Voting weights are kept PRIVATE via `#[zk_on_secret_input]`

---

### Step 7: Create a Test Proposal

```powershell
npm run create-proposal
```

**What this does:**
- Creates a proposal to send 5,000 tokens to your shielded address
- Amount is HIDDEN via Poseidon hash commitment
- Your proposer identity is HIDDEN via commitment
- Generates random blinding factors for privacy
- Saves secrets to `proposal-1-secrets.json` (⚠️ keep this file secret!)

**Expected output:**
```
📝 Creating DAO Proposal...

🔐 Generating privacy blinding factors...
✅ Privacy factors generated

📋 Proposal Details:
   Recipient: mn_shield-addr_...
   Amount: 5000 (PRIVATE - hidden via commitment)
   Voting Duration: 100 blocks

🎉 Proposal ID: 1
🔗 Transaction: 0x456...

🔒 Proposal secrets saved to: proposal-1-secrets.json
⚠️  KEEP THIS FILE SECRET - needed for execution!

📊 Privacy Guarantees:
   ✓ Proposal amount is HIDDEN until execution
   ✓ Your identity as proposer is HIDDEN until execution
   ✓ Only recipient address and deadline are public
```

---

### Step 8: Vote on the Proposal

Each member votes with their PRIVATE vote choice:

```powershell
# Vote YES from different accounts
npm run vote -- --proposalId 1 --voteYes true

# Vote NO
npm run vote -- --proposalId 1 --voteYes false
```

**Privacy Guarantees:**
- ✓ Vote choice (YES/NO) remains PRIVATE forever
- ✓ Voting weight remains PRIVATE
- ✓ Vote totals are NEVER revealed publicly
- ✓ Cannot verify how someone else voted (prevents vote buying)

---

### Step 9: Finalize the Proposal

After the voting deadline (100 blocks):

```powershell
npm run finalize -- --proposalId 1
```

**What happens:**
- Computes vote result using PRIVATE vote totals (in zero-knowledge)
- Uses snapshot quorum from proposal creation (prevents manipulation)
- Reveals ONLY the boolean PASS/FAIL result
- Vote totals remain PRIVATE forever

---

### Step 10: Execute the Proposal

After the timelock expires (10 blocks after finalization):

```powershell
npm run execute -- --proposalId 1
```

**What happens:**
- Uses secrets from `proposal-1-secrets.json` to prove:
  - Amount matches original commitment
  - Proposer identity matches original commitment
- Transfers funds to recipient
- Amount is revealed ONLY at execution time

---

## 🧪 Testing the Full Governance Flow

Run the complete flow:

```powershell
# 1. Deploy
npm run deploy

# 2. Register members
npm run register-members

# 3. Create proposal
npm run create-proposal

# 4. Vote (do this with different members)
npm run vote -- --proposalId 1 --voteYes true

# 5. Wait for voting deadline (or fast-forward blocks)
# ... wait 100 blocks ...

# 6. Finalize
npm run finalize -- --proposalId 1

# 7. Wait for timelock expiration
# ... wait 10 blocks ...

# 8. Execute
npm run execute -- --proposalId 1

# 9. Query final status
npm run query -- --proposalId 1
```

---

## 📊 Query Proposal Status

```powershell
npm run query -- --proposalId 1
```

Returns PUBLIC information only:
- Recipient address
- Creation block
- Deadline
- Execution eligible block  
- Is finalized?
- Passed?
- Executed?
- Active?

**Does NOT reveal:** Amount, proposer, vote totals, individual votes

---

## 🎓 For Bootcamp Submission

### Required Screenshots:

1. ✅ **Docker containers running**
   ```powershell
   docker ps
   ```

2. ✅ **Contract compilation**
   ```powershell
   compact compile PrivateDAOTreasury.compact --output ./build
   ```

3. ✅ **Deployment success**
   - Screenshot of `npm run deploy` output showing contract address

4. ✅ **Member registration**
   - Screenshot of `npm run register-members`

5. ✅ **Full governance flow**
   - Create proposal
   - Vote
   - Finalize
   - Execute

6. ✅ **Final contract state**
   - Query proposal status showing executed proposal

### Code Submission:

Include these files:
- `PrivateDAOTreasury.compact` (your contract)
- `README.md` (project documentation)
- `src/deploy.ts` (deployment script)
- `src/registerMembers.ts`
- `src/createProposal.ts`
- `src/vote.ts`
- `src/finalizeProposal.ts`
- `src/executeProposal.ts`
- `deployment.json` (deployment record)

---

## 🔧 Troubleshooting

**Issue: "compact: command not found"**
```powershell
# Check PATH or use full path
C:\path\to\compact.exe compile PrivateDAOTreasury.compact
```

**Issue: "Cannot connect to node"**
```powershell
# Verify Docker containers are running
docker ps

# Check node is accessible
curl http://localhost:9944
```

**Issue: "Insufficient funds"**
```powershell
# Fund your wallet from midnight-local-network
cd C:\Users\Arnav Saini\midnight-local-network
npm run fund -- YOUR_ADDRESS
```

**Issue: "Proposal execution too early"**
- Wait for execution delay to expire (10 blocks after finalization)
- Check current block number vs executionEligibleBlock

---

## 📚 Additional Resources

- [Midnight Documentation](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/develop/compact/)
- [Your README.md](./README.md) - Detailed contract documentation

---

## ✨ Privacy Guarantees Summary

Your PrivateDAO Treasury provides industry-leading privacy:

| Feature | Privacy Level | Mechanism |
|---------|--------------|-----------|
| **Proposal Amount** | Hidden until execution | Poseidon hash commitment |
| **Proposer Identity** | Hidden until execution | Commitment scheme |
| **Vote Choice** | Permanently private | Zero-knowledge proofs |
| **Vote Weight** | Permanently private | Private state computation |
| **Vote Totals** | Permanently private | Never exposed publicly |
| **Final Result** | Public | Only PASS/FAIL boolean |

---

Good luck with your bootcamp submission! 🎉
