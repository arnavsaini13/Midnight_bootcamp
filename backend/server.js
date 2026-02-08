import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contractRoutes from './routes/contract.js';
import proposalRoutes from './routes/proposals.js';
import memberRoutes from './routes/members.js';
import contractService from './services/contractService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contract', contractRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/members', memberRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    contract: 'PrivateDAO Treasury',
    network: process.env.NETWORK_ID || 'undeployed'
  });
});

// Initialize contract service and start server
async function startServer() {
  try {
    console.log('\n🔧 Initializing contract service...');
    await contractService.initialize();
    
    app.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════════╗');
      console.log('║   🚀 PrivateDAO Backend Server Running   ║');
      console.log('╚════════════════════════════════════════════╝\n');
      console.log(`📡 API Server: http://localhost:${PORT}`);
      console.log(`🔐 Network: ${process.env.NETWORK_ID || 'undeployed'}`);
      console.log(`📊 Status: READY\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
