# Manual Deployment Guide - PrivateDAO Treasury

## 🎯 What You're Deploying

**Contract:** PrivateDAOTreasury_Working.compact  
**Location:** `C:\risein\Midnight_bootcamp\build_working\contract\`  
**Your Wallet:** `mn_addr_undeployed13mlltk36vafmkk4ukm0cx9yn7kknuy50wtem8c9364kf7tqlv69st5eumy`

**8 Working Circuits:**
- ✅ deposit() - Add funds to treasury
- ✅ getBalance() - Check treasury balance
- ✅ registerMember(weight) - Add DAO member with voting power
- ✅ createProposal(recipient, amount, deadline) - Create new proposal
- ✅ voteYes(proposalId) - Vote yes on proposal
- ✅ voteNo(proposalId) - Vote no on proposal  
- ✅ executeProposal(proposalId) - Execute passed proposal
- ✅ getProposal(proposalId) - Query proposal details

---

## 📋 Method 1: Deploy via Midnight Wallet Browser Extension

### Step 1: Open Midnight Wallet
1. Open your browser with Midnight wallet extension
2. Unlock your wallet with your password
3. Confirm you see your address: `mn_addr_undeployed13mlltk36vafmkk4ukm0cx9yn7kknuy50wtem8c9364kf7tqlv69st5eumy`
4. Check your balance is showing (should have funds from recent funding)

### Step 2: Navigate to Contract Deployment
1. Look for "Deploy Contract" or "Smart Contracts" section
2. Click "Deploy New Contract" or similar button

### Step 3: Select Contract Files
**Main contract file:**
```
C:\risein\Midnight_bootcamp\build_working\contract\index.js
```

**Additional files (if asked):**
- Type definitions: `C:\risein\Midnight_bootcamp\build_working\contract\index.d.ts`
- Keys folder: `C:\risein\Midnight_bootcamp\build_working\keys\`

### Step 4: Enter Constructor Arguments
The contract constructor needs 2 parameters:

**Parameter 1 - initialBalance:**
```
1000000
```
*(This is the treasury's starting balance - virtual money, not from your wallet)*

**Parameter 2 - quorum:**
```
100
```
*(Minimum votes needed to pass a proposal)*

### Step 5: Review & Deploy
1. **Review the gas estimate** - should be very low on local network
2. **Confirm deployment transaction**
3. **Wait for confirmation** (~5-10 seconds)

### Step 6: Save Contract Address
After deployment, you'll get a contract address like:
```
mn_contract_undeployed1...
```

**Save this address!** You'll need it to interact with your DAO.

---

## 📋 Method 2: Deploy via Midnight CLI (If Wallet UI Unavailable)

### Check if you have midnight CLI tools:

```powershell
# Check for midnight tools
wsl -e bash -c "which midnight-cli"
```

If available, deployment command would be:
```bash
midnight-cli deploy \
  --contract ./build_working/contract/index.js \
  --network ws://localhost:9944 \
  --wallet mn_addr_undeployed13mlltk36vafmkk4ukm0cx9yn7kknuy50wtem8c9364kf7tqlv69st5eumy \
  --args "initialBalance=1000000,quorum=100"
```

---

## 📋 Method 3: Using the Midnight Local Network Scripts

Since you have the midnight-local-network folder, you might be able to:

1. **Copy your contract to their deployment location:**
```powershell
# Navigate to midnight-local-network
cd "C:\Users\Arnav Saini\midnight-local-network"

# Check if they have deployment scripts
Get-ChildItem src/*.ts | Select-Object Name
```

2. **Look for deployment examples** in their src/ folder
3. **Adapt their deployment pattern** for your contract

---

## 🔍 After Deployment - Test Your Contract

Once deployed, test each function:

### 1. Check Initial Balance
```typescript
// Should return 1000000
await contract.getBalance()
```

### 2. Register Yourself as Member
```typescript
// Register with voting weight 50
await contract.registerMember(50)
```

### 3. Create Test Proposal
```typescript
// Propose sending 100 tokens to test address
await contract.createProposal(
  recipientAddress,  // Your test address
  100,               // Amount
  1000               // Deadline (block number)
)
// Returns: proposalId (should be 1)
```

### 4. Vote on Proposal
```typescript
// Vote yes on proposal 1
await contract.voteYes(1)
```

### 5. Execute Proposal (after quorum met)
```typescript
await contract.executeProposal(1)
```

---

## ⚠️ Important Notes

**About Your Wallet Balance:**
- ✅ Deployment uses MINIMAL gas (very cheap on local network)
- ✅ The 1,000,000 treasury balance is VIRTUAL (created by contract)
- ✅ Your wallet funds are NOT transferred to the contract
- ✅ Only gas fees are deducted (typically less than 0.01% of your balance)

**Network Configuration:**
- Network: Local (ws://localhost:9944)
- Node: Running in Docker (confirmed healthy)
- Indexer: http://localhost:8088
- Proof Server: http://localhost:6300

**What Happens on Deployment:**
1. Contract bytecode is uploaded to blockchain ✅
2. Constructor runs with your parameters ✅
3. Contract gets an address (mn_contract_undeployed1...) ✅
4. You can now call its functions ✅

---

## 🆘 Troubleshooting

**If wallet doesn't show "Deploy" option:**
- Some wallet versions might not have UI deployment
- Use Method 3 (scripts) instead
- Or I can help create a custom deployment script

**If gas estimate seems high:**
- Local network should have very low gas
- If it's more than 1% of balance, STOP and let me know
- Something might be misconfigured

**If deployment fails:**
- Check Docker containers are running: `docker ps`
- Check wallet is connected to local network (not testnet)
- Verify contract files exist in build_working/

---

## 📝 What Information to Collect

After successful deployment, save these:

1. **Contract Address:** `mn_contract_undeployed1...`
2. **Transaction Hash:** `0x...`
3. **Block Number:** When it was deployed
4. **Gas Used:** How much it cost

I can help you create a deployment.json file with this info once done!

---

## 🎯 Next Steps After Deployment

1. **Test basic functions** (getBalance, registerMember)
2. **Register 2-3 test members** with different voting weights
3. **Create a test proposal** for a small amount
4. **Have members vote** (use voteYes/voteNo)
5. **Execute the proposal** if it passes

Your DAO Treasury will be fully functional! 🚀

---

## ❓ Questions?

Let me know:
- Which method you're trying
- What you see in your wallet UI
- If you need help with any step
- If you want me to create a custom deployment script

I'm here to help - and your wallet funds are safe! 🛡️
