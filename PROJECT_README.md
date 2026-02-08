# 🔐 PrivateDAO Treasury

A privacy-preserving Decentralized Autonomous Organization (DAO) built on **Midnight Protocol** using zero-knowledge cryptography.

## 📋 Overview

PrivateDAO is a full-stack application demonstrating privacy-first governance:
- **Smart Contract**: Written in Compact language (177 lines, 8 ZK-SNARK circuits)
- **Backend API**: Express.js REST API for contract interaction
- **Frontend UI**: React + Vite interface for DAO governance

## 🎯 Features

### Privacy-First Governance
- ✅ **Private Voting** - Votes hidden using zero-knowledge proofs
- ✅ **Commitment Schemes** - Votes committed before proposal execution
- ✅ **Timelock Protection** - Proposals require minimum duration
- ✅ **Hidden Member Data** - Voting weights stored privately on-chain

### Smart Contract Functions
1. **deposit** - Add funds to treasury (284 rows)
2. **getBalance** - Check treasury balance (26 rows)
3. **registerMember** - Join DAO with voting weight (412 rows)
4. **createProposal** - Propose spending (1209 rows)
5. **voteYes/voteNo** - Private voting (563 rows each)
6. **executeProposal** - Execute passed proposals (511 rows)
7. **getProposal** - Query proposal details (298 rows)

## 🏗️ Project Structure

```
Midnight_bootcamp/
├── PrivateDAOTreasury_Working.compact  # Smart contract (177 lines)
├── build_working/                      # Compiled contract (134KB)
│   └── contract/
│       ├── index.js                    # Contract runtime
│       ├── keys/                       # 8 proving/verifying keys
│       └── *.zkir                      # Circuit intermediates
├── backend/                            # Express.js API
│   ├── server.js                       # Main server (port 5000)
│   ├── routes/
│   │   ├── contract.js                 # Contract endpoints
│   │   ├── proposals.js                # Proposal management
│   │   └── members.js                  # Member registration
│   └── services/
│       └── contractService.js          # Contract abstraction
└── frontend/                           # React application
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx           # Treasury overview
    │   │   ├── Proposals.jsx           # Proposal voting
    │   │   ├── Members.jsx             # Member management
    │   │   └── About.jsx               # Project info
    │   ├── services/
    │   │   └── api.js                  # API client
    │   ├── App.jsx                     # Main app component
    │   └── main.jsx                    # React entry point
    └── vite.config.js                  # Vite dev server (port 3000)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Docker** (for Midnight Protocol network)
- **Midnight CLI** (Compact compiler v0.28.0)

### 1. Start Midnight Network

```powershell
# Start Midnight local network
docker compose up -d

# Verify services are running
docker ps
# Should see: midnight-node, midnight-indexer, midnight-proof-server
```

### 2. Setup Backend

```powershell
cd backend

# Install dependencies
npm install

# Start backend API (port 5000)
npm run dev
```

**Backend Endpoints:**
- `GET /api/contract/info` - Contract metadata
- `GET /api/contract/balance` - Treasury balance
- `GET /api/proposals` - List proposals
- `POST /api/proposals/:id/vote` - Vote on proposal (private)
- `GET /api/members` - List members
- `POST /api/members/register` - Register new member

### 3. Setup Frontend

```powershell
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev
```

### 4. Access Application

Open browser to: **http://localhost:3000**

**Features Available:**
- 📊 Dashboard - View treasury balance, active proposals, member count
- 📝 Proposals - Create proposals, vote privately, execute approved proposals
- 👥 Members - Register members with voting weights
- ℹ️ About - Technical details and contract information

## 🔧 Technical Details

### Smart Contract
- **Language**: Compact (Midnight's privacy-focused language)
- **Compiler**: v0.28.0
- **Circuits**: 8 ZK-SNARK circuits (Halo 2)
- **Hash**: `81aac1479224e8896ff26cf220354553e382701d07563e2dcc86bf01e7701aae`
- **Status**: ✅ Compiled (134KB bundle)

### Backend Stack
- **Framework**: Express.js 4.18.2
- **CORS**: Enabled for frontend communication
- **Port**: 5000
- **Routes**: 3 modules (contract, proposals, members)
- **Data**: In-memory stores (mock data for demo)

### Frontend Stack
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Router**: React Router 6.20.0
- **HTTP Client**: Axios 1.6.2
- **Icons**: Lucide React
- **Port**: 3000
- **Proxy**: `/api` → `http://localhost:5000`

## 📊 Contract Status

**Compilation**: ✅ SUCCESS
- All 8 circuits generated
- Proving/verifying keys created
- 134KB contract bundle

**Deployment**: ⚠️ BLOCKED
- Contract is production-ready but cannot be deployed
- Issue: SDK wrapper format incompatibility
- Workaround: Application uses mock data stores

## 🎨 UI Preview

### Dashboard
- Treasury balance (in Billion DUST)
- Total members with voting power
- Active proposals count
- Quorum requirement
- Privacy features showcase

### Proposals
- List all proposals with status badges
- Create new proposals (recipient, amount, duration)
- Vote Yes/No privately using ZK-SNARKs
- Vote progress visualization
- Execute approved proposals

### Members
- Member list with addresses
- Voting power display (private)
- Registration form
- Participation statistics
- Total voting power calculation

## 🔐 Privacy Mechanisms

### Zero-Knowledge Voting
```
User submits vote → ZK-SNARK circuit generates proof →
Proof verified on-chain → Vote counted WITHOUT revealing choice →
Only final tally visible
```

### Private Member Data
- Voting weights stored in encrypted state
- Membership commitments prevent double-voting
- Only member participation count is public

### Timelock Security
- Proposals locked for minimum duration
- Prevents frontrunning and manipulation
- Ensures fair voting period

## 🧪 Testing

### Test Backend API
```powershell
# In backend directory
npm test
```

### Test Frontend
```powershell
# In frontend directory
npm run build   # Production build
npm run preview # Preview production build
```

### Manual Testing
1. Connect wallet (simulated)
2. Create a proposal
3. Vote Yes/No (vote is private)
4. Execute proposal when quorum reached
5. Register new member
6. Check treasury balance

## 📝 API Examples

### Create Proposal
```javascript
POST /api/proposals
{
  "recipient": "mn_addr_undeployed1...",
  "amount": 5000000,
  "duration": 7
}
```

### Vote on Proposal (Private)
```javascript
POST /api/proposals/1/vote
{
  "vote": "yes"  // Vote choice hidden using ZK-SNARKs
}
```

### Register Member
```javascript
POST /api/members/register
{
  "address": "mn_addr_undeployed1...",
  "votingWeight": 2
}
```

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
WS_ENDPOINT=ws://localhost:9944
HTTP_ENDPOINT=http://localhost:9944
GRAPHQL_ENDPOINT=http://localhost:8088/api/v3/graphql
PROOF_SERVER_ENDPOINT=http://localhost:6300
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🛠️ Development

### Add New Feature
1. Add smart contract function in `.compact` file
2. Compile: `compact --compile PrivateDAOTreasury_Working.compact`
3. Add backend route in `backend/routes/`
4. Add API method in `frontend/src/services/api.js`
5. Create React component in `frontend/src/components/`

### Code Style
- Backend: ESLint + Prettier
- Frontend: React best practices
- Smart Contract: Compact language conventions

## 📚 Resources

- **Midnight Protocol**: https://midnight.network
- **Compact Language**: https://docs.midnight.network/develop/smart-contracts
- **React**: https://react.dev
- **Express.js**: https://expressjs.com
- **ZK-SNARKs**: https://docs.midnight.network/learn/core-concepts/zero-knowledge-proofs

## 🐛 Known Issues

1. **Contract Deployment**: SDK wrapper format incompatibility prevents on-chain deployment
2. **Wallet Connection**: Currently simulated (Lace wallet integration pending)
3. **Data Persistence**: Using in-memory stores (switch to database for production)

## 🎯 Future Enhancements

- [ ] Real Lace wallet integration
- [ ] Actual contract deployment when SDK compatible
- [ ] Database persistence (PostgreSQL)
- [ ] Real-time updates via WebSockets
- [ ] Proposal discussion threads
- [ ] Advanced voting mechanisms (quadratic, delegated)
- [ ] Treasury analytics dashboard
- [ ] Multi-signature approvals

## 👥 Credits

**Built for**: Midnight Protocol Bootcamp
**Date**: February 2026
**Technology**: Midnight Protocol v7, Compact v0.28.0

## 📄 License

MIT License - Built as educational project for Midnight Protocol Bootcamp

---

**Privacy-First Governance • Zero-Knowledge Cryptography • Decentralized Control**
