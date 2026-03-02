export type WorkflowConfig = {
  schedule: string;
  privateKey: string;
  chainA: { rpc: string; vault: string };
  chainB: { rpc: string; executor: string };
};
