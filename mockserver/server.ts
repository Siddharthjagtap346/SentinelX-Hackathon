// mock-server/server.ts
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

// -------------------------
// Signed Reserve Endpoint
// -------------------------
app.get("/reserve", async (req, res) => {
  try {
    const reservePercent = 97.25; // change for testing
    const timestamp = Math.floor(Date.now() / 1000);

    const message = `${reservePercent}:${timestamp}`;
    const signature = await wallet.signMessage(message);

    res.json({
      reservePercent,
      timestamp,
      signature,
    });
  } catch (error) {
    console.error("Reserve signing error:", error);
    res.status(500).json({ error: "Failed to sign reserve data" });
  }
});

// -------------------------
// Controlled price (mock)
// -------------------------
app.get("/price", (req, res) => {
  res.json({ price: 1234.56 });
});

// -------------------------
// Gecko price (real fetch)
// -------------------------
app.get("/gecko-price", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    if (!response.ok) {
      return res.status(500).json({ error: "CoinGecko failed" });
    }

    const data = await response.json();
    res.json({ price: data.ethereum.usd });
  } catch (error) {
    console.error("Gecko fetch error:", error);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
});