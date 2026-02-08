import express from 'express';
import contractService from '../services/contractService.js';

const router = express.Router();

// Get contract information
router.get('/info', async (req, res) => {
  try {
    const info = await contractService.getContractInfo();
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get treasury balance
router.get('/balance', async (req, res) => {
  try {
    const balance = await contractService.getBalance();
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get quorum threshold
router.get('/quorum', async (req, res) => {
  try {
    const quorum = await contractService.getQuorum();
    res.json({ success: true, data: quorum });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deposit to treasury
router.post('/deposit', async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount' 
      });
    }

    // In a real implementation, this would interact with the contract
    res.json({ 
      success: true, 
      data: {
        transactionId: `tx_${Date.now()}`,
        amount,
        walletAddress,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
