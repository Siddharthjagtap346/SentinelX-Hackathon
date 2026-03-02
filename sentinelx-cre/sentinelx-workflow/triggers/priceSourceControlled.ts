// sentinelx-cre/sentinelx-workflow/triggers/priceSourceControlled.ts
// This file defines a trigger that fetches a price from an external HTTP source and uses CRE's consensus capabilities to aggregate results from multiple nodes.
import { cre, consensusMedianAggregation, ok, json, type Runtime } from "@chainlink/cre-sdk";

export async function fetchControlledPrice(runtime: Runtime<any>) {
  const http = new cre.capabilities.HTTPClient();

  const consensusExecution = await http.sendRequest(
    runtime,
    (sendRequester) => {
      const response = sendRequester
        .sendRequest({
          url: "http://localhost:3001/price",
          method: "GET",
        })
        .result();

      if (!ok(response)) throw new Error("HTTP request failed");

      const data = json(response) as { price: number | string };

      const price = Number(data.price);

      if (!Number.isFinite(price)) {
        throw new Error("Invalid price in HTTP response");
      }

      return price;
    },
    consensusMedianAggregation()
  )();

  const price = Number(consensusExecution.result());

  runtime.log(`[DEBUG] Controlled price consensus result: ${price}`);

  if (!Number.isFinite(price)) {
    throw new Error("Invalid price returned from consensus");
  }

  return price;
}
