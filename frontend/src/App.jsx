import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Wallet, Home, Users, FileText, Info, Trophy } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Proposals from './components/Proposals';
import Members from './components/Members';
import Leaderboard from './components/Leaderboard';
import About from './components/About';
import './App.css';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = () => {
    // Simulated wallet connection
    const mockAddress = 'mn_addr_undeployed13mlltk36vafmkk4ukm...st5eumy';
    setWalletAddress(mockAddress);
    setWalletConnected(true);
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <div className="nav-brand">
                <span className="logo">🔐</span>
                <span className="brand-name">PrivateDAO</span>
              </div>
              
              <div className="nav-links">
                <Link to="/" className="nav-link">
                  <Home size={18} />
                  Dashboard
                </Link>
                <Link to="/proposals" className="nav-link">
                  <FileText size={18} />
                  Proposals
                </Link>
                <Link to="/members" className="nav-link">
                  <Users size={18} />
                  Members
                </Link>
                <Link to="/about" className="nav-link">
                  <Info size={18} />
                  About
                </Link>
              </div>

              <button 
                className={`btn ${walletConnected ? 'btn-connected' : 'btn-primary'}`}
                onClick={connectWallet}
                disabled={walletConnected}
              >
                <Wallet size={18} />
                {walletConnected ? `${walletAddress.substring(0, 12)}...` : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard walletConnected={walletConnected} />} />
              <Route path="/proposals" element={<Proposals walletConnected={walletConnected} />} />
              <Route path="/members" element={<Members walletConnected={walletConnected} />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p>© 2026 PrivateDAO Treasury • Built on Midnight Protocol • Privacy-First Governance</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
