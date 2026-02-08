import { Shield, Lock, Eye, Zap } from 'lucide-react';
import './Components.css';

function About() {
  return (
    <div className="about">
      <div className="page-header">
        <h1 className="page-title">About PrivateDAO</h1>
        <p className="page-subtitle">Privacy-preserving governance powered by Midnight Protocol</p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>🔐 What is PrivateDAO?</h2>
        <p style={{ lineHeight: '1.8', color: 'var(--text-dim)' }}>
          PrivateDAO is a privacy-first decentralized autonomous organization built on the Midnight Protocol. 
          It uses zero-knowledge cryptography to enable transparent governance while keeping sensitive member 
          information and voting choices completely private.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Shield size={24} color="#8b5cf6" />
            <h2 style={{ margin: 0 }}>Privacy Features</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
            <li>✅ Private voting using ZK-SNARKs</li>
            <li>✅ Hidden member voting weights</li>
            <li>✅ Commitment schemes for vote integrity</li>
            <li>✅ On-chain privacy guarantees</li>
          </ul>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Zap size={24} color="#f59e0b" />
            <h2 style={{ margin: 0 }}>Key Functions</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
            <li>📥 <strong>deposit:</strong> Add funds to treasury (284 rows)</li>
            <li>👥 <strong>registerMember:</strong> Join DAO (412 rows)</li>
            <li>📝 <strong>createProposal:</strong> Propose actions (1209 rows)</li>
            <li>🗳️ <strong>voteYes/No:</strong> Private voting (563 rows each)</li>
            <li>✅ <strong>executeProposal:</strong> Execute passed proposals (511 rows)</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Lock size={24} color="#10b981" />
          <h2 style={{ margin: 0 }}>Smart Contract Details</h2>
        </div>
        <div style={{ color: 'var(--text-dim)', lineHeight: '1.8' }}>
          <p><strong>Contract Name:</strong> PrivateDAOTreasury</p>
          <p><strong>Language:</strong> Compact (Midnight's privacy-focused smart contract language)</p>
          <p><strong>Compiler Version:</strong> 0.28.0</p>
          <p><strong>Total Circuits:</strong> 8 ZK-SNARK circuits</p>
          <p><strong>Contract Hash:</strong> <code style={{ fontSize: '12px', background: 'var(--bg-dark)', padding: '2px 8px', borderRadius: '4px' }}>81aac1479224e8896ff26cf220354553e382701d07563e2dcc86bf01e7701aae</code></p>
          <p><strong>Status:</strong> <span className="badge badge-warning">Compiled & Ready</span></p>
          <p style={{ marginTop: '16px' }}>
            The contract is fully compiled with all circuits generated. It includes 177 lines of Compact code 
            implementing a complete privacy-preserving DAO treasury system.
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Eye size={24} color="#06b6d4" />
          <h2 style={{ margin: 0 }}>How It Works</h2>
        </div>
        <div style={{ color: 'var(--text-dim)', lineHeight: '1.8' }}>
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Member Registration:</strong> Members join with private voting weights stored on-chain
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Proposal Creation:</strong> Any member can create spending proposals specifying recipient and amount
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Private Voting:</strong> Members vote yes/no using zero-knowledge proofs - votes are cryptographically hidden
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Execution:</strong> Once quorum is reached, proposals can be executed to release funds
            </li>
            <li>
              <strong>Privacy Guarantee:</strong> All operations use ZK-SNARKs to ensure complete privacy while maintaining verifiability
            </li>
          </ol>
        </div>
      </div>

      <div className="card" style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--primary)' }}>
        <h2 style={{ marginBottom: '16px' }}>🚀 Technical Stack</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>Blockchain</p>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>Midnight Protocol v7</p>
          </div>
          <div>
            <p style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>Smart Contracts</p>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>Compact Language</p>
          </div>
          <div>
            <p style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>Cryptography</p>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>ZK-SNARKs (Halo 2)</p>
          </div>
          <div>
            <p style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>Frontend</p>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>React + Vite</p>
          </div>
          <div>
            <p style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>Backend</p>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>Express.js</p>
          </div>
          <div>
            <p style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>API</p>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>REST + GraphQL</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
