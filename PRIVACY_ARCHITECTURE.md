# PrivateDAO Treasury - Privacy Architecture Diagram

## Information Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     PRIVATEDAO TREASURY - PRIVACY BOUNDARIES                     │
└─────────────────────────────────────────────────────────────────────────────────┘

                          PROPOSAL CREATION PHASE
                          ═══════════════════════
                                      
    User Secret Inputs:              Commitment Creation:              Public Output:
    ┌──────────────┐                 ┌──────────────────┐              ┌───────────┐
    │ Amount       │────────────────>│ PoseidonHash     │────────────>│ Commitment│
    │ + Blinding   │  ZK Circuit     │ (amount,blind)   │   Binding   │ Hash      │
    └──────────────┘                 └──────────────────┘              └───────────┘
           🔒                                ⚙️                              📢
       FOREVER                          COMPUTATION                      OBSERVABLE
       PRIVATE                          IN ZK PROOF                      ON-CHAIN


                              VOTING PHASE
                              ════════════
                                      
    Vote Choice:                 Private Tally:              Public Output:
    ┌──────────┐                 ┌─────────────┐             ┌──────────┐
    │ YES/NO   │───────────────>│ yesVotes += │             │ NONE     │
    │ (Bool)   │  ZK Circuit    │ voterWeight │   Hidden    │          │
    └──────────┘                 └─────────────┘   Forever   └──────────┘
        🔒                              🔒                         ❌
    PERMANENTLY                    ACCUMULATED                NO PUBLIC
    PRIVATE                        IN PRIVATE                 REVELATION
                                   STATE


                           FINALIZATION PHASE
                           ══════════════════
                                      
    Private State:               ZK Comparison:              Public Output:
    ┌──────────────┐             ┌──────────────┐            ┌──────────┐
    │ yesVotes: 80 │────────────>│ yes > no     │──────────>│ isPassed │
    │ noVotes: 20  │ ZK Circuit  │ total >= Q   │  Boolean  │ = true   │
    └──────────────┘             └──────────────┘   Only     └──────────┘
         🔒                              ⚙️                        📢
    STAY PRIVATE                   COMPUTATION                ONLY RESULT
    FOREVER                        IN ZK PROOF                REVEALED


                            EXECUTION PHASE
                            ═══════════════
                                      
    Secret Reveal:               Verification:               Public Action:
    ┌──────────────┐             ┌──────────────┐            ┌──────────┐
    │ Amount       │────────────>│ Hash matches │──────────>│ Transfer │
    │ + Blinding   │  Recompute  │ commitment?  │   Execute │ 50,000   │
    └──────────────┘             └──────────────┘            └──────────┘
         🔐                              ✓                         📢
    REVEALED AT                     VERIFIED                  ON-CHAIN
    EXECUTION                       CORRECT                   VISIBLE


═══════════════════════════════════════════════════════════════════════════════════

                        PRIVACY GUARANTEE MATRIX
                        ════════════════════════

┌──────────────────────┬──────────┬──────────┬──────────────┬───────────┬──────────┐
│ Data Type            │ Creation │ Voting   │ Finalization │ Execution │ Forever  │
├──────────────────────┼──────────┼──────────┼──────────────┼───────────┼──────────┤
│ Proposal Amount      │ 🔒 Hash  │ 🔒 Hide  │ 🔒 Hide      │ 🔓 Reveal │ 📢 Public│
│ Proposer Identity    │ 🔒 Hash  │ 🔒 Hide  │ 🔒 Hide      │ 🔐 Verify │ 🔐 Secret│
│ Vote Choice          │ N/A      │ 🔒 ZK    │ 🔒 ZK        │ 🔒 ZK     │ 🔒 NEVER │
│ Vote Totals          │ N/A      │ 🔒 Priv  │ 🔒 Priv      │ 🔒 Priv   │ 🔒 NEVER │
│ Voter Weights        │ 🔒 Store │ 🔒 Priv  │ 🔒 Priv      │ 🔒 Priv   │ 🔒 NEVER │
│ Final Result         │ N/A      │ ❓ TBD   │ 📢 Public    │ 📢 Public │ 📢 Public│
└──────────────────────┴──────────┴──────────┴──────────────┴───────────┴──────────┘

Legend: 🔒 Private | 🔓 Revealed | 🔐 Verified | 📢 Public | ❓ Unknown | ❌ None


═══════════════════════════════════════════════════════════════════════════════════

                    ANTI-MANIPULATION ARCHITECTURE
                    ═══════════════════════════════

    Flash Loan Attack Prevention:
    
    Attacker Plan:                          PrivateDAO Defense:
    ┌──────────────────────────┐            ┌──────────────────────────┐
    │ 1. Borrow 1M tokens      │            │ Cannot execute same      │
    │ 2. Vote to drain         │──────X────>│ block as vote due to     │
    │ 3. Execute immediately   │  BLOCKED   │ executionDelay timelock  │
    │ 4. Repay loan same block │            │ (10 blocks minimum)      │
    └──────────────────────────┘            └──────────────────────────┘
                                                       ⛔
                                               ATTACK PREVENTED


    Front-Running Prevention:
    
    Attacker Plan:                          PrivateDAO Defense:
    ┌──────────────────────────┐            ┌──────────────────────────┐
    │ 1. See large transfer    │            │ Amount hidden via        │
    │ 2. Front-run trade       │──────X────>│ Poseidon commitment      │
    │ 3. Profit from pump      │  BLOCKED   │ No info to front-run     │
    └──────────────────────────┘            └──────────────────────────┘
                                                       ⛔
                                               ATTACK PREVENTED


    Vote Buying Prevention:
    
    Attacker Plan:                          PrivateDAO Defense:
    ┌──────────────────────────┐            ┌──────────────────────────┐
    │ 1. Pay voters to vote YES│            │ Votes are ZK-proof       │
    │ 2. Verify they voted YES │──────X────>│ private - cannot prove   │
    │ 3. Release payment       │  BLOCKED   │ how you voted            │
    └──────────────────────────┘            └──────────────────────────┘
                                                       ⛔
                                               ATTACK PREVENTED


    Parameter Manipulation Prevention:
    
    Attacker Plan:                          PrivateDAO Defense:
    ┌──────────────────────────┐            ┌──────────────────────────┐
    │ 1. See vote losing       │            │ Quorum snapshotted at    │
    │ 2. Lower quorum          │──────X────>│ proposal creation -      │
    │ 3. Force proposal to pass│  BLOCKED   │ changes don't affect it  │
    └──────────────────────────┘            └──────────────────────────┘
                                                       ⛔
                                               ATTACK PREVENTED


═══════════════════════════════════════════════════════════════════════════════════

                        STATE MACHINE FLOW
                        ══════════════════

    ┌──────────┐
    │ PROPOSAL │
    │ CREATED  │
    └────┬─────┘
         │ Amount COMMITTED (hidden)
         │ Proposer COMMITTED (hidden)
         │ Quorum SNAPSHOTTED (fixed)
         ↓
    ┌──────────┐
    │  VOTING  │
    │  ACTIVE  │<──────────────────────────────────┐
    └────┬─────┘                                    │
         │ Vote choice ZK-private                   │
         │ Vote totals accumulated privately        │ Members cast
         │ Weights retrieved privately              │ private votes
         │                                           │
         ↓                                           │
    ┌──────────┐                                    │
    │ DEADLINE │                                    │
    │ REACHED  │────────────────────────────────────┘
    └────┬─────┘
         │
         ↓
    ┌──────────┐
    │FINALIZED │
    └────┬─────┘
         │ Vote totals compared IN ZK
         │ ONLY boolean result revealed
         │
         ├──────── isPassed = false ───────> Proposal REJECTED (end)
         │
         ↓ isPassed = true
    ┌──────────┐
    │ TIMELOCK │
    │ WAITING  │
    └────┬─────┘
         │ executionDelay blocks pass
         │ Community review period
         │ Cannot execute during wait
         ↓
    ┌──────────┐
    │EXECUTABLE│
    └────┬─────┘
         │ Amount revealed & verified
         │ Proposer verified (commitment)
         │ Funds transferred
         ↓
    ┌──────────┐
    │ EXECUTED │
    │ COMPLETE │
    └──────────┘


═══════════════════════════════════════════════════════════════════════════════════

                    COMMITMENT SCHEME DETAIL
                    ════════════════════════

    CREATION TIME:
    ══════════════
    
    Secret Values:                    Commitment:
    ┌─────────────────┐              ┌────────────────────────────────┐
    │ amount = 50,000 │              │                                │
    │ blinding = 0x7a │─────────────>│ commitment = PoseidonHash(    │
    │                 │  Hash Inputs │   amount,                      │
    │                 │              │   blinding                     │
    └─────────────────┘              │ )                              │
                                     │                                │
                                     │ = 0x3f4e9a2b...                │
                                     └────────────────────────────────┘
                                              📢 Stored on-chain
                                              
    Properties:
    • Cannot determine amount from commitment (preimage resistance)
    • Cannot create two amounts with same commitment (collision resistance)
    • Cannot change amount after commitment (binding)


    EXECUTION TIME:
    ═══════════════
    
    Reveals:                          Verification:
    ┌─────────────────┐              ┌────────────────────────────────┐
    │ amount = 50,000 │              │ recomputed = PoseidonHash(     │
    │ blinding = 0x7a │─────────────>│   amount,                      │
    │                 │  Recompute   │   blinding                     │
    │                 │              │ )                              │
    └─────────────────┘              │                                │
                                     │ = 0x3f4e9a2b...                │
                                     │                                │
                                     │ ✓ Matches stored commitment?   │
                                     └────────────────────────────────┘
                                              ✓ Verified!
                                              
    Result:
    • Amount proven correct without early revelation
    • Market manipulation prevented (amount was hidden)
    • Executor must know original secrets


═══════════════════════════════════════════════════════════════════════════════════

                    VS. TRADITIONAL DAO COMPARISON
                    ═══════════════════════════════

    SNAPSHOT DAO:                           PRIVATEDAO TREASURY:
    ┌─────────────────────────────┐         ┌─────────────────────────────┐
    │ Vote Choice: PUBLIC         │         │ Vote Choice: PRIVATE (ZK)   │
    │ Vote Totals: PUBLIC         │         │ Vote Totals: NEVER REVEALED │
    │ Proposer: PUBLIC            │         │ Proposer: COMMITTED         │
    │ Amount: N/A (off-chain)     │         │ Amount: COMMITTED           │
    │ Vote Buying: POSSIBLE       │         │ Vote Buying: IMPOSSIBLE     │
    │ Strategic Voting: POSSIBLE  │         │ Strategic Voting: BLOCKED   │
    └─────────────────────────────┘         └─────────────────────────────┘
               ❌ Weak Privacy                       ✅ Strong Privacy


    ARAGON DAO:                             PRIVATEDAO TREASURY:
    ┌─────────────────────────────┐         ┌─────────────────────────────┐
    │ Everything PUBLIC           │         │ Votes PRIVATE forever       │
    │ Front-running: POSSIBLE     │         │ Front-running: BLOCKED      │
    │ Flash Loans: VULNERABLE     │         │ Flash Loans: BLOCKED        │
    │ Vote Totals: ALWAYS VISIBLE │         │ Vote Totals: NEVER VISIBLE  │
    └─────────────────────────────┘         └─────────────────────────────┘
            ❌ No Privacy                          ✅ Full Privacy


═══════════════════════════════════════════════════════════════════════════════════

                        KEY INNOVATION SUMMARY
                        ══════════════════════

    1. FOREVER-PRIVATE VOTE TOTALS
       Most DAOs reveal vote counts → enables vote buying verification
       PrivateDAO NEVER reveals totals → vote buying impossible ✅

    2. COMMITMENT-BASED AMOUNTS
       Most DAOs show amounts upfront → enables front-running
       PrivateDAO hides until execution → front-running blocked ✅

    3. PROPOSER IDENTITY PROTECTION
       Most DAOs expose proposers → enables targeting/coercion
       PrivateDAO uses commitments → proposers protected ✅

    4. INTEGRATED TIMELOCK
       Some DAOs lack timelock → flash loan attacks possible
       PrivateDAO requires delay → flash loans blocked ✅

    5. SNAPSHOT GOVERNANCE
       Some DAOs allow parameter changes → manipulation possible
       PrivateDAO snapshots rules → manipulation blocked ✅


═══════════════════════════════════════════════════════════════════════════════════
```
