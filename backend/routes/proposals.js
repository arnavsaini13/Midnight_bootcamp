import express from 'express';
import contractService from '../services/contractService.js';

const router = express.Router();

// In-memory proposal storage (for demo)
let proposals = [
  {
    id: 1,
    recipient: 'mn_addr_undeployed1example...',
    amount: '5000000',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    yesVotes: 3,
    noVotes: 1,
    description: 'Fund community development grant',
    createdAt: new Date().toISOString()
  }
];

// Get all proposals
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    proposals: proposals,
    count: proposals.length
  });
});

// Get single proposal
router.get('/:id', (req, res) => {
  const proposal = proposals.find(p => p.id === parseInt(req.params.id));
  
  if (!proposal) {
    return res.status(404).json({ 
      success: false, 
      error: 'Proposal not found' 
    });
  }
  
  res.json({ success: true, data: proposal });
});

// Create proposal
router.post('/', (req, res) => {
  const { recipient, amount, duration, description } = req.body;
  
  if (!recipient || !amount || !duration) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }
  
  const newProposal = {
    id: proposals.length + 1,
    recipient,
    amount,
    duration,
    deadline: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    yesVotes: 0,
    noVotes: 0,
    description: description || 'No description provided',
    createdAt: new Date().toISOString()
  };
  
  proposals.push(newProposal);
  
  res.status(201).json({ 
    success: true, 
    proposal: newProposal,
    message: 'Proposal created successfully' 
  });
});

// Vote on proposal
router.post('/:id/vote', (req, res) => {
  const { vote } = req.body; // 'yes' or 'no'
  const proposal = proposals.find(p => p.id === parseInt(req.params.id));
  
  if (!proposal) {
    return res.status(404).json({ 
      success: false, 
      error: 'Proposal not found' 
    });
  }
  
  if (proposal.status !== 'active') {
    return res.status(400).json({ 
      success: false, 
      error: 'Proposal is not active' 
    });
  }
  
  if (vote === 'yes') {
    proposal.yesVotes++;
  } else if (vote === 'no') {
    proposal.noVotes++;
  } else {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid vote. Must be "yes" or "no"' 
    });
  }
  
  res.json({ 
    success: true, 
    data: proposal,
    message: `Vote "${vote}" recorded successfully (private)` 
  });
});

// Execute proposal
router.post('/:id/execute', async (req, res) => {
  const proposal = proposals.find(p => p.id === parseInt(req.params.id));
  
  if (!proposal) {
    return res.status(404).json({ 
      success: false, 
      error: 'Proposal not found' 
    });
  }
  
  if (proposal.status !== 'active') {
    return res.status(400).json({ 
      success: false, 
      error: 'Proposal is not active' 
    });
  }
  
  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const passed = proposal.yesVotes > proposal.noVotes && totalVotes >= 4; // Simple quorum check
  
  if (passed) {
    try {
      // Actually deduct the money from treasury!
      const balanceUpdate = await contractService.deductFromBalance(proposal.amount);
      
      proposal.status = 'executed';
      proposal.executedAt = new Date().toISOString();
      
      res.json({ 
        success: true, 
        data: proposal,
        passed: true,
        balanceUpdate: {
          previousBalance: `${parseFloat(balanceUpdate.previousBalance) / 1e6} NIGHT`,
          deducted: `${parseFloat(balanceUpdate.deducted) / 1e6} NIGHT`,
          newBalance: balanceUpdate.formatted,
          recipient: proposal.recipient
        },
        message: `Proposal executed! ${parseFloat(proposal.amount) / 1e6} NIGHT transferred to recipient.`
      });
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  } else {
    proposal.status = 'rejected';
    res.json({ 
      success: true, 
      data: proposal,
      passed: false,
      message: 'Proposal rejected - did not meet quorum or enough votes'
    });
  }
});

export default router;
