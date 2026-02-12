import React, { useState } from 'react';
import { Trophy, Award, TrendingUp, Users } from 'lucide-react';
import './Components.css';
import './ModernStyles.css';

const demoMembers = [
  { address: 'mn_addr_undeployed1ec4yxmxfvqyfj23859f5dyg9zvkpw0jh7u3tu9zzrn3d89chv83q5gyqy5', votesCount: 24, proposalsCreated: 6, points: 36 },
  { address: 'mn_addr_undeployed1xk8v2m9gf4t5h7j9k2l4n6p8q0r3s5t7u9v2w4x6y8z0a2b4c6d8e0f2g4h', votesCount: 19, proposalsCreated: 4, points: 27 },
  { address: 'mn_addr_undeployed1ym9t3n8hg5u6i8k0m2o4q6s8u0w2y4a6c8e0g2i4k6m8o0q2s4u6w8y0a2b', votesCount: 17, proposalsCreated: 3, points: 23 },
];

const Leaderboard = () => {
  const [members] = useState(demoMembers);
  const [stats] = useState({
    mostActive: demoMembers[0].address,
    totalVotes: demoMembers.reduce((sum, m) => sum + m.votesCount, 0),
    proposalsCreated: demoMembers.reduce((sum, m) => sum + m.proposalsCreated, 0)
  });

  const truncAddr = (addr) => `${addr.substring(0, 18)}...${addr.substring(addr.length - 6)}`;

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
              {`${stats.mostActive.substring(0, 15)}...`}
            </p>
            <p className="stat-subtitle">{members[0].points} points</p>
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

      {/* Medal Podium */}
      <div className="section">
        <h2 className="section-title">Top Contributors</h2>

        <div className="podium-container">
          {/* 2nd Place - Left */}
          <div className="podium-spot podium-second">
            <div className="podium-medal">🥈</div>
            <div className="podium-avatar" style={{ background: 'linear-gradient(135deg, #94a3b8, #cbd5e1)' }}>2</div>
            <div className="podium-name">{truncAddr(members[1].address)}</div>
            <div className="podium-points">{members[1].points} pts</div>
            <div className="podium-stats-row">
              <span>🗳️ {members[1].votesCount} votes</span>
              <span>📋 {members[1].proposalsCreated} proposals</span>
            </div>
            <div className="podium-pillar pillar-silver"></div>
          </div>

          {/* 1st Place - Center */}
          <div className="podium-spot podium-first">
            <div className="podium-crown">👑</div>
            <div className="podium-medal">🥇</div>
            <div className="podium-avatar" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>1</div>
            <div className="podium-name">{truncAddr(members[0].address)}</div>
            <div className="podium-points">{members[0].points} pts</div>
            <div className="podium-stats-row">
              <span>🗳️ {members[0].votesCount} votes</span>
              <span>📋 {members[0].proposalsCreated} proposals</span>
            </div>
            <div className="podium-pillar pillar-gold"></div>
          </div>

          {/* 3rd Place - Right */}
          <div className="podium-spot podium-third">
            <div className="podium-medal">🥉</div>
            <div className="podium-avatar" style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}>3</div>
            <div className="podium-name">{truncAddr(members[2].address)}</div>
            <div className="podium-points">{members[2].points} pts</div>
            <div className="podium-stats-row">
              <span>🗳️ {members[2].votesCount} votes</span>
              <span>📋 {members[2].proposalsCreated} proposals</span>
            </div>
            <div className="podium-pillar pillar-bronze"></div>
          </div>
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
