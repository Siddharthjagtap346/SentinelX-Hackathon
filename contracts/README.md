# 🏛️ SentinelX – Smart Contracts

This folder contains all **Ethereum/Hardhat smart contracts** powering the **SentinelX** Proof-of-Reserve (PoR) & cross-chain risk engine. These contracts form the backbone of SentinelX, managing vaults, stablecoins, global pause logic, cross-chain execution, and reserve enforcement.

---

## 📂 Folder Structure

```
contracts/
├── artifacts/             # Hardhat-generated compiled artifacts
├── cache/                 # Hardhat cache
├── chainA/                # Chain A – Vault layer contracts
│   ├── GlobalGuardian.sol         # System-wide pause/circuit breaker
│   └── RiskVault.sol              # Vault liquidation & collateral management
├── chainB/                # Chain B – Execution layer contracts
│   └── RiskExecutor.sol            # Cross-chain liquidation executor
├── cre/                  # CRE & interfacing contracts
│   ├── IERC165.sol
│   ├── IReceiver.sol
│   ├── ReceiverTemplate.sol
│   └── CREForwarder.sol
├── MockStableCoin.sol     # sUSD ERC20 mock token
├── SentinelXReserveAuthority.sol # PoR enforcement & risk report validation
├── ignition/              # Hardhat-generated deployment helpers
├── interfaces/            # Contract interfaces
├── node_modules/          # Dependencies
├── scripts/               # Deployment scripts
│   ├── deployExecutor.js
│   ├── deployForwarder.js
│   ├── deployGuardian.js
│   ├── deployReserveAuthority.js
│   ├── deployStable.js
│   └── deployVault.js
└── test/                  # Unit tests
```

---

## ⚙️ Smart Contracts Overview

| Contract                                    | Purpose                               | Key Features                                                                     |
| ------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| **GlobalGuardian.sol**                      | System-wide pause/circuit breaker     | Pause/unpause entire system, owner-only admin                                    |
| **RiskVault.sol**                           | Vault liquidation & health management | Health ratio calculation, tiered escalations, integration with RiskExecutor      |
| **RiskExecutor.sol**                        | Cross-chain execution                 | Nonce tracking, replay protection, multi-vault approvals, freeze logic           |
| **SentinelXReserveAuthority.sol**           | PoR verification                      | Validates DON-signed reports, backing ratio, freshness, triggers freeze/unfreeze |
| **MockStableCoin.sol**                      | ERC20 stablecoin                      | Mintable for testing purposes (sUSD)                                             |
| **CREForwarder.sol / ReceiverTemplate.sol** | CRE cross-chain forwarding            | Receives & routes reports, interfaces with RiskExecutor                          |

---

## 🔗 Chains and Role

* **🟢 Chain A – Vault Layer**

  * `RiskVault` – Vault & collateral management
  * `GlobalGuardian` – Global circuit breaker
  * `MockStableCoin` – sUSD token
  * `SentinelXReserveAuthority` – PoR verification & enforcement

* **🔵 Chain B – Execution Layer**

  * `RiskExecutor` – Cross-chain liquidation executor with replay protection
  * Executes approved actions from Chain A, ensures message integrity

* **CRE Orchestration**

  * Chainlink CRE fetches off-chain price/reserve data
  * Computes risk and systemic scores
  * Sends signed execution instructions cross-chain

---

## 🛠️ Deployment Workflow

> Using Hardhat with network aliases `chainA` and `chainB`

```bash
# Deploy Chain A contracts
npx hardhat run scripts/deployGuardian.js --network chainA
npx hardhat run scripts/deployStable.js --network chainA
npx hardhat run scripts/deployVault.js --network chainA
npx hardhat run scripts/deployReserveAuthority.js --network chainA

# Set up vault relationships
npx hardhat console --network chainA
> const vault = await ethers.getContractAt("RiskVault", "<vault_address>")
> await vault.setGuardian("<guardian_address>")
> await vault.setRiskEngine("<risk_engine_address>")
.exit

# Deploy Chain B executor
npx hardhat run scripts/deployExecutor.js --network chainB
npx hardhat console --network chainB
> const executor = await ethers.getContractAt("RiskExecutor", "<executor_address>")
> await executor.setRiskEngine("<risk_engine_address>")
> await executor.setGuardian("<guardian_address>")
> await executor.addVault("<vault_address>")
.exit
```

> ✅ Deployment logs confirm each contract is deployed and ownership relationships are set.

---

## 🔄 Contract Interaction Flow

1. **Price Consensus**

   * Fetches ETH price from CoinGecko (real)
   * Fetches controlled internal price
   * Runs deviation & advanced consensus check
   * Flags significant deviations

2. **Custodian Reserve Verification**

   * Validates reserve signatures & freshness
   * Aggregates median reserve health %

3. **Vault Health Computation**

   * `Health Ratio = (Collateral × Price × 100) / Debt`
   * Escalation tiers:

     * NONE → WARNING → RESTRICT → PARTIAL LIQUIDATION → FULL LIQUIDATION

4. **Systemic Risk Engine**

   * Computes:

     * Health dispersion
     * Volatility (std deviation)
     * Multi-vault correlation
   * Outputs:

     * Systemic Risk Score (0–1)
     * System Health Index (0–100)

5. **Proof-of-Reserve Enforcement**

   * CRE sends DON-signed report to `SentinelXReserveAuthority`
   * Contract checks:

     * Backing ratio ≥ 100%
     * Risk thresholds
     * Report freshness
   * Violations trigger:

     * `GlobalGuardian.pause()` → system freeze

6. **Cross-Chain Liquidation Execution**

   * CRE triggers `RiskExecutor` on Chain B
   * Enforces:

     * Approved vaults
     * Nonce sequencing
     * Replay protection
     * FreezeReason tracking
   * Executes vault operations on Chain A

---

## 🔐 Security Features

* DON-signed CRE reports
* Signature verification of custodian attestations
* Replay protection (hash + nonce)
* Cross-chain message integrity
* Global circuit breaker (`GlobalGuardian`)
* Escalation state machine enforcement
* Freshness enforcement for reserve data
* Strict owner-only administrative controls

---

## 📝 Notes

* **Simulation-Ready**: All outputs can be tested locally using Hardhat and MockStableCoin.
* **Cross-Chain Ready**: Designed for multiple chain deployment with CRE as orchestrator.
* **Production Deployment**: Replace mock tokens and addresses with live equivalents.
* **Upgrade Strategy**: Contracts are modular; `RiskExecutor` and `RiskVault` can interact with new CRE logic without redeploying `GlobalGuardian`.

---

## 📌 References

* **CRE Engine**: see `sentinelx-cre/`
* **Frontend Dashboard**: see `sentinelx-frontend/`
* **Deployment Scripts**: `scripts/*.js`
* **Interfaces**: `interfaces/*.sol`

---
