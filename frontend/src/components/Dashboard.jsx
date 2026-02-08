import { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Shield } from 'lucide-react';
import { contractAPI, proposalAPI, memberAPI } from '../services/api';
import './Components.css';

function Dashboard({ walletConnected }) {
  const [stats, setStats] = useState({
    balance: 0,
    totalMembers: 0,
    activeProposals: 0,
    quorum: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [balanceRes, membersRes, proposalsRes, quorumRes] = await Promise.all([
        contractAPI.getBalance(),
        memberAPI.getAll(),
        proposalAPI.getAll(),
        contractAPI.getQuorum()
      ]);

      setStats({
        balance: balanceRes.data.balance,
        totalMembers: membersRes.data.totalMembers,
        activeProposals: proposalsRes.data.proposals.filter(p => p.status === 'active').length,
        quorum: quorumRes.data.quorum
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Treasury Dashboard</h1>
        <p className="page-subtitle">Monitor your privacy-preserving DAO in real-time</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} color="#8b5cf6" />
          </div>
          <div className="stat-label">Treasury Balance</div>
          <div className="stat-value">
            {(stats.balance / 1_000_000_000).toFixed(2)}
            <span className="stat-unit">Billion DUST</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} color="#06b6d4" />
          </div>
          <div className="stat-label">Total Members</div>
          <div className="stat-value">
            {stats.totalMembers}
            <span className="stat-unit">Active</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} color="#10b981" />
          </div>
          <div className="stat-label">Active Proposals</div>
          <div className="stat-value">
            {stats.activeProposals}
            <span className="stat-unit">Pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Shield size={24} color="#f59e0b" />
          </div>
          <div className="stat-label">Quorum Required</div>
          <div className="stat-value">
            {stats.quorum}
            <span className="stat-unit">Votes</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>🔐 Privacy Features</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              ✅ <strong>Private Voting</strong> - Your votes are hidden using zero-knowledge proofs
            </li>
            <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              ✅ <strong>Commitment Schemes</strong> - Votes committed before proposal execution
            </li>
            <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              ✅ <strong>Timelock Protection</strong> - Proposals require minimum duration
            </li>
            <li style={{ padding: '12px 0' }}>
              ✅ <strong>On-Chain Privacy</strong> - All operations preserve member privacy
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>📊 Contract Info</h2>
          <div style={{ color: 'var(--text-dim)', lineHeight: '1.8' }}>
            <p><strong>Network:</strong> Midnight Protocol (Undeployed)</p>
            <p><strong>Contract:</strong> PrivateDAOTreasury</p>
            <p><strong>Circuits:</strong> 8 ZK-SNARK circuits</p>
            <p><strong>Deployment:</strong> <span className="badge badge-success">Local Wallet</span></p>
            <p style={{ marginTop: '12px', fontSize: '14px' }}>
              This DAO uses zero-knowledge cryptography to ensure all votes and member information remain private while maintaining verifiable governance. The contract is deployed to your local wallet state.
            </p>
          </div>
        </div>
      </div>

      {!walletConnected && (
        <div className="card" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'var(--warning)' }}>
          <p style={{ margin: 0, color: 'var(--warning)' }}>
            ⚠️ Connect your wallet to interact with the DAO treasury and vote on proposals.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
