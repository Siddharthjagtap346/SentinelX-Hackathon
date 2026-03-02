//sentinelx-cre/sentinelx-workflow/triggers/priceSourceReal.ts
import { cre, consensusMedianAggregation, type Runtime, ok, json } from "@chainlink/cre-sdk";

type Config = {};

export const fetchRealPrice = async (runtime: Runtime<Config>) => {
  const http = new cre.capabilities.HTTPClient();

  const consensusExecution = await http.sendRequest(
    runtime,
    (sendRequester) => {
      const response = sendRequester
        .sendRequest({
          url: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
          method: "GET",
        })
        .result();

      if (!ok(response)) throw new Error("HTTP request failed");

      const data = json(response) as { ethereum: { usd: number | string } };

      const price = Number(data.ethereum.usd);

      if (!Number.isFinite(price)) {
        throw new Error("Invalid price in HTTP response");
      }

      return price;
    },
    consensusMedianAggregation()
  )();

  // ✅ Get numeric value properly
  const price = Number(consensusExecution.result());

  runtime.log(`[DEBUG] Real price consensus result: ${price}`);

  if (!Number.isFinite(price)) {
    throw new Error("Invalid price returned from consensus");
  }

  return price;
};
