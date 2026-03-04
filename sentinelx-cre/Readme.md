# SentinelX CRE Workflow Engine

## Overview

The `sentinelx-cre` module is the core automation engine powering SentinelX.

It is built using the Chainlink CRE SDK and transforms off-chain intelligence into deterministic, cross-chain on-chain enforcement.

This module:

* Fetches external price and reserve data
* Performs consensus validation
* Computes systemic risk
* Evaluates escalation policies
* Routes cross-chain enforcement actions
* Reports Proof-of-Reserve metrics on-chain
* Prevents replay using nonce validation

This is not a simple oracle workflow.
It is a full cross-chain autonomous risk engine.

---

## 🔎 Full System Context

This directory documents the internal CRE engine only.

For complete architecture diagrams, smart contract details, dashboard screenshots, and Scene 1–4 crash walkthrough logs, see the root project README:

➡ **[View Main SentinelX README](https://github.com/Siddharthjagtap346/SentinelX-Hackathon/blob/main/README.md#-scene-1--normal-market-conditions-stable-system)**

---


# Architecture Overview

```
External Data → Consensus → Intelligence → Policy → Router → On-Chain Execution
```

The workflow runs on a cron schedule and executes the full pipeline every cycle.

---

# Folder Structure

```
sentinelx-cre/
│
├── workflow.ts              # Core orchestration logic
├── main.ts                  # CRE entry point & cron trigger
│
├── intelligence/            # System-wide risk modeling
├── consensus/               # Deviation & price validation
├── policies/                # Escalation state machine
├── triggers/                # External data ingestion
├── router/                  # Cross-chain execution & PoR reporting
├── nonce/                   # Replay protection logic
├── config/                  # Risk + escalation configuration
│
├── workflow.yaml            # CRE workflow definition
├── project.yaml             # CRE CLI environment config
├── config.staging.json      # Runtime configuration
```

---

# Execution Flow

## 1️⃣ Cron Trigger

Defined in `main.ts`

The workflow runs on:

```
"schedule": "*/1 * * * * *"
```

This ensures near real-time monitoring.

---

## 2️⃣ Price Fetch + Consensus

Sources:

* CoinGecko real price
* Controlled mock price

Median aggregation is performed using CRE consensus.

Deviation tolerance is enforced via:

```
RiskConfig.deviationTolerancePercent
```

If deviation exceeds tolerance:

* Consensus is rejected
* Fallback logic applies (test mode support)

---

## 3️⃣ Reserve Health Verification

Source: Custodian HTTP endpoint

Security features:

* Timestamp freshness validation (30s window)
* ECDSA signature verification
* Public key validation
* Replay protection (monotonic timestamp)

This prevents:

* Fake reserve injection
* Stale attestations
* Replay attacks

---

## 4️⃣ Vault State Collection (Cross-Chain)

Using CRE EVMClient:

Chain A:

* getHealthRatio(price)
* lastEscalation()
* debt()

Chain B:

* vaultNonce()

All calls executed in parallel.

---

## 5️⃣ Systemic Risk Engine

Located in:

```
intelligence/systemicRiskEngine.ts
```

Risk score combines:

* Unhealthy vault ratio
* Weighted debt exposure
* Volatility standard deviation
* Reserve stress factor

Weighted model:

```
Unhealthy Ratio: 40%
Volatility:      25%
Reserve Stress:  15%
Debt Stress:     20%
```

Final output:

```
score: 0 → 1
systemicFreeze: boolean
systemicRestrict: boolean
```

This allows system-wide enforcement beyond single-vault logic.

---

## 6️⃣ Risk Policy Escalation Engine

Located in:

```
policies/riskPolicyEngine.ts
```

Escalation progression:

```
NONE → WARNING → RESTRICT → PARTIAL → FULL
```

Threshold-based health triggers.

PARTIAL action automatically computes:

```
10% debt reduction
```

State-aware escalation prevents repeated actions.

---

## 7️⃣ Cross-Chain Execution Router

Located in:

```
router/executionRouter.ts
```

Uses:

* CRE prepareReportRequest()
* runtime.report()
* Chain Selector targeting
* Nonce increment via nonceManager

Security Layer:

* Reads current executor nonce
* Computes next nonce
* Logs nonce verification
* Prevents replay

Supported actions:

* executeRestrict()
* executePartial()
* executeFull()
* freezeSystem()

WARNING is logged only (no execution).

---
## 8️⃣ Automated Proof-of-Reserve (PoR) Reporting

SentinelX does not only enforce vault-level risk actions.

It also performs **automated Proof-of-Reserve reporting** on-chain during every workflow cycle.

This is implemented in:

```bash
router/porReporter.ts
```

### 🎯 Purpose

To report real-time system backing metrics to the `ReserveAuthority` contract on Chain A.

This ensures:

* Stablecoin supply transparency
* Reserve health visibility
* On-chain risk scoring
* Autonomous PoR updates without manual intervention

---

### 🔄 Reporting Flow

During every workflow cycle:

1. Fetch stable token total supply (Chain A)
2. Compute reserve backing ratio
3. Compute systemic risk score
4. Encode `(reserves, supply, riskScore)`
5. Submit CRE-native report to ReserveAuthority

---

### 🧠 Encoded Payload

The report is ABI-encoded exactly as expected by Solidity:

```solidity
abi.encode(uint256 reserves, uint256 supply, uint256 riskScore)
```

This guarantees deterministic contract compatibility.

---

### ⚙️ CRE Native Write

PoR uses:

* `prepareReportRequest()`
* `runtime.report()`
* Chain selector targeting
* Direct contract delivery (no external relayer)

This is a CRE-native on-chain write.

---

### 🔐 Security Properties

✔ Deterministic encoding
✔ Cross-chain selector enforcement
✔ DON-backed report submission
✔ Executed inside same risk evaluation cycle

---

# Configuration System

## config.staging.json

Defines:

* Chain A selector
* Chain B selector
* Vault addresses
* Guardian contract
* Stable token address
* Executor contract
* ReserveAuthority contract
* Custodian public keys
* Quorum requirement

This enables:

* Multi-chain deployment
* Environment separation
* Hackathon testnet simulation
* Production-ready migration

---

# Security Mechanisms

✔ Consensus deviation checks
✔ Multi-node median aggregation
✔ Signed reserve attestations
✔ Replay protection (timestamp monotonicity)
✔ Executor nonce validation
✔ Cross-chain selector enforcement
✔ Deterministic escalation transitions

This is production-grade architecture.

---

# Why This Is Advanced

Unlike basic oracle workflows, this engine:

* Combines price + reserve + volatility
* Computes systemic risk scoring
* Executes cross-chain enforcement
* Reports PoR automatically
* Uses CRE-native write capabilities
* Implements replay-safe cross-chain execution

This transforms reserve monitoring into automated enforcement.

---

# Logs & Scenario Demonstrations

Full execution logs and Scene 1–4 crash simulations are documented in the root project README.
➡ **[View Main SentinelX README](https://github.com/Siddharthjagtap346/SentinelX-Hackathon/blob/main/README.md#-scene-1--normal-market-conditions-stable-system)**

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

# Conclusion

`sentinelx-cre` is the autonomous risk brain of SentinelX.

It bridges:

Off-chain intelligence → CRE consensus → Cross-chain enforcement → On-chain Proof-of-Reserve reporting

This module demonstrates how Chainlink CRE can power deterministic, secure, cross-chain financial infrastructure.

---

