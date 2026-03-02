# 🛡 SentinelX

### Autonomous Cross-Chain Risk & Reserve Enforcement Engine Powered by Chainlink CRE

---

## 🚀 One-Line Description

Autonomous cross-chain risk engine that enforces Proof-of-Reserves and vault liquidations using Chainlink CRE.

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

```
                ┌───────────────────────────┐
                │      External Data        │
                │---------------------------│
                │ CoinGecko (ETH price)     │
                │ Custodian Signed Reserve  │
                │ Controlled Price Feed     │
                └──────────────┬────────────┘
                               │
                        Chainlink CRE
                               │
        ┌──────────────────────┴──────────────────────┐
        │                                             │
   Chain A                                      Chain B
 (Vault Layer)                              (Execution Layer)

  RiskVault.sol                               RiskExecutor.sol
  GlobalGuardian.sol                           Cross-chain logic
  StableCoin (sUSD)                            Replay protection
  ReserveAuthority.sol                         Nonce enforcement
```

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

This project is genuinely strong. Let’s package it properly.
