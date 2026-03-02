// triggers/reserveSource.ts
import {
  cre,
  type Runtime,
  ok,
  json,
  consensusMedianAggregation,
} from "@chainlink/cre-sdk";
import { verifyMessage } from "ethers";

// 🔁 Minimal in-memory replay protection
let lastAcceptedTimestamp = 0;

export async function getReserveHealth(
  runtime: Runtime<any>
): Promise<number> {
  // 🔐 Must match the printed wallet.address from mock server
  const custodians = runtime.config.custodians;

if (!custodians || custodians.length === 0) {
  throw new Error("No custodians configured in runtime.config");
}

const CUSTODIAN_PUBLIC_KEY = custodians[0].publicKey;
  
  const http = new cre.capabilities.HTTPClient();

  const execution = await http.sendRequest(
    runtime,
    (sendRequester: any) => {
      const response = sendRequester
        .sendRequest({
          url: "http://localhost:3001/reserve",
          method: "GET",
        })
        .result();

      if (!ok(response)) throw new Error("Reserve HTTP request failed");

      const data = json(response) as {
        reservePercent: number;
        timestamp: number;
        signature: string;
      };

      const { reservePercent, timestamp, signature } = data;

      // -------------------------
      // 1️⃣ Timestamp freshness check (30 sec window)
      // -------------------------
      const now = Math.floor(Date.now() / 1000);
      if (now - timestamp > 30) {
        throw new Error("Reserve attestation expired");
      }

      // -------------------------
      // 2️⃣ Signature verification
      // -------------------------
      const message = `${reservePercent}:${timestamp}`;
      const recovered = verifyMessage(message, signature);

      if (recovered.toLowerCase() !== CUSTODIAN_PUBLIC_KEY.toLowerCase()) {
        throw new Error("Invalid custodian signature");
      }
// -------------------------
// 3️⃣ Replay protection (monotonic timestamp)
// -------------------------
if (timestamp <= lastAcceptedTimestamp) {
  throw new Error("Replay detected");
}

lastAcceptedTimestamp = timestamp;
      return Number(reservePercent);
    },
    consensusMedianAggregation()
  );

  const value = await execution().result();

  if (!Number.isFinite(value)) {
    throw new Error("Invalid reserve health value");
  }

  return value;
}