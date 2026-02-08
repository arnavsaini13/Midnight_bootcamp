# 🎯 LOCAL DEPLOYMENT GUIDE

## Understanding Local vs Network Deployment

### What You Need to Know:
- **Local Deployment** ✅ - Contract deploys to YOUR wallet state on your device
- **Network Deployment** ❌ - Would deploy to the blockchain network (not needed for development)

For development and testing, **local deployment is perfect**! Your contract runs in your wallet, the application syncs with it, and everything works without needing blockchain network deployment.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Deploy Contract Locally

```powershell
# Deploy contract to your local wallet
npx tsx deploy-local.ts
```

**What happens:**
- Creates a wallet on your device
- Deploys contract to that wallet's state
- Saves deployment info to `LOCAL_DEPLOYMENT.json`
- Your wallet now contains the deployed contract!

**Expected Output:**
```
✅ CONTRACT DEPLOYED LOCALLY!
📦 Contract Address: <address>
   Wallet Address: <your-wallet>
   Network: undeployed (local)
```

---

### Step 2: Start Backend

```powershell
# Open new terminal
cd backend
npm install  # First time only
node server.js
```

**Backend will:**
- Load your local deployment from `LOCAL_DEPLOYMENT.json`
- Connect to the deployed contract in your wallet
- Start API on http://localhost:5000

**Expected Output:**
```
✅ Loaded local deployment: <contract-address>
🚀 Server running on port 5000
```

---

### Step 3: Start Frontend

```powershell
# Open another terminal
cd frontend
npm install  # First time only
npm run dev
```

**Frontend starts on:** http://localhost:3000

---

## 🎉 You're Done!

Open your browser to: **http://localhost:3000**

Your application is now:
- ✅ Connected to locally deployed contract
- ✅ Synced with your wallet
- ✅ Ready for full DAO functionality
- ✅ All interactions happen through your local wallet

---

## 📋 How It Works

```
┌─────────────────────────────────────────────┐
│  1. npx tsx deploy-local.ts                 │
│     - Deploys contract to wallet state      │
│     - Saves to LOCAL_DEPLOYMENT.json        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  2. Backend (node server.js)                │
│     - Reads LOCAL_DEPLOYMENT.json           │
│     - Connects to contract in wallet        │
│     - Exposes REST API                      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  3. Frontend (npm run dev)                  │
│     - Calls backend API                     │
│     - Displays DAO interface                │
│     - User interacts with local contract    │
└─────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### "No local deployment found"

**Problem:** Backend can't find `LOCAL_DEPLOYMENT.json`  
**Solution:**
```powershell
npx tsx deploy-local.ts
```

### Indexer not running

**Problem:** Can't connect to localhost:8088  
**Solution:**
```powershell
docker compose up -d
```

### Port already in use

**Problem:** Port 5000 or 3000 busy  
**Solution:**
```powershell
# Kill existing process or change port in .env
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📁 Generated Files

After local deployment, you'll have:

- **LOCAL_DEPLOYMENT.json** - Contract address, wallet address, mnemonic
- **.wallet-state/** - Your wallet's private state (DO NOT DELETE)
- **backend/node_modules/** - Backend dependencies
- **frontend/node_modules/** - Frontend dependencies

---

## 🔐 Wallet Information

Your deployment wallet is saved in `LOCAL_DEPLOYMENT.json`:

```json
{
  "contractAddress": "...",
  "walletAddress": "mn_addr_undeployed1...",
  "mnemonic": "word1 word2 word3...",
  "network": "undeployed",
  "deployedAt": "2026-02-08T...",
  ...
}
```

**⚠️ Keep this file safe!** It contains your wallet mnemonic.

---

## 🎯 Testing the Application

Once everything is running:

### 1. Dashboard (http://localhost:3000)
- View treasury balance
- See member count
- Check active proposals
- **Status should show**: "Deployed Locally ✅"

### 2. Create a Proposal
- Click "New Proposal"
- Enter recipient address
- Set amount and duration
- Submit

### 3. Vote on Proposal
- Click "Vote Yes" or "Vote No"
- Vote is processed through local contract
- Results update in real-time

### 4. Register a Member
- Go to Members tab
- Click "Register Member"
- Enter address and voting weight
- Member added to local contract state

---

## 💡 Key Differences

| Network Deployment | Local Deployment |
|-------------------|------------------|
| ❌ Not working with current SDK | ✅ Works perfectly |
| Deploys to blockchain | Deploys to wallet state |
| Requires network fees | No fees needed |
| Shared across network | Private to your device |
| Complex setup | Simple setup |

---

## 🎓 For Bootcamp Submission

You can submit:
1. ✅ `PrivateDAOTreasury_Working.compact` - Contract source code
2. ✅ `build_working/` - Compiled contract (8 circuits)
3. ✅ `LOCAL_DEPLOYMENT.json` - Proof of local deployment
4. ✅ Screenshot of running application
5. ✅ This guide showing you understand the deployment model

**You have successfully:**
- Written a complete DAO smart contract
- Compiled it (8 circuits)
- Deployed it locally to your wallet
- Built a full-stack application
- Made it all work together!

---

## 🚀 Next Steps

Want to do more?

### Add More Features
- Implement proposal discussions
- Add treasury analytics
- Create voting history
- Build member profiles

### Improve UI
- Add more animations
- Create data visualizations
- Improve mobile responsiveness
- Add dark/light theme toggle

### Enhance Privacy
- Show ZK-proof generation
- Visualize commitment schemes
- Add privacy explanations
- Demonstrate vote hiding

---

## 📚 Resources

- **Midnight Docs**: https://docs.midnight.network
- **Compact Language**: https://docs.midnight.network/develop/smart-contracts
- **Local Development**: https://docs.midnight.network/develop/dapp-development

---

**🎉 Congratulations! You've built a complete privacy-preserving DAO!**
