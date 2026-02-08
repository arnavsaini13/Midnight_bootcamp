# 💰 Money Flow in Your DAO

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    TREASURY WALLET                          │
│                  Balance: 31,325 NIGHT                      │
│           (was 31,330, deducted 5 from Proposal #1)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Members deposit funds
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              PROPOSAL CREATION (No $ movement)              │
│  - Member creates proposal: "Send 5 NIGHT to Alice"        │
│  - Stored in backend, status: "active"                     │
│  - NO money moved yet                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Members vote (private)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               VOTING PHASE (No $ movement)                  │
│  - Member 1: YES (private vote)                            │
│  - Member 2: YES (private vote)                            │
│  - Member 3: YES (private vote)                            │
│  - Member 4: NO  (private vote)                            │
│  - Total: 3 YES, 1 NO → PASSED ✅                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Execute button clicked
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           EXECUTION PHASE (💰 MONEY MOVES HERE!)           │
│                                                             │
│  1. Check votes: 3 YES > 1 NO ✅                           │
│  2. Check quorum: 4 total votes >= 4 ✅                    │
│  3. Check balance: 31,330 NIGHT >= 5 NIGHT ✅              │
│  4. DEDUCT: 31,330 - 5 = 31,325 NIGHT ✅                   │
│  5. Record recipient: Alice                                │
│  6. Update status: "executed"                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    TREASURY UPDATED                         │
│                  Balance: 31,325 NIGHT ✅                   │
│                                                             │
│  Alice receives: 5 NIGHT                                   │
│  Treasury has: 31,325 NIGHT remaining                      │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Money Flow

### 1️⃣ Create Proposal
```javascript
POST /api/proposals
{
  "recipient": "mn_addr_Alice...",
  "amount": "5000000",  // 5 NIGHT
  "description": "Development grant for Alice"
}

Response:
{
  "success": true,
  "proposal": {
    "id": 2,
    "status": "active",
    "amount": "5000000"
  }
}

💡 Treasury Balance: 31,325 NIGHT (unchanged)
```

### 2️⃣ Members Vote
```javascript
POST /api/proposals/2/vote
{
  "vote": "yes"
}

Response:
{
  "success": true,
  "message": "Vote recorded (private)",
  "proposal": {
    "yesVotes": 1,
    "noVotes": 0
  }
}

💡 Treasury Balance: 31,325 NIGHT (unchanged)
```

### 3️⃣ Execute Proposal (THIS IS WHERE MONEY MOVES!)
```javascript
POST /api/proposals/2/execute

Backend checks:
1. Is proposal active? ✅
2. Does it have enough votes? ✅ (4 total, 3 YES)
3. Does treasury have enough funds? ✅ (31,325 >= 5)

Backend executes:
await contractService.deductFromBalance("5000000")

Response:
{
  "success": true,
  "passed": true,
  "balanceUpdate": {
    "previousBalance": "31325 NIGHT",
    "deducted": "5 NIGHT",
    "newBalance": "31320 NIGHT",
    "recipient": "mn_addr_Alice..."
  },
  "message": "Proposal executed! 5 NIGHT transferred to recipient."
}

💡 Treasury Balance: 31,320 NIGHT ✅ (reduced by 5)
```

### 4️⃣ Check New Balance
```javascript
GET /api/contract/balance

Response:
{
  "success": true,
  "data": {
    "balance": "31320000000",
    "formatted": "31320 NIGHT"
  }
}

💡 Balance reflects the deduction ✅
```

## Multiple Proposals Example

```
Starting Balance: 31,320 NIGHT

┌──────────────────────────────────────────────────────┐
│ Proposal #2: Send 5 NIGHT to Alice                  │
│ Status: Executed ✅                                  │
│ Balance after: 31,320 NIGHT                         │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Proposal #3: Send 10 NIGHT to Bob                   │
│ Votes: 4 YES, 0 NO → PASSED                        │
│ Execute → Balance: 31,310 NIGHT ✅                  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Proposal #4: Send 100 NIGHT to Carol                │
│ Votes: 1 YES, 3 NO → REJECTED ❌                    │
│ Execute → Balance: 31,310 NIGHT (unchanged)        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Proposal #5: Send 50,000 NIGHT to Dave              │
│ Votes: 4 YES, 0 NO → PASSED                        │
│ Execute → ERROR: Insufficient balance ❌            │
│ Balance: 31,310 NIGHT (not enough!)                │
└──────────────────────────────────────────────────────┘

Final Balance: 31,310 NIGHT
Total Distributed: 15 NIGHT (Alice 5 + Bob 10)
```

## What You See in the UI

### Dashboard Component
```jsx
Treasury Balance: 31,320 NIGHT
Total Proposals: 5
Active Proposals: 1
Executed: 3 (Alice: 5N, Bob: 10N, [Proposal #1]: 5N)
```

### When You Execute a Proposal
```
Before:
┌─────────────────────────────────────┐
│ Proposal #3: Send 10 NIGHT to Bob  │
│ Status: Active                      │
│ Votes: 4 YES, 0 NO                 │
│ [Execute] button                    │
└─────────────────────────────────────┘

Click Execute →

Alert Message:
┌─────────────────────────────────────┐
│ ✅ Proposal Executed Successfully!  │
│                                     │
│ 💰 Balance Update:                  │
│    Previous: 31320 NIGHT           │
│    Deducted: 10 NIGHT              │
│    New Balance: 31310 NIGHT        │
│                                     │
│ 📤 Recipient: mn_addr_undeployed... │
└─────────────────────────────────────┘

After:
┌─────────────────────────────────────┐
│ Proposal #3: Send 10 NIGHT to Bob  │
│ Status: Executed ✅                 │
│ Votes: 4 YES, 0 NO                 │
│ Executed: 2026-02-08                │
└─────────────────────────────────────┘

Dashboard updates automatically:
Treasury Balance: 31,310 NIGHT ✅
```

## Safety Checks

### 1. Insufficient Balance
```javascript
Proposal: Send 50,000 NIGHT
Treasury: 31,310 NIGHT

Error: "Insufficient treasury balance. Have: 31310000000, Need: 50000000000"

Result: Proposal NOT executed, balance unchanged ✅
```

### 2. Not Enough Votes
```javascript
Proposal: Send 10 NIGHT
Votes: 2 YES, 1 NO (only 3 total, need 4)

Result: Proposal NOT executed, balance unchanged ✅
```

### 3. More NO than YES
```javascript
Proposal: Send 10 NIGHT
Votes: 1 YES, 3 NO

Result: Proposal rejected, balance unchanged ✅
```

## Backend Code Flow

```javascript
// 1. Receive execute request
router.post('/:id/execute', async (req, res) => {
  
  // 2. Find the proposal
  const proposal = proposals.find(p => p.id === parseInt(req.params.id));
  
  // 3. Check votes
  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const passed = proposal.yesVotes > proposal.noVotes && totalVotes >= 4;
  
  if (passed) {
    // 4. Deduct money from treasury (THIS IS WHERE MONEY MOVES!)
    const balanceUpdate = await contractService.deductFromBalance(proposal.amount);
    //    ↑ This subtracts the amount from treasury balance
    
    // 5. Update proposal status
    proposal.status = 'executed';
    proposal.executedAt = new Date().toISOString();
    
    // 6. Return success with balance details
    res.json({ 
      success: true,
      balanceUpdate: {
        previousBalance: "31320 NIGHT",
        deducted: "10 NIGHT",
        newBalance: "31310 NIGHT",
        recipient: proposal.recipient
      }
    });
  }
});
```

## Summary

| Action | Treasury Balance | Money Moved? |
|--------|------------------|--------------|
| Create Proposal | Unchanged | ❌ No |
| Vote on Proposal | Unchanged | ❌ No |
| Execute (Rejected) | Unchanged | ❌ No |
| Execute (Passed) | **Decreased** | ✅ **YES!** |
| Check Balance | Shows current | - |

**The answer to your question: YES, when you execute a proposal that passes, your treasury balance IS deducted!** ✅

---

**Try it yourself:**
1. Open http://localhost:3000
2. Dashboard → See current balance
3. Proposals → Create new proposal
4. Vote YES enough times (4+ votes)
5. Execute → Watch the money get deducted!
6. Dashboard → See updated balance ✅
