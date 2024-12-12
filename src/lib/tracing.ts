import { UserOperation } from "./userop";

export async function traceUserOp({ chain, userOp, rpcUrl }: {
  chain: string;
  userOp: UserOperation;
  rpcUrl: string;
}) {
  // TODO: Implement tracing logic
  return { status: 'traced', chain, rpcUrl, userOp };
} 