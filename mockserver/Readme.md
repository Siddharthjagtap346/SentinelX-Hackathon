# 🖥️ SentinelX – Mock Server

This folder contains a **mock custodian and price server** for local development and testing of **SentinelX**. It provides signed reserve data, controlled mock prices, and real CoinGecko prices to simulate off-chain data inputs for the CRE engine.

---

## 📂 Folder Structure

```text
mockserver/
├── node_modules/       # Project dependencies
├── package.json        # NPM project metadata
├── package-lock.json   # NPM lock file
├── tsconfig.json       # TypeScript configuration
├── server.ts           # Main Express server
└── types.ts            # Type definitions (if any)
```

---

## ⚙️ Server Overview

The mock server is built using **Express.js** and **TypeScript**. It provides endpoints for:

* **Signed reserve data** (`/reserve`)
* **Controlled internal price** (`/price`)
* **Live Ethereum price via CoinGecko** (`/gecko-price`)

It is designed **only for local development and testing**.

---

### 🔐 Security Notice

* Uses a **mock custodian private key** for signing reserve data.
* **DO NOT use this key on mainnet**.
* All signatures are **for simulation purposes only**.

---

## 📝 server.ts Details

```ts
import express from "express";
import cors from "cors";
import { Wallet } from "ethers";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 🔐 Mock custodian private key (LOCAL DEV ONLY)
const CUSTODIAN_PRIVATE_KEY =
  "0x59c6995e998f97a5a004497e5da5b1b5d9eab5a0b3d6f7a6f5b3b5f3a3d5f7a1";
const wallet = new Wallet(CUSTODIAN_PRIVATE_KEY);

console.log("Mock Custodian Address:", wallet.address);
```

---

### 🔄 API Endpoints

1. **GET `/reserve`** – Signed Reserve Data

Returns custodian-signed reserve percentage and timestamp.

```json
{
  "reservePercent": 85,
  "timestamp": 1672531200,
  "signature": "0x..."
}
```

* `reservePercent`: Current simulated reserve backing (%)
* `timestamp`: UNIX timestamp of the data
* `signature`: Ethers.js signed message for verification

> The CRE engine on Chain A can verify this signature to simulate PoR verification.

---

2. **GET `/price`** – Controlled Internal Price (Mock)

```json
{ "price": 1950 }
```

* Returns a **fixed internal price** (for testing risk engine behavior)
* Adjustable for simulating price deviation

---

3. **GET `/gecko-price`** – Real ETH Price

```json
{ "price": 1948.23 }
```

* Fetches live Ethereum price from CoinGecko
* Handles errors if API fails
* Useful for **consensus comparisons** in CRE logic

---

## 🚀 Running the Server

1. Install dependencies:

```bash
cd mockserver
npm install
```

2. Start the server using TypeScript Node:

```bash
npx ts-node server.ts
```

3. Example output:

```text
Mock Custodian Address: 0x19dA5848Cb4340Ccf04464eFDB24B704D7e5f5a5
Mock server running at http://localhost:3001
```

4. The server is now ready to provide **mock reserve and price data** for your SentinelX simulation.

---

## 🔧 Notes

* Adjust `reservePercent` in `/reserve` endpoint to test **different vault health scenarios**.
* CRE engine and contracts should point to `http://localhost:3001` during local tests.
* Intended for **development & simulation only**. Real deployment must replace with **authenticated custodian** endpoints.

---
