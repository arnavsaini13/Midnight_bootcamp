import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Wallet, Home, Users, FileText, Info, Trophy, LayoutDashboard, Vote, Shield } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Proposals from './components/Proposals';
import Members from './components/Members';
import Leaderboard from './components/Leaderboard';
import About from './components/About';
import './App.css';
import './components/ModernStyles.css';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('mn_addr_undeployed1ec4yxmxfvqyfj23859f5dyg9zvkpw0jh7u3tu9zzrn3d89chv83q5gyqy5');
  const [treasuryBalance, setTreasuryBalance] = useState(62674);
  const [activeProposals, setActiveProposals] = useState(4);

  useEffect(() => {
    setWalletConnected(true);
  }, []);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 14)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <div className="nav-brand">
                <div className="logo-icon">
                  <div className="logo-glow"></div>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="url(#logoGrad)" opacity="0.25"/>
                    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none"/>
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="logoGrad" x1="3" y1="2" x2="21" y2="25">
                        <stop offset="0%" stopColor="#a78bfa"/>
                        <stop offset="100%" stopColor="#6366f1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <div className="brand-name">Private<span className="brand-accent">DAO</span></div>
                  <div className="brand-subtitle">MIDNIGHT CHAIN</div>
                </div>
              </div>
              
              <div className="nav-links">
                <NavLink to="/" end className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}>
                  <Home size={18} />
                  Home
                </NavLink>
                <NavLink to="/proposals" className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}>
                  <Vote size={18} />
                  Proposals
                </NavLink>
                <NavLink to="/leaderboard" className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}>
                  <Trophy size={18} />
                  Leaderboard
                </NavLink>
                <NavLink to="/members" className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}>
                  <Users size={18} />
                  Members
                </NavLink>
                <NavLink to="/about" className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}>
                  <Info size={18} />
                  About
                </NavLink>
              </div>

              <div className="wallet-connected">
                <div className="wallet-badge">
                  <span className="wallet-status">
                    <span className="pulse-dot"></span>
                    {treasuryBalance.toLocaleString()} tNIGHT
                  </span>
                  <span className="wallet-address" title={walletAddress}>{truncateAddress(walletAddress)}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <div className="container">
            <div className="page-transition">
              <Routes>
                <Route path="/" element={<Dashboard walletConnected={walletConnected} walletAddress={walletAddress} treasuryBalance={treasuryBalance} activeProposals={activeProposals} />} />
                <Route path="/dashboard" element={<Dashboard walletConnected={walletConnected} walletAddress={walletAddress} treasuryBalance={treasuryBalance} activeProposals={activeProposals} />} />
                <Route path="/proposals" element={<Proposals walletConnected={walletConnected} walletAddress={walletAddress} treasuryBalance={treasuryBalance} setTreasuryBalance={setTreasuryBalance} activeProposals={activeProposals} setActiveProposals={setActiveProposals} />} />
                <Route path="/leaderboard" element={<Leaderboard walletConnected={walletConnected} />} />
                <Route path="/members" element={<Members walletConnected={walletConnected} />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </div>
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <Shield size={20} />
                <span>PrivateDAO Treasury</span>
              </div>
              <p className="footer-text">© 2026 PrivateDAO • Built on Midnight Protocol • Privacy-First Governance</p>
              <div className="footer-links">
                <a href="https://midnight.network" target="_blank" rel="noopener noreferrer">Midnight</a>
                <span className="footer-divider">•</span>
                <a href="https://docs.midnight.network" target="_blank" rel="noopener noreferrer">Docs</a>
                <span className="footer-divider">•</span>
                <a href="https://discord.gg/midnight" target="_blank" rel="noopener noreferrer">Discord</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
