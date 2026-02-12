# 🔐 PrivateDAO Treasury

> **A Privacy-Preserving Decentralized Autonomous Organization built on Midnight Protocol**

[![Midnight Protocol](https://img.shields.io/badge/Midnight-Protocol-purple)](https://midnight.network/)
[![Compact](https://img.shields.io/badge/Language-Compact-blue)](https://docs.midnight.network/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Project Vision](#-project-vision)
- [Key Features](#-key-features)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Deployment Details](#-deployment-details)
- [Usage Guide](#-usage-guide)
- [Screenshots](#-screenshots)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)

---

## 📖 Project Description

**PrivateDAO Treasury** is a full-stack decentralized application that brings **privacy-first governance** to DAOs using **Midnight Protocol's zero-knowledge technology**. 

The project consists of three main components:

### 🔹 Smart Contract (Compact Language)
A privacy-preserving DAO treasury contract with 8 ZK-SNARK circuits that enable:
- Private voting with zero-knowledge proofs
- Hidden proposal amounts until execution
- Commitment-based vote tracking
- Timelock protection against governance attacks

### 🔹 Backend API (Express.js)
A REST API that interfaces with the smart contract, providing endpoints for:
- Treasury balance queries
- Proposal creation and voting
- Member registration and management
- Real-time contract interaction

### 🔹 Frontend UI (React + Vite)
An intuitive web interface featuring:
- Live treasury dashboard
- Proposal management with private voting
- Member registration and voting weight management
- Real-time updates and notifications

---

## 🎯 Project Vision

**Mission**: To democratize privacy in blockchain governance by making zero-knowledge technology accessible and practical for real-world DAO applications.

### Why PrivateDAO?

Traditional DAOs face critical privacy challenges:
- 🚨 **Vote buying** - Public votes enable coercion
- 🚨 **Strategic voting** - Visible vote totals influence outcomes
- 🚨 **Front-running** - Proposal amounts leaked before execution
- 🚨 **Governance attacks** - Flash loans manipulate voting power

### Our Solution

PrivateDAO leverages Midnight Protocol's cutting-edge zero-knowledge cryptography to:
- ✅ Keep votes completely private using ZK-SNARKs
- ✅ Hide proposal amounts with commitment schemes
- ✅ Prevent manipulation with timelock mechanisms
- ✅ Ensure fair governance without compromising transparency

### Long-term Vision

We envision PrivateDAO becoming the **gold standard for privacy-preserving governance**, enabling:
- Cross-chain DAO privacy integration
- Enterprise-grade confidential voting systems
- Privacy-preserving regulatory compliance for DAOs
- Community-governed privacy standards

---

## ✨ Key Features

### 🔐 Privacy-First Architecture
- **Private Voting** - Vote choices hidden using zero-knowledge proofs
- **Commitment Schemes** - Votes committed before proposal execution
- **Hidden Amounts** - Proposal amounts remain confidential until execution
- **Timelock Protection** - Minimum duration prevents flash loan attacks

### 🏛️ Complete DAO Governance
- **Treasury Management** - Deposit and withdraw funds securely
- **Proposal System** - Create, vote, and execute spending proposals
- **Member Management** - Register members with customizable voting weights
- **Quorum-Based Decisions** - Democratic threshold for proposal execution

### 🛡️ Security Features
- **Zero-Knowledge Proofs** - Halo 2 circuits for cryptographic privacy
- **Snapshot Governance** - Parameter manipulation prevention
- **Access Control** - Member-only voting and proposal creation
- **State Validation** - Comprehensive assertion checks

### 📊 Smart Contract Functions (8 Circuits)

| Function | Description | Circuit Size |
|----------|-------------|--------------|
| `deposit` | Add funds to treasury | 284 rows |
| `getBalance` | Query treasury balance | 26 rows |
| `registerMember` | Register voting member | 412 rows |
| `createProposal` | Create spending proposal | 1,209 rows |
| `voteYes` | Vote in favor (private) | 563 rows |
| `voteNo` | Vote against (private) | 563 rows |
| `executeProposal` | Execute approved proposal | 511 rows |
| `getProposal` | Query proposal details | 298 rows |

---

## 📁 Project Structure

```
Midnight_bootcamp/
├── contract/                           # Smart Contract Code
│   ├── PrivateDAOTreasury_Working.compact  # Main contract (177 lines)
│   ├── build_working/                  # Compiled artifacts (134KB)
│   │   ├── contract/
│   │   │   ├── index.js               # Contract runtime
│   │   │   └── index.d.ts             # TypeScript definitions
│   │   └── keys/                      # 8 ZK proving/verifying keys
│   ├── src/                           # Contract utilities
│   ├── wrapped-contract.ts            # Contract wrapper
│   └── tsconfig.json                  # TypeScript config
│
├── backend/                           # Backend API
│   ├── server.js                      # Express server (port 5000)
│   ├── package.json                   # Backend dependencies
│   ├── routes/
│   │   ├── contract.js               # Contract endpoints
│   │   ├── proposals.js              # Proposal management
│   │   └── members.js                # Member registration
│   └── services/
│       └── contractService.js        # Contract abstraction layer
│
├── frontend/                          # React Frontend
│   ├── index.html                     # Entry HTML
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                # Vite configuration
│   └── src/
│       ├── App.jsx                    # Main app component
│       ├── main.jsx                   # React entry point
│       ├── components/
│       │   ├── Dashboard.jsx         # Treasury overview
│       │   ├── Proposals.jsx         # Proposal voting interface
│       │   ├── Members.jsx           # Member management
│       │   └── About.jsx             # Project information
│       └── services/
│           └── api.js                # API client
│
├── Screenshots/                       # Documentation screenshots
├── LOCAL_DEPLOYMENT.json             # Deployment information
├── package.json                       # Root dependencies
└── README.md                          # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18+ and npm ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))
- **Midnight CLI Tools** (optional, for contract compilation)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Midnight_bootcamp
```

### Step 2: Install Root Dependencies

```bash
npm install
```

### Step 3: Start Midnight Network (Docker)

The Midnight Protocol network runs locally via Docker with three services:
- **Midnight Node** (Blockchain node)
- **Midnight Indexer** (GraphQL API)
- **Midnight Proof Server** (ZK proof generation)

**⚠️ Important**: If you already have the network running with wallet data, **do not restart Docker** to avoid losing your wallet.

To start fresh (if needed):
```bash
docker compose up -d
```

Verify services are running:
```bash
docker ps
```

You should see three containers running:
- `midnight-node` (port 9944)
- `midnight-indexer` (port 8088)
- `midnight-proof-server` (port 6300)

### Step 4: Configure Environment Variables

#### Backend Configuration

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
WS_ENDPOINT=ws://localhost:9944
HTTP_ENDPOINT=http://localhost:9944
GRAPHQL_ENDPOINT=http://localhost:8088/api/v3/graphql
PROOF_SERVER_ENDPOINT=http://localhost:6300
```

#### Frontend Configuration

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Start Backend API

```bash
cd backend
npm install
npm run dev
```

Backend will start on **http://localhost:5000**

**API Endpoints**:
- `GET /api/contract/info` - Contract metadata
- `GET /api/contract/balance` - Treasury balance
- `GET /api/proposals` - List all proposals
- `POST /api/proposals` - Create new proposal
- `POST /api/proposals/:id/vote` - Vote on proposal (private)
- `GET /api/members` - List members
- `POST /api/members/register` - Register new member

### Step 6: Start Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend will start on **http://localhost:3000**

### Step 7: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the PrivateDAO Treasury dashboard! 🎉

---

## 📦 Deployment Details

### Contract Information

| Property | Value |
|----------|-------|
| **Contract Name** | PrivateDAOTreasury |
| **Contract Hash** | `81aac1479224e8896ff26cf220354553e382701d` |
| **Contract Address** | `contract_81aac1479224e8896ff26cf220354553e382701d` |
| **Wallet Address** | `mn_addr_undeployed14b6c60829ca7d0ddad4483420ba67b928588f357259e8bdbc0` |
| **Network** | Midnight Undeployed (Local) |
| **Deployed On** | February 8, 2026 |
| **Contract Size** | 136,243 bytes (134 KB) |
| **Circuits** | 8 ZK-SNARK circuits |
| **Compiler** | Compact v0.28.0 |

### Network Configuration

| Service | Endpoint |
|---------|----------|
| **RPC Node** | `ws://localhost:9944` |
| **Indexer API** | `http://localhost:8088/api/v3/graphql` |
| **Proof Server** | `http://localhost:6300` |
| **Backend API** | `http://localhost:5000` |
| **Frontend UI** | `http://localhost:3000` |

### Deployment Files

- **Source Contract**: `contract/PrivateDAOTreasury_Working.compact`
- **Compiled Output**: `contract/build_working/contract/index.js`
- **Deployment Info**: `LOCAL_DEPLOYMENT.json`
- **ZK Keys**: `contract/build_working/keys/*.prover` & `*.verifier`

---

## 📘 Usage Guide

### 1. View Treasury Balance

Navigate to the **Dashboard** tab to see:
- Current treasury balance
- Total members registered
- Active proposals
- Recent activity

### 2. Register as DAO Member

1. Go to **Members** tab
2. Click **"Register as Member"**
3. Enter your voting weight (1-100)
4. Submit registration
5. Wait for confirmation

### 3. Create a Proposal

1. Navigate to **Proposals** tab
2. Click **"Create Proposal"**
3. Fill in details:
   - Recipient address
   - Amount (hidden until execution)
   - Description
   - Duration (minimum timelock)
4. Submit proposal
5. Proposal ID will be generated

### 4. Vote on Proposals

1. Browse proposals in **Proposals** tab
2. Click on a proposal to view details
3. Cast your vote:
   - **Vote Yes** (private)
   - **Vote No** (private)
4. Your vote is recorded with zero-knowledge proof
5. Vote totals remain hidden

### 5. Execute Approved Proposals

1. Wait for voting period to end
2. If quorum is met and votes favor execution
3. Click **"Execute Proposal"**
4. Funds are transferred to recipient
5. Proposal amount is revealed

---

## 📸 Screenshots

**You can view the full UI of the project in the [Website UI Images](Website%20UI%20Images/) folder.**

### Dashboard
![Dashboard](Website%20UI%20Images/Screenshot%202026-02-12%20232938.png)

### Proposals
![Proposals](Website%20UI%20Images/Screenshot%202026-02-12%20233009.png)

### Leaderboard
![Leaderboard](Website%20UI%20Images/Screenshot%202026-02-12%20233102.png)

### Members
![Members](Website%20UI%20Images/Screenshot%202026-02-12%20233146.png)

### About
![About](Website%20UI%20Images/Screenshot%202026-02-12%20233213.png)

### Additional View
![Additional View](Website%20UI%20Images/Screenshot%202026-02-12%20233246.png)

---

## �🚀 Future Scope

### Phase 1: Enhanced Privacy (Q2 2026)
- [ ] **Multi-signature proposals** - Require multiple approvers
- [ ] **Quadratic voting** - Prevent vote concentration
- [ ] **Recursive SNARKs** - Batch vote verification for scalability
- [ ] **Private delegation** - Hidden vote delegation system

### Phase 2: Cross-Chain Integration (Q3 2026)
- [ ] **Bridge to Ethereum** - Cross-chain treasury management
- [ ] **Interchain proposals** - Execute on multiple chains
- [ ] **Asset diversity** - Support multiple tokens (ERC-20, native)
- [ ] **Oracle integration** - Real-world data in proposals

### Phase 3: Advanced Governance (Q4 2026)
- [ ] **Role-based permissions** - Admin, member, observer roles
- [ ] **Sub-DAOs** - Hierarchical governance structures
- [ ] **Reputation system** - Member credibility tracking
- [ ] **Automated execution** - Time-based or condition-based triggers

### Phase 4: Enterprise Features (2027)
- [ ] **Compliance modules** - KYC/AML for regulated DAOs
- [ ] **Audit trails** - Privacy-preserving activity logs
- [ ] **Custom voting mechanisms** - Flexible governance models
- [ ] **Mobile application** - iOS and Android support

### Phase 5: Ecosystem Growth
- [ ] **DAO templates** - Quick-start governance frameworks
- [ ] **SDK for developers** - Easy integration for dApps
- [ ] **Governance marketplace** - Proposal templates and voting strategies
- [ ] **Analytics dashboard** - Privacy-preserving insights
- [ ] **Educational platform** - Tutorials and documentation

### Long-term Vision
- Become the **standard for privacy-preserving governance**
- Support **10,000+ DAOs** across multiple chains
- Pioneer **privacy-preserving regulatory compliance**
- Create a **thriving ecosystem** of privacy-focused governance tools

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute
- 🐛 **Report bugs** and suggest features
- 📝 **Improve documentation**
- 🔧 **Submit pull requests** for fixes or features
- 🧪 **Test the application** and provide feedback
- 🌟 **Star the repository** to show support

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Follow existing code patterns
- Comment complex logic
- Write meaningful commit messages
- Update documentation for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Midnight Protocol Team** - For the amazing privacy-preserving blockchain platform
- **INTO the MIDNIGHT Bootcamp** - For the opportunity and guidance
- **Zero-Knowledge Community** - For pioneering privacy technology
- **Open Source Contributors** - For inspiration and support

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](../../issues)
- **Documentation**: [Midnight Protocol Docs](https://docs.midnight.network/)
- **Community**: [Midnight Discord](https://discord.gg/midnight)

---

<div align="center">

**Built with ❤️ using Midnight Protocol**

⭐ **Star this repo if you find it useful!** ⭐

</div>