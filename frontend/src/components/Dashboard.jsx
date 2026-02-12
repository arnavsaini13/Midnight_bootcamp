import { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Clock, Plus, BarChart3, ArrowUpRight, ArrowDownRight, Vote, CheckCircle2, UserPlus } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { contractAPI, proposalAPI, memberAPI } from '../services/api';
import './Components.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartDataSets = {
  '6months': {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    data: [38200, 42500, 47800, 52100, 57300, 62674]
  },
  '1year': {
    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    data: [12400, 16800, 21500, 25200, 28900, 33600, 38200, 42500, 47800, 52100, 57300, 62674]
  },
  'alltime': {
    labels: ['2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4', '2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1'],
    data: [2500, 6800, 12400, 21500, 28900, 38200, 47800, 57300, 62674]
  }
};

function Dashboard({ walletConnected, walletAddress, treasuryBalance, activeProposals }) {
  const [stats, setStats] = useState({
    totalMembers: 12,
    activeProposals: activeProposals || 4,
    totalVotes: 31
  });
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('6months');

  useEffect(() => {
    setStats(prev => ({ ...prev, activeProposals: activeProposals }));
  }, [activeProposals]);

  // Chart data for treasury performance - dynamic based on timeframe
  const activeData = chartDataSets[timeframe];
  const chartData = {
    labels: activeData.labels,
    datasets: [
      {
        label: 'Treasury Balance',
        data: activeData.data,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(139, 92, 246, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  };

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div>
          <h1 className="welcome-title">Welcome back! 👋</h1>
          <p className="welcome-subtitle">Here's what's happening with your DAO treasury today</p>
          <div className="wallet-display">
            <span className="wallet-icon">💼</span>
            <span className="wallet-text">{walletAddress || 'mn_addr_undeployed1...'}</span>
            <button className="btn-refresh">
              <span>🔄</span> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-modern">
        <div className="stat-card-modern">
          <div className="stat-header">
            <div className="stat-icon-wrapper blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h18v18H3z" fill="currentColor" opacity="0.2"/>
                <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span className="stat-trend up">↗ +12.5%</span>
          </div>
          <div className="stat-label">Treasury Balance</div>
          <div className="stat-value">{treasuryBalance.toLocaleString()} tNIGHT</div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <div className="stat-icon-wrapper pink">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" fill="currentColor" opacity="0.2"/>
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span className="stat-trend up">↗ +3 this week</span>
          </div>
          <div className="stat-label">Active Proposals</div>
          <div className="stat-value">{stats.activeProposals}</div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <div className="stat-icon-wrapper green">
              <Users size={20} />
            </div>
            <span className="stat-trend up">↗ +5 this month</span>
          </div>
          <div className="stat-label">Total Members</div>
          <div className="stat-value">{stats.totalMembers}</div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <div className="stat-icon-wrapper orange">
              <Clock size={20} />
            </div>
            <span className="stat-trend up">↗ +18 today</span>
          </div>
          <div className="stat-label">Total Votes Cast</div>
          <div className="stat-value">{stats.totalVotes}</div>
        </div>
      </div>

      {/* Treasury Performance Chart */}
      <div className="chart-container">
        <div className="chart-header">
          <h2>Treasury Performance</h2>
          <select className="chart-timeframe" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="alltime">All Time</option>
          </select>
        </div>
        <div className="chart-wrapper">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="activity-section">
        <h2 className="activity-title">Recent Activity</h2>
        <div className="activity-feed">
          <div className="activity-item">
            <div className="activity-icon activity-icon-vote">
              <Vote size={16} />
            </div>
            <div className="activity-details">
              <p className="activity-text"><strong>mn_addr...5eumy</strong> voted on <strong>Proposal #5</strong></p>
              <span className="activity-time">2 minutes ago</span>
            </div>
            <span className="activity-badge badge-success">Vote</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon activity-icon-deposit">
              <ArrowDownRight size={16} />
            </div>
            <div className="activity-details">
              <p className="activity-text"><strong>1,200 tNIGHT</strong> deposited to treasury</p>
              <span className="activity-time">18 minutes ago</span>
            </div>
            <span className="activity-badge badge-info">Deposit</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon activity-icon-execute">
              <CheckCircle2 size={16} />
            </div>
            <div className="activity-details">
              <p className="activity-text"><strong>Proposal #1</strong> was executed — <strong>5,000 tNIGHT</strong> disbursed</p>
              <span className="activity-time">1 hour ago</span>
            </div>
            <span className="activity-badge badge-purple">Executed</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon activity-icon-proposal">
              <FileText size={16} />
            </div>
            <div className="activity-details">
              <p className="activity-text"><strong>mn_addr...y8z0a</strong> created <strong>Proposal #5</strong></p>
              <span className="activity-time">3 hours ago</span>
            </div>
            <span className="activity-badge badge-warning-soft">New</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon activity-icon-member">
              <UserPlus size={16} />
            </div>
            <div className="activity-details">
              <p className="activity-text"><strong>mn_addr...a2b4c</strong> joined the DAO</p>
              <span className="activity-time">5 hours ago</span>
            </div>
            <span className="activity-badge badge-cyan">Member</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
