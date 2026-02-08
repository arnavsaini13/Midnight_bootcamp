import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, Users } from 'lucide-react';
import memberAPI from '../services/api';

const Leaderboard = () => {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    mostActive: null,
    totalVotes: 0,
    proposalsCreated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await memberAPI.getAll();
      const membersList = res.data.members || [];
      
      // Sort by voting activity
      const sorted = membersList
        .map(m => ({
          ...m,
          points: (m.votesCount || 0) * 1 + (m.proposalsCreated || 0) * 2
        }))
        .sort((a, b) => b.points - a.points);
      
      setMembers(sorted);
      
      // Calculate stats
      const totalVotes = sorted.reduce((sum, m) => sum + (m.votesCount || 0), 0);
      const proposalsCreated = sorted.reduce((sum, m) => sum + (m.proposalsCreated || 0), 0);
      
      setStats({
        mostActive: sorted[0]?.address || 'N/A',
        totalVotes,
        proposalsCreated
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLoading(false);
    }
  };

  const getMedalIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankBadge = (index) => {
    if (index === 0) return '1st';
    if (index === 1) return '2nd';
    if (index === 2) return '3rd';
    return `${index + 1}th`;
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard">
      <div className="page-header">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <p className="page-subtitle">Top contributors and active members</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fbbf24' }}>
            <Trophy size={24} />
          </div>
          <div className="stat-details">
            <h3>Most Active</h3>
            <p className="stat-value">
              {stats.mostActive ? `${stats.mostActive.substring(0, 15)}...` : 'N/A'}
            </p>
            <p className="stat-subtitle">{members[0]?.points || 0} points</p>
          </div>
          <div className="stat-trend up">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#a855f7' }}>
            <Award size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Votes Cast</h3>
            <p className="stat-value">{stats.totalVotes}</p>
            <p className="stat-subtitle">Across all proposals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Proposals Created</h3>
            <p className="stat-value">{stats.proposalsCreated}</p>
            <p className="stat-subtitle">By community</p>
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="section">
        <h2 className="section-title">Top Contributors</h2>
        
        <div className="contributors-list">
          {members.slice(0, 10).map((member, index) => (
            <div key={member.address} className={`contributor-card rank-${index + 1}`}>
              <div className="contributor-rank">
                <span className="rank-medal">{getMedalIcon(index)}</span>
              </div>
              
              <div className="contributor-avatar">
                {member.address.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="contributor-info">
                <div className="contributor-address">
                  {member.address.substring(0, 20)}...{member.address.substring(member.address.length - 8)}
                </div>
                <div className="contributor-badges">
                  {index < 3 && (
                    <span className={`badge badge-${getRankBadge(index).replace(/\d+/, '')}`}>
                      {getRankBadge(index)}
                    </span>
                  )}
                  <span className="contributor-stat">
                    🗳️ {member.votesCount || 0} votes
                  </span>
                  <span className="contributor-stat">
                    📋 {member.proposalsCreated || 0} proposals
                  </span>
                  <span className="contributor-stat">
                    ⭐ {member.points} pts
                  </span>
                </div>
              </div>
              
              <div className="contributor-points">
                <div className="points-value">{member.points}</div>
                <div className="points-label">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How Points Work */}
      <div className="section">
        <h2 className="section-title">⭐ How Points Work</h2>
        <div className="points-info">
          <div className="points-rule">
            <div className="rule-icon">🗳️</div>
            <div className="rule-details">
              <h3>Vote on Proposal</h3>
              <p>Earn 1 point for each vote cast</p>
            </div>
          </div>
          <div className="points-rule">
            <div className="rule-icon">📝</div>
            <div className="rule-details">
              <h3>Create Proposal</h3>
              <p>Earn 2 points for submitting a proposal</p>
            </div>
          </div>
          <div className="points-rule">
            <div className="rule-icon">✅</div>
            <div className="rule-details">
              <h3>Proposal Executed</h3>
              <p>Bonus points when your proposal passes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
