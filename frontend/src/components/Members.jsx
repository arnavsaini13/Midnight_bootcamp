import { useState, useEffect } from 'react';
import { UserPlus, Award } from 'lucide-react';
import { memberAPI } from '../services/api';
import './Components.css';

const demoMembers = [
  { address: 'mn_addr_undeployed1ec4yxmxfvqyfj23859f5dyg9zvkpw0jh7u3tu9zzrn3d89chv83q5gyqy5', joinedAt: '2025-08-14T10:30:00Z', proposalsCreated: 6, votesCount: 24 },
  { address: 'mn_addr_undeployed1xk8v2m9gf4t5h7j9k2l4n6p8q0r3s5t7u9v2w4x6y8z0a2b4c6d8e0f2g4h', joinedAt: '2025-09-02T14:15:00Z', proposalsCreated: 4, votesCount: 19 },
  { address: 'mn_addr_undeployed1ym9t3n8hg5u6i8k0m2o4q6s8u0w2y4a6c8e0g2i4k6m8o0q2s4u6w8y0a2b', joinedAt: '2025-09-18T09:45:00Z', proposalsCreated: 3, votesCount: 17 },
  { address: 'mn_addr_undeployed1qw3e5r7t9y1u3i5o7p9a1s3d5f7g9h1j3k5l7z9x1c3v5b7n9m1q3w5e7r9', joinedAt: '2025-10-05T16:20:00Z', proposalsCreated: 2, votesCount: 14 },
  { address: 'mn_addr_undeployed1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d', joinedAt: '2025-10-22T11:00:00Z', proposalsCreated: 2, votesCount: 11 },
  { address: 'mn_addr_undeployed1zx4c6v8b0n2m4q6w8e0r2t4y6u8i0o2p4a6s8d0f2g4h6j8k0l2z4x6c8v0b', joinedAt: '2025-11-08T08:30:00Z', proposalsCreated: 1, votesCount: 9 },
  { address: 'mn_addr_undeployed1pl0k9j8h7g6f5d4s3a2q1w0e9r8t7y6u5i4o3p2a1s0d9f8g7h6j5k4l3z2', joinedAt: '2025-11-30T13:10:00Z', proposalsCreated: 1, votesCount: 7 },
  { address: 'mn_addr_undeployed1mn3b5v7c9x1z3a5s7d9f1g3h5j7k9l1q3w5e7r9t1y3u5i7o9p1a3s5d7f9g', joinedAt: '2025-12-15T17:45:00Z', proposalsCreated: 0, votesCount: 5 },
  { address: 'mn_addr_undeployed1rt6y8u0i2o4p6a8s0d2f4g6h8j0k2l4z6x8c0v2b4n6m8q0w2e4r6t8y0u2i', joinedAt: '2026-01-03T10:20:00Z', proposalsCreated: 1, votesCount: 4 },
  { address: 'mn_addr_undeployed1fg7h9j1k3l5z7x9c1v3b5n7m9q1w3e5r7t9y1u3i5o7p9a1s3d5f7g9h1j3', joinedAt: '2026-01-14T15:50:00Z', proposalsCreated: 0, votesCount: 3 },
  { address: 'mn_addr_undeployed1we8r0t2y4u6i8o0p2a4s6d8f0g2h4j6k8l0z2x4c6v8b0n2m4q6w8e0r2t4', joinedAt: '2026-01-28T12:35:00Z', proposalsCreated: 1, votesCount: 2 },
  { address: 'mn_addr_undeployed1qs9d1f3g5h7j9k1l3z5x7c9v1b3n5m7q9w1e3r5t7y9u1i3o5p7a9s1d3f5g', joinedAt: '2026-02-06T09:15:00Z', proposalsCreated: 0, votesCount: 1 },
];

function Members({ walletConnected }) {
  const [members, setMembers] = useState([]);
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
      const apiMembers = res.data.members || [];
      // Merge API members with demo data, avoiding duplicates
      const allAddresses = new Set(apiMembers.map(m => m.address));
      const merged = [...apiMembers, ...demoMembers.filter(d => !allAddresses.has(d.address))];
      setMembers(merged);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers(demoMembers);
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
            <p className="page-subtitle">Manage DAO members and governance participation</p>
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
