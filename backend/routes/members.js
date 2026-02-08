import express from 'express';

const router = express.Router();

// In-memory member storage (for demo)
let members = [
  {
    address: 'mn_addr_undeployed13mlltk36vafmkk4ukm0cx9yn7kknuy50wtem8c9364kf7tqlv69st5eumy',
    votingWeight: 100,
    joinedAt: new Date().toISOString(),
    proposalsCreated: 1,
    votesCount: 5
  }
];

// Get all members
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    members: members,
    totalMembers: members.length,
    totalVotingPower: members.reduce((sum, m) => sum + m.votingWeight, 0)
  });
});

// Get member by address
router.get('/:address', (req, res) => {
  const member = members.find(m => m.address === req.params.address);
  
  if (!member) {
    return res.status(404).json({ 
      success: false, 
      error: 'Member not found' 
    });
  }
  
  res.json({ success: true, member: member });
});

// Register new member
router.post('/register', (req, res) => {
  const { address, votingWeight } = req.body;
  
  if (!address) {
    return res.status(400).json({ 
      success: false, 
      error: 'Address is required' 
    });
  }
  
  const existingMember = members.find(m => m.address === address);
  if (existingMember) {
    return res.status(400).json({ 
      success: false, 
      error: 'Member already registered' 
    });
  }
  
  const newMember = {
    address,
    votingWeight: votingWeight || 1,
    joinedAt: new Date().toISOString(),
    proposalsCreated: 0,
    votesCount: 0
  };
  
  members.push(newMember);
  
  res.status(201).json({ 
    success: true, 
    member: newMember,
    message: 'Member registered successfully!'
  });
});

export default router;
