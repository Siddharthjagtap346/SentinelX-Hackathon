# 🛡 SentinelX

### Autonomous Cross-Chain Risk & Reserve Enforcement Engine Powered by Chainlink CRE

---

SentinelX Hackathon Submission – Multi-chain Smart Contracts, CRE workflow automation, Proof-of-reserve feed and demo scripts demonstrating real-time monitoring, triggers, and convergence across blockchain environments for SentinelX Convergence Hackathon 2026.

---

# 🧠 What Is SentinelX?

SentinelX is a **production-grade autonomous financial risk control system** built using the **Chainlink Runtime Environment (CRE)**.

It continuously:

* Fetches real-world market prices
* Verifies custodian-signed reserve attestations
* Computes vault health ratios
* Calculates systemic risk across vaults
* Enforces cross-chain liquidations
* Freezes the entire system if Proof-of-Reserve fails

This is **not a demo UI** — it is a real automated execution engine designed for:

* Stablecoin issuers
* RWA tokenization platforms
* Cross-chain DeFi protocols
* Institutional onchain risk management

---

# 🎯 Problem We Solve

Modern DeFi systems fail because:

* Liquidations are reactive
* Reserve verification is manual
* Risk scoring is isolated per protocol
* No global systemic risk logic exists
* Cross-chain enforcement is fragile
* No autonomous pause mechanism tied to real-world data

SentinelX introduces:

> 🔥 **Autonomous, cryptographically verified, cross-chain risk enforcement powered by decentralized oracle execution.**

---

# 🏗 High-Level Architecture

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/af664147-7b73-49e1-90bd-60196f695317" />

---

# 🔗 Chains Used

### 🟢 Chain A (Vault Layer)

* RiskVault
* GlobalGuardian (global circuit breaker)
* MockStableCoin (sUSD)
* SentinelXReserveAuthority (PoR enforcement)

### 🔵 Chain B (Execution Layer)

* RiskExecutor
* Cross-chain execution guardrails
* Replay protection
* Nonce validation

CRE orchestrates actions between both chains.

---

# ⚙️ How It Works (Full Flow)

## 1️⃣ Price Consensus

* Fetches ETH price from CoinGecko (real)
* Fetches controlled internal price
* Runs deviation check
* Applies advanced consensus logic

If deviation > tolerance → flagged.

---

## 2️⃣ Custodian Reserve Verification

* Fetches `/reserve` from mock custodian
* Verifies:

  * Signature
  * Public key match
  * Timestamp freshness
  * Replay protection
* Uses median consensus aggregation
* Produces reserve health %

---

## 3️⃣ Vault Health Computation

For every vault:

```
Health Ratio = (Collateral × Price × 100) / Debt
```

Escalation tiers:

* NONE
* WARNING
* RESTRICT
* PARTIAL LIQUIDATION
* FULL LIQUIDATION

---

## 4️⃣ Systemic Risk Engine

SentinelX calculates:

* Health dispersion
* Volatility (std deviation)
* Reserve health impact
* Multi-vault correlation

Produces:

```
Systemic Risk Score (0–1)
System Health Index (0–100)
```

---

## 5️⃣ Proof-of-Reserve Enforcement

CRE sends DON-signed report to:

**SentinelXReserveAuthority**

Contract verifies:

* Backing ratio >= 100%
* Risk score below threshold
* Report freshness
* Onchain supply consistency

If violated:

```
GlobalGuardian.pause()
System frozen
```

Autonomous freeze.

---

## 6️⃣ Cross-Chain Liquidation Execution

If escalation required:

CRE → RiskExecutor (Chain B)

RiskExecutor enforces:

* Approved vault list
* Strict nonce sequencing
* Replay protection
* Message hashing
* FreezeReason tracking

Then calls vault on Chain A.

---

# 🔐 Security Features

* DON-signed CRE reports
* Signature-verified custodian attestations
* Replay protection (hash + nonce)
* Cross-chain message integrity
* Global circuit breaker
* Escalation state machine enforcement
* Freshness enforcement for reserve data
* Strict owner-only administrative controls

---

# 🏦 Smart Contracts Overview

### GlobalGuardian.sol

System-wide pause mechanism.

### RiskVault.sol

State machine driven vault liquidation contract.

### RiskExecutor.sol

Cross-chain executor with:

* Nonce tracking
* Replay protection
* Multi-vault approval
* Freeze logic

### SentinelXReserveAuthority.sol

DON-signed PoR receiver enforcing:

* Backing ratio checks
* Risk threshold checks
* Stale report detection
* Autonomous freeze/unfreeze

### MockStableCoin (sUSD)

ERC20 stablecoin.

---

# 🔄 CRE Workflow Components

* Cron trigger
* HTTP external data fetch
* Consensus median aggregation
* EVM read clients
* EVM write via report()
* PoR reporting
* Cross-chain routing
* Escalation router
* Volatility analyzer
* Systemic risk engine

---

# 📦 Deployment Commands

```
npx hardhat run scripts/deployGuardian.js --network chainA
npx hardhat run scripts/deployStable.js --network chainA
npx hardhat run scripts/deployVault.js --network chainA
npx hardhat run scripts/deployReserveAuthority.js --network chainA
```

CRE simulation:

```
cre workflow simulate ./sentinelx-workflow --target staging-settings --broadcast
```

---

# 🧪 Tenderly Integration

We use:

* Forked testnets
* Explorer verification
* Cross-chain state sync
* Transaction debugging

Demonstrates real mainnet-like behavior.

testnets 
<img width="1763" height="847" alt="image" src="https://github.com/user-attachments/assets/a566db9d-6be7-4171-b002-0276a90ac33b" />


---

# 🎥 Demo Includes

* CRE workflow execution
* Price consensus logs
* Reserve signature verification
* Systemic risk scoring
* PoR report submission
* Global freeze triggered
* Cross-chain liquidation
* Nonce enforcement logs

---

# 🔬 CRE Workflow Simulation Scenarios (Execution Proof)

Below are real CRE simulation outputs demonstrating SentinelX autonomous enforcement behavior under multiple market conditions.

Command used in all scenarios:

```bash
cre workflow simulate ./sentinelx-workflow --target staging-settings --broadcast
```

---

## 🟢 Scene 1 — Normal Market Conditions (Stable System)

### 🎯 Expected Behavior

* Price consensus succeeds
* Reserve health > 95%
* Risk score low
* No freeze
* System remains stable
* PoR report successfully submitted

### 📟 Output Snapshot

<img width="1920" height="1080" alt="scene1" src="https://github.com/user-attachments/assets/798fa492-f3f9-478b-a743-66643131a8f9" />



### 🧠 What This Proves

* Real + controlled price feeds converge correctly
* Risk engine calculates systemic score
* PoR report is generated and signed
* No global pause triggered
* Autonomous execution cycle completes successfully

---

## 🟡 Scene 2 — Price Manipulation Attempt (Consensus Deviation)

### 🎯 Expected Behavior

* Large deviation detected
* Consensus rejected
* System logs warning
* Continues in test mode (controlled execution)
* No freeze since reserve health acceptable

### 📟 Output Snapshot

<img width="1472" height="897" alt="scene2" src="https://github.com/user-attachments/assets/62295967-b455-48e0-9753-4f6f565470e2" />


### 🧠 What This Proves

* Median consensus logic detects manipulation
* Deviation threshold enforcement works
* System does not blindly trust one price feed
* Execution pipeline continues safely

---

## 🔴 Scene 3 — Reserve Breach → Autonomous Freeze

### 🎯 Expected Behavior

* Reserve health drops to 85%
* EMERGENCY triggered
* Global freeze executed
* Cross-chain executor invoked
* Nonce verification enforced
* DON report submitted

### 📟 Output Snapshot

<img width="1487" height="905" alt="scene3" src="https://github.com/user-attachments/assets/bafba381-77e8-416d-9a3a-4db2d21d323f" />

### 🧠 What This Proves

* Proof-of-Reserve failure automatically triggers freeze
* GlobalGuardian.pause() executed
* Cross-chain execution enforced via RiskExecutor
* Nonce + replay protection validated
* Fully autonomous system shutdown

This is infrastructure-grade enforcement logic.

---

## 🔵 Scene 4 — Controlled Market Crash Escalation Ladder

### 🎯 Expected Behavior

Gradual crash triggers escalation tiers:

1. WARNING
2. RESTRICT
3. PARTIAL
4. Potential FULL (if threshold crossed)

### 📟 Output Snapshot

<img width="1920" height="1080" alt="Screenshot 2026-03-02 155220" src="https://github.com/user-attachments/assets/74e964eb-d4d0-4301-acd4-c3d3a1ce4d1a" />

<img width="1920" height="1080" alt="Screenshot 2026-03-02 155249" src="https://github.com/user-attachments/assets/841935bf-c7d1-4012-9586-46b2d896c1e7" />



### 🧠 What This Proves

* Multi-stage liquidation logic works
* Escalation state machine enforced
* Nonce sequencing validated
* Cross-chain message integrity preserved
* Policy reacts progressively — not abruptly

This demonstrates real-world crash response modeling.

---

# 🧪 Tenderly Execution Validation

SentinelX was validated using forked testnets on **Tenderly** to simulate real-world cross-chain execution, contract enforcement, and transaction tracing.

This demonstrates:

* Real contract deployment on both chains
* Cross-chain execution via RiskExecutor
* Nonce enforcement & replay protection
* Global pause mechanism
* Deterministic state transitions

---

# 🔗 Chain Architecture Overview

SentinelX operates across two independent EVM chains:

| Chain      | Role            | Purpose                                                     |
| ---------- | --------------- | ----------------------------------------------------------- |
| 🟢 Chain A | Vault Layer     | Asset storage, reserve enforcement, system freeze authority |
| 🔵 Chain B | Execution Layer | Cross-chain liquidation executor, replay protection         |

---

# 🟢 Chain A — Vault & Reserve Enforcement Layer

### 📜 Contracts Deployed on Chain A

* `GlobalGuardian.sol` → Global circuit breaker
* `RiskVault.sol` → Vault health & liquidation state machine
* `MockStableCoin (sUSD)` → ERC20 stablecoin
* `SentinelXReserveAuthority.sol` → DON-signed Proof-of-Reserve enforcement

---

### 📸 Chain A — Network Environment

<img width="1763" height="1455" alt="ChainA Network" src="https://github.com/user-attachments/assets/54df0f5e-7cf2-455e-9e90-5e76e7e3f268" />

**What This Shows:**

* Forked EVM environment
* Active chain simulation
* Deployed contract environment

---

### 📸 Contracts Deployed on Chain A

<img width="1763" height="847" alt="ChainA Contracts" src="https://github.com/user-attachments/assets/052b1338-7127-40c0-ace8-b91ebbd81597" />

**What This Proves:**

* All Vault-layer contracts deployed successfully
* Guardian + ReserveAuthority live
* Stablecoin supply tracked on-chain
* System pause state verifiable

---

# 🔵 Chain B — Cross-Chain Execution Layer

### 📜 Contracts Deployed on Chain B

* `RiskExecutor.sol` → Cross-chain enforcement engine
* Nonce validation storage
* Approved vault registry
* Replay protection mapping
* Escalation enforcement logic

Chain B only executes actions authorized by CRE and verified by nonce sequencing.

---

### 📸 Chain B — Network Environment

<img width="1763" height="1010" alt="ChainB Network" src="https://github.com/user-attachments/assets/e6ff7667-d1b1-4a80-93ff-f3acf40ecf71" />

**What This Shows:**

* Independent execution chain
* Isolated enforcement layer
* Cross-chain separation of concerns

---

### 📸 Contracts Deployed on Chain B

<img width="1763" height="847" alt="ChainB Contracts" src="https://github.com/user-attachments/assets/68eefc6e-b3c8-4ae9-bbd7-323d1166ea7b" />

**What This Shows:**

* RiskExecutor successfully deployed
* Nonce tracking storage initialized
* Cross-chain executor live
* Replay protection enforced

---

# 🔐 Cross-Chain Enforcement Proof

Using Tenderly transaction tracing we validated:

* FREEZE execution calls
* Escalation tier transitions
* Nonce increment correctness
* Cross-chain message hashing
* Guardian.pause() invocation
* Report submission to ReserveAuthority

All state changes were verified through debug trace inspection.

---

### 🖼 Screenshot Placement Format

Use this format in README:

```markdown
### 🔹 Global Freeze Transaction (Tenderly)

![Freeze Execution](./screenshots/freeze-transaction.png)

Shows RiskExecutor executing FREEZE with correct nonce validation.
```

Repeat for:

* `guardian-paused.png`
* `nonce-verification.png`
* `cross-chain-call.png`
* `report-submission.png`

---


# 🏆 Prize Track Justification

## ✅ Risk & Compliance

* Automated risk monitoring
* Real-time reserve health checks
* Protocol safeguard triggers
* Autonomous freeze system

## ✅ DeFi & Tokenization

* Stablecoin backing enforcement
* Vault liquidation engine
* Cross-chain state enforcement

## ✅ Tenderly Track

* Workflow execution on virtual testnets
* Cross-chain validation
* Debug trace validation

## ✅ Top 10

Full production-grade CRE integration.

---

# 🧠 Innovation Highlights

* System-wide risk intelligence (not per vault)
* Cross-chain autonomous enforcement
* DON-signed PoR with real pause authority
* Custodian signature cryptographic verification
* Multi-stage liquidation escalation
* Volatility-aware policy override
* Replay-protected executor layer

---

# 📈 Why SentinelX Wins

Most projects:

* Use oracles for price feeds
* Stop there

SentinelX:

* Uses CRE as an autonomous control layer
* Executes real cross-chain enforcement
* Verifies signed offchain attestations
* Computes systemic risk
* Enforces reserve integrity onchain
* Includes replay + nonce protection
* Includes global circuit breaker

This is infrastructure-level innovation.

---

# 🔮 Future Expansion

* ZK-proof reserve attestations
* Multi-custodian quorum verification
* AI anomaly detection
* Real-world RWA oracle feeds
* Institutional compliance modules

---

# 👤 Built By

Siddharth Jagtap
Solo Builder
Chainlink Convergence Hackathon 2026

---
