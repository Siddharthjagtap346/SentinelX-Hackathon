import {
  CronCapability,
  handler,
  Runner,
  type Runtime,
  type CronPayload,
  type SecretsProvider,
  type Workflow,
} from "@chainlink/cre-sdk";
import { runWorkflow } from "./workflow";
import { z } from "zod";

const configSchema = z.object({
  schedule: z.string(),

  chainA: z.object({
    selector: z.number(),
    vaults: z.array(z.string()),
    guardian: z.string(),
    stable: z.string(),
    authority: z.string(),
  }),

  chainB: z.object({
    selector: z.number(),
    executor: z.string(),
  }),

  custodians: z.array(
    z.object({
      name: z.string(),
      endpoint: z.string(),
      publicKey: z.string(),
    })
  ),

  quorum: z.number(),
});

type Config = z.infer<typeof configSchema>;
const cron = new CronCapability();

const onCronTrigger = async (
  runtime: Runtime<Config>,
  _payload: CronPayload
) => {
  runtime.log("SentinelX cycle starting...");
  await runWorkflow(runtime);
  runtime.log("SentinelX cycle completed.");
  return { status: "completed" };
};

function initWorkflow(
  config: Config,
  _secrets: SecretsProvider
): Workflow<Config> {
  return [
    handler(
      cron.trigger({
        schedule: config.schedule,
      }),
      onCronTrigger
    ),
  ];
}

export async function main() {
  const runner = await Runner.newRunner<Config>({
    configSchema,
  });
  await runner.run(initWorkflow);
}