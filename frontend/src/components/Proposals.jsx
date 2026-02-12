import { useState, useEffect } from 'react';
import { Plus, ThumbsUp, ThumbsDown, Search, Copy, CheckCheck, ExternalLink } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { proposalAPI } from '../services/api';
import './Components.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function Proposals({ walletConnected, walletAddress, treasuryBalance, setTreasuryBalance, activeProposals, setActiveProposals }) {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: 'Fund community hackathon prize pool',
      description: 'THE security of the society should be increased',
      amount: 5000,
      recipient: 'mn_addr_undeployed1xk8v2m9...4hf7qs',
      category: 'Social',
      status: 'Active',
      approvals: 8,
      rejections: 2,
      created: '04/11/2025',
      votedBy: []
    },
    {
      id: 2,
      title: 'Marketing campaign for Q4 2025',
      description: 'Expand brand awareness across multiple platforms',
      amount: 3500,
      recipient: 'mn_addr_undeployed1ym9t3n8...5jg8rt',
      category: 'Marketing',
      status: 'Executed',
      approvals: 15,
      rejections: 3,
      created: '03/28/2025',
      votedBy: []
    },
    {
      id: 3,
      title: 'Smart contract security audit',
      description: 'Hire a third-party auditor to review all ZK circuits and treasury logic before mainnet launch',
      amount: 8200,
      recipient: 'mn_addr_undeployed1ab3cd5e...7kl9mn',
      category: 'Security',
      status: 'Active',
      approvals: 5,
      rejections: 1,
      created: '02/03/2026',
      votedBy: []
    },
    {
      id: 4,
      title: 'Developer tooling & SDK improvements',
      description: 'Build developer documentation portal and improve Compact SDK integration for community devs',
      amount: 6500,
      recipient: 'mn_addr_undeployed1qw2er3t...9as0df',
      category: 'Development',
      status: 'Active',
      approvals: 3,
      rejections: 0,
      created: '02/06/2026',
      votedBy: []
    },
    {
      id: 5,
      title: 'Community ambassador program',
      description: 'Launch a global ambassador program to onboard new members and run local meetups across 10 cities',
      amount: 4800,
      recipient: 'mn_addr_undeployed1pl0ok9i...3tf2rd',
      category: 'Social',
      status: 'Active',
      approvals: 6,
      rejections: 2,
      created: '02/09/2026',
      votedBy: []
    }
  ]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recipient: '',
    amount: '',
    category: 'Development'
  });

  const [txHash, setTxHash] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateTxHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
    return hash;
  };

  const showTxNotification = (hash, type) => {
    setTxHash({ hash, type, timestamp: new Date().toLocaleTimeString() });
    setCopied(false);
    setTimeout(() => setTxHash(null), 12000);
  };

  const copyHash = () => {
    navigator.clipboard.writeText(txHash.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = ['Development', 'Marketing', 'Social', 'Security'];
  const categoryColors = {
    Development: '#8b5cf6',
    Marketing: '#ec4899',
    Social: '#10b981',
    Security: '#f59e0b'
  };

  // Calculate pie chart data
  const categoryData = {
    labels: categories,
    datasets: [{
      data: [
        proposals.filter(p => p.category === 'Development').length,
        proposals.filter(p => p.category === 'Marketing' ).length,
        proposals.filter(p => p.category === 'Social').length,
        proposals.filter(p => p.category === 'Security').length
      ],
      backgroundColor: [
        categoryColors.Development,
        categoryColors.Marketing,
        categoryColors.Social,
        categoryColors.Security
      ],
      borderWidth: 0
    }]
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const newProposal = {
      id: proposals.length + 1,
      ...formData,
      status: 'Active',
      approvals: 0,
      rejections: 0,
      created: new Date().toLocaleDateString('en-US'),
      votedBy: []
    };

    const hash = generateTxHash();
    newProposal.txHistory = [{ hash, type: 'Created', timestamp: new Date().toLocaleTimeString() }];
    setProposals([newProposal, ...proposals]);
    setActiveProposals(prev => prev + 1);
    setFormData({
      title: '',
      description: '',
      recipient: '',
      amount: '',
      category: 'Development'
    });
    setShowCreateForm(false);
    showTxNotification(hash, 'Proposal Created');
  };

  const handleVote = (proposalId, vote) => {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // Check if user has already voted on this proposal
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal.votedBy && proposal.votedBy.includes(walletAddress)) {
      alert('❌ You have already voted on this proposal!');
      return;
    }

    const hash = generateTxHash();
    setProposals(proposals.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          approvals: vote === 'approve' ? p.approvals + 1 : p.approvals,
          rejections: vote === 'reject' ? p.rejections + 1 : p.rejections,
          votedBy: [...(p.votedBy || []), walletAddress],
          txHistory: [...(p.txHistory || []), { hash, type: `Vote (${vote})`, timestamp: new Date().toLocaleTimeString() }]
        };
      }
      return p;
    }));

    showTxNotification(hash, `Vote (${vote})`);
  };

  const handleExecute = (proposalId) => {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    const totalVotes = proposal.approvals + proposal.rejections;
    if (totalVotes < 4) {
      alert(`❌ Quorum not reached! Need at least 4 total votes. Current: ${totalVotes}`);
      return;
    }

    if (proposal.approvals <= proposal.rejections) {
      alert('❌ Proposal did not pass! Approvals must exceed rejections.');
      return;
    }

    const amount = Number(proposal.amount);
    if (amount > treasuryBalance) {
      alert(`❌ Insufficient treasury balance! Have: ${treasuryBalance.toLocaleString()} tNIGHT, Need: ${amount.toLocaleString()} tNIGHT`);
      return;
    }

    // Deduct from treasury balance
    setTreasuryBalance(prev => prev - amount);
    setActiveProposals(prev => prev - 1);

    const hash = generateTxHash();
    setProposals(proposals.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          status: 'Executed',
          txHistory: [...(p.txHistory || []), { hash, type: 'Executed', timestamp: new Date().toLocaleTimeString() }]
        };
      }
      return p;
    }));

    showTxNotification(hash, `Executed — ${amount.toLocaleString()} tNIGHT`);
  };

  const filteredProposals = proposals
    .filter(p => filter === 'All' || p.status === filter)
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="proposals-page">
      <div className="proposals-header">
        <h1>Proposals</h1>
        <p>Vote on active proposals or check execution status</p>
      </div>

      {/* Search and Filters */}
      <div className="proposals-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {['All', 'Active', 'Executed'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="btn-create" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus size={18} />
          Create
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Proposal</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>📋 Proposal Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Be clear and specific about what you're proposing and why it benefits the DAO"
                  rows={4}
                  required
                />
                <span className="form-help">Be clear and specific about what you're proposing and why it benefits the DAO</span>
              </div>

              <div className="form-group">
                <label>👤 Recipient Address</label>
                <input
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  placeholder="mn_addr_undeployed1xk8v2m9gf4t5h7j9k2l4n6p8q0r3s5t7u9v2w4x6y8z..."
                  required
                />
                <span className="form-help">Enter the Midnight address that will receive the funds</span>
              </div>

              <div className="form-group">
                <label>💰 Amount (tNIGHT)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="1000"
                  required
                />
                <span className="form-help">Specify the amount to be transferred if the proposal is approved</span>
              </div>

              <div className="form-group">
                <label>🏷️ Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <span className="form-help">Select the category that best describes this proposal</span>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">Create Proposal</button>
                <button type="button" className="btn-cancel" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Hash Notification */}
      {txHash && (
        <div className="tx-notification">
          <div className="tx-notification-header">
            <span className="tx-notification-type">✅ {txHash.type}</span>
            <button className="tx-close" onClick={() => setTxHash(null)}>×</button>
          </div>
          <div className="tx-hash-row">
            <code className="tx-hash-code">{txHash.hash}</code>
            <button className="tx-copy-btn" onClick={copyHash} title="Copy hash">
              {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="tx-notification-footer">
            <span className="tx-time">{txHash.timestamp}</span>
            <span className="tx-network">Midnight Testnet</span>
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="proposals-list">
        {filteredProposals.map((proposal) => {
          const totalVotes = proposal.approvals + proposal.rejections;
          const approvalPercent = totalVotes > 0 ? (proposal.approvals / totalVotes) * 100 : 0;
          const rejectionPercent = totalVotes > 0 ? (proposal.rejections / totalVotes) * 100 : 0;

          return (
            <div key={proposal.id} className="proposal-card-new">
              <div className="proposal-card-header">
                <div className="proposal-id-badges">
                  <span className="proposal-id">#{proposal.id}</span>
                  <span className={`category-badge ${proposal.category.toLowerCase()}`}>
                    {proposal.category === 'Social' && '❤️'}
                    {proposal.category === 'Marketing' && '📢'}
                    {proposal.category === 'Development' && '💻'}
                    {proposal.category === 'Security' && '🔒'}
                    {' '}{proposal.category}
                  </span>
                  <span className={`status-badge ${proposal.status.toLowerCase()}`}>
                    {proposal.status}
                  </span>
                </div>
              </div>

              <h3 className="proposal-title">{proposal.title || proposal.description}</h3>
              
              <div className="proposal-meta">
                <span>Amount: <strong>{proposal.amount.toLocaleString()} tNIGHT</strong></span>
                <span>Recipient: <strong>{proposal.recipient}</strong></span>
                <span>Created: <strong>{proposal.created}</strong></span>
              </div>

              {/* Transaction History */}
              {proposal.txHistory && proposal.txHistory.length > 0 && (
                <div className="tx-history">
                  {proposal.txHistory.map((tx, i) => (
                    <div key={i} className="tx-history-item">
                      <span className="tx-history-type">{tx.type}</span>
                      <code className="tx-history-hash">{tx.hash.substring(0, 18)}...{tx.hash.substring(58)}</code>
                      <span className="tx-history-time">{tx.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="proposal-votes-section">
                <div className="vote-column">
                  <div className="vote-header">
                    <ThumbsUp size={16} />
                    <span>Approvals</span>
                  </div>
                  <div className="vote-number">{proposal.approvals}</div>
                  <div className="vote-bar-container">
                    <div className="vote-bar approval" style={{ width: `${approvalPercent}%` }} />
                  </div>
                </div>

                <div className="vote-column">
                  <div className="vote-header">
                    <ThumbsDown size={16} />
                    <span>Rejections</span>
                  </div>
                  <div className="vote-number">{proposal.rejections}</div>
                  <div className="vote-bar-container">
                    <div className="vote-bar rejection" style={{ width: `${rejectionPercent}%` }} />
                  </div>
                </div>
              </div>

              {proposal.status === 'Active' && (
                <div className="proposal-actions-new">
                  {proposal.votedBy && proposal.votedBy.includes(walletAddress) ? (
                    <div style={{ padding: '12px 20px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', color: '#a78bfa', fontWeight: 600, textAlign: 'center', flex: 1 }}>
                      ✅ You have already voted on this proposal
                    </div>
                  ) : (
                    <>
                      <button 
                        className="btn-approve"
                        onClick={() => handleVote(proposal.id, 'approve')}
                      >
                        <ThumbsUp size={16} />
                        Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleVote(proposal.id, 'reject')}
                      >
                        <ThumbsDown size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  <button className="btn-execute" onClick={() => handleExecute(proposal.id)}>
                    ⚡ Execute
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="proposals-analytics">
        <div className="analytics-chart">
          <h2>Treasury Performance</h2>
          <div className="trend-stats">
            <div className="trend-item">
              <span className="trend-label">● Balance Trend</span>
              <span className="trend-value">+66.7%</span>
            </div>
            <div className="trend-item">
              <span className="trend-label">● Proposals Growth</span>
              <span className="trend-value">+212%</span>
            </div>
          </div>
        </div>

        <div className="analytics-chart">
          <h2>Proposals by Category</h2>
          <div className="pie-chart-container">
            <Pie data={categoryData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div className="category-breakdown">
            {categories.map(cat => {
              const catProposals = proposals.filter(p => p.category === cat);
              const totalAmount = catProposals.reduce((sum, p) => sum + Number(p.amount), 0);
              return (
                <div key={cat} className="category-item">
                  <div className="category-color" style={{ backgroundColor: categoryColors[cat] }} />
                  <div className="category-info">
                    <span className="category-name">{cat}</span>
                    <span className="category-stats">
                      Total: {totalAmount.toLocaleString()} tNIGHT
                    </span>
                  </div>
                  <span className="category-count">{catProposals.length} proposal{catProposals.length !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Proposals;
