import { useState, useEffect } from 'react';
import { Plus, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { proposalAPI } from '../services/api';
import './Components.css';

function Proposals({ walletConnected }) {
  const [proposals, setProposals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    duration: 7,
    description: ''
  });

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const res = await proposalAPI.getAll();
      setProposals(res.data.proposals);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await proposalAPI.create(formData);
      setFormData({ recipient: '', amount: '', duration: 7, description: '' });
      setShowCreateForm(false);
      loadProposals();
    } catch (error) {
      console.error('Failed to create proposal:', error);
      alert('Failed to create proposal');
    }
  };

  const handleVote = async (proposalId, vote) => {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await proposalAPI.vote(proposalId, vote);
      alert(`Vote "${vote}" recorded privately ✅`);
      loadProposals();
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to record vote');
    }
  };

  const handleExecute = async (proposalId) => {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const res = await proposalAPI.execute(proposalId);
      
      // Show detailed balance update if available
      if (res.data.balanceUpdate) {
        const update = res.data.balanceUpdate;
        alert(
          `✅ Proposal Executed Successfully!\n\n` +
          `💰 Balance Update:\n` +
          `   Previous: ${update.previousBalance}\n` +
          `   Deducted: ${update.deducted}\n` +
          `   New Balance: ${update.newBalance}\n\n` +
          `📤 Recipient: ${update.recipient.substring(0, 30)}...`
        );
      } else {
        alert(res.data.message || 'Proposal executed successfully! 🎉');
      }
      
      loadProposals();
    } catch (error) {
      console.error('Failed to execute:', error);
      alert(error.response?.data?.error || 'Failed to execute proposal');
    }
  };

  if (loading) {
    return <div className="loading">Loading proposals...</div>;
  }

  return (
    <div className="proposals">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Proposals</h1>
            <p className="page-subtitle">Create and vote on treasury proposals privately</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus size={18} />
            New Proposal
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Create New Proposal</h2>
          <form onSubmit={handleCreate}>
            <input
              className="input"
              placeholder="Recipient Address (mn_addr_...)"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              required
            />
            <input
              className="input"
              type="number"
              placeholder="Amount (in micro-NIGHT, e.g. 5000000 = 5 NIGHT)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <textarea
              className="input textarea"
              placeholder="Proposal description: explain purpose and recipient use of funds"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
            <input
              className="input"
              type="number"
              placeholder="Duration (days)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
            {/* Live preview */}
            {formData.description && (
              <div className="card" style={{ background: 'var(--card-variant)', marginTop: 8 }}>
                <strong>Preview</strong>
                <p style={{ marginTop: 8, color: 'var(--text)' }}>{formData.description}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">Create Proposal</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="proposals-list">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="card proposal-card">
            <div className="proposal-header">
              <div>
                <h3>Proposal #{proposal.id}</h3>
                <span className={`badge badge-${
                  proposal.status === 'active' ? 'warning' : 
                  proposal.status === 'executed' ? 'success' : 'danger'
                }`}>
                  {proposal.status.toUpperCase()}
                </span>
              </div>
              <div className="proposal-amount">
                {(proposal.amount / 1_000_000).toFixed(2)}M DUST
              </div>
            </div>

            <div className="proposal-details">
              <p><strong>Recipient:</strong> {proposal.recipient}</p>
              <p><strong>Amount:</strong> {Number(proposal.amount) / 1_000_000} NIGHT</p>
              <p><strong>Duration:</strong> {proposal.duration} days</p>
              <p><strong>Created:</strong> {new Date(proposal.createdAt).toLocaleString()}</p>
              {proposal.description && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ margin: 0 }}><strong>Description:</strong></p>
                  <p style={{ marginTop: 6 }}>{proposal.description}</p>
                </div>
              )}
            </div>

            <div className="proposal-votes">
              <div className="vote-count">
                <ThumbsUp size={16} color="#10b981" />
                <span>{proposal.yesVotes} Yes</span>
              </div>
              <div className="vote-count">
                <ThumbsDown size={16} color="#ef4444" />
                <span>{proposal.noVotes} No</span>
              </div>
              <div className="vote-progress">
                <div 
                  className="vote-bar"
                  style={{ 
                    width: `${(proposal.yesVotes / (proposal.yesVotes + proposal.noVotes || 1)) * 100}%` 
                  }}
                />
              </div>
            </div>

            {proposal.status === 'active' && (
              <div className="proposal-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleVote(proposal.id, 'yes')}
                  disabled={!walletConnected}
                >
                  <ThumbsUp size={16} />
                  Vote Yes (Private)
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleVote(proposal.id, 'no')}
                  disabled={!walletConnected}
                >
                  <ThumbsDown size={16} />
                  Vote No (Private)
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleExecute(proposal.id)}
                  disabled={!walletConnected}
                >
                  <CheckCircle size={16} />
                  Execute
                </button>
              </div>
            )}
          </div>
        ))}

        {proposals.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: 'var(--text-dim)' }}>No proposals yet. Create the first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Proposals;
