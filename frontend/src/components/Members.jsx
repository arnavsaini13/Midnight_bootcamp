import { useState, useEffect } from 'react';
import { UserPlus, Award } from 'lucide-react';
import { memberAPI } from '../services/api';
import './Components.css';

function Members({ walletConnected }) {
  const [members, setMembers] = useState([]);
  const [totalVotingPower, setTotalVotingPower] = useState(0);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    address: '',
    votingWeight: 1
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await memberAPI.getAll();
      setMembers(res.data.members);
      setTotalVotingPower(res.data.totalVotingPower);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await memberAPI.register(formData);
      setFormData({ address: '', votingWeight: 1 });
      setShowRegisterForm(false);
      loadMembers();
      alert('Member registered successfully! 🎉');
    } catch (error) {
      console.error('Failed to register member:', error);
      alert(error.response?.data?.error || 'Failed to register member');
    }
  };

  if (loading) {
    return <div className="loading">Loading members...</div>;
  }

  return (
    <div className="members">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">DAO Members</h1>
            <p className="page-subtitle">Manage members and their voting power (private)</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRegisterForm(!showRegisterForm)}
          >
            <UserPlus size={18} />
            Register Member
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-label">Total Members</div>
          <div className="stat-value">{members.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Voting Power</div>
          <div className="stat-value">{totalVotingPower}</div>
        </div>
      </div>

      {showRegisterForm && (
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Register New Member</h2>
          <form onSubmit={handleRegister}>
            <input
              className="input"
              placeholder="Member Address (mn_addr_...)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <input
              className="input"
              type="number"
              placeholder="Voting Weight (1-10)"
              min="1"
              max="10"
              value={formData.votingWeight}
              onChange={(e) => setFormData({ ...formData, votingWeight: parseInt(e.target.value) })}
              required
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">Register</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowRegisterForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="members-list">
        {members.map((member, index) => (
          <div key={member.address} className="card member-card">
            <div className="member-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="member-avatar">
                  {index + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>
                    {member.address}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
                    Joined: {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="member-voting-power">
                <Award size={20} color="#f59e0b" />
                <span>{member.votingWeight} votes</span>
              </div>
            </div>

            <div className="member-stats">
              <div className="member-stat">
                <span className="stat-label">Proposals Created</span>
                <span className="stat-value">{member.proposalsCreated}</span>
              </div>
              <div className="member-stat">
                <span className="stat-label">Votes Cast</span>
                <span className="stat-value">{member.votesCount}</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '12px' }}>
              🔐 Voting weight and participation are stored privately on-chain
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: 'var(--text-dim)' }}>No members yet. Register the first member!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Members;
