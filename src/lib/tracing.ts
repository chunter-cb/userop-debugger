import { ENTRYPOINT_ADDRESS_V06, ZERO_ADDRESS } from "./constants";
import { toSimulateHandleOp } from "./entrypoint";
import { UserOperation } from "./userop";
import {
  createPublicClient,
  http,
} from "viem";

export async function traceUserOp({
  chain,
  userOp,
  rpcUrl,
}: {
  chain: string;
  userOp: UserOperation;
  rpcUrl: string;
}) {
  const provider = createPublicClient({
    transport: http(rpcUrl),
  })

  // Convert the userOp to the format expected by simulateHandleOp
  const simulateHandleOpCallData = toSimulateHandleOp(userOp);

  console.log("simulateHandleOpCallData", simulateHandleOpCallData);

  const params = {
    from: ZERO_ADDRESS,
    to: ENTRYPOINT_ADDRESS_V06,
    data: simulateHandleOpCallData,
  };

  const settings = {
    tracer: "callTracer",
    stateOverrides: {
      [userOp.sender]: { balance: "0xffffffffffffffffffffffff" },
      [ZERO_ADDRESS]: { balance: "0xffffffffffffffffffffffff" },
    },
  };

  const result = await provider.request({
    method: "debug_traceCall" as any,
    params: [params, "latest", settings],
  });

  console.log("Trace result:", JSON.stringify(result, null, 2));

  return { status: "traced", chain, rpcUrl, userOp, result };
}
