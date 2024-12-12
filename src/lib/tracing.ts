import { ENTRYPOINT_ADDRESS_V06, ZERO_ADDRESS } from "./constants";
import { toHandleOp, toSimulateHandleOp } from "./entrypoint";
import { UserOperation } from "./userop";
import {
  PublicClient
} from "viem";

export interface CallTraceData {
  to: string;
  from: string;
  gas?: string;
  gasUsed?: string;
  input?: string;
  output?: string;
  error?: string;
  data?: string;
  value?: string;
  type?: string;
  revertReason?: string;
  calls?: CallTraceData[];
}

export async function traceUserOpViaSimulateHandleOp({
  userOp,
  provider,
}: {
  userOp: UserOperation;
  provider: PublicClient;
}) {
  // Convert the userOp to the format expected by simulateHandleOp
  const simulateHandleOpCallData = toSimulateHandleOp(userOp);

  const params = {
    from: ZERO_ADDRESS,
    to: ENTRYPOINT_ADDRESS_V06,
    data: simulateHandleOpCallData,
  };

  const settings = {
    tracer: "callTracer",
    // stateOverrides: {
    //   [userOp.sender]: { balance: "0xffffffffffffffffffffffff" },
    //   [ZERO_ADDRESS]: { balance: "0xffffffffffffffffffffffff" },
    // },
  };

  const result = await provider.request({
    method: "debug_traceCall" as any,
    params: [params, "latest", settings],
  });

  console.log("Trace result:", JSON.stringify(result, null, 2));

  return result as CallTraceData;
}

export async function traceUserOpViaHandleOp({
    userOp,
    provider,
  }: {
    userOp: UserOperation;
    provider: PublicClient;
  }) {
    // Convert the userOp to the format expected by simulateHandleOp
    const handleOpCallData = toHandleOp(userOp);
  
    const params = {
      from: ZERO_ADDRESS,
      to: ENTRYPOINT_ADDRESS_V06,
      data: handleOpCallData,
    };
  
    const settings = {
      tracer: "callTracer",
    //   stateOverrides: {
    //     [userOp.sender]: { balance: "0xffffffffffffffffffffffff" },
    //     [ZERO_ADDRESS]: { balance: "0xffffffffffffffffffffffff" },
    //   },
    };
  
    const result = await provider.request({
      method: "debug_traceCall" as any,
      params: [params, "latest", settings],
    });
  
    // console.log("Trace result:", JSON.stringify(result, null, 2));
    
    return result as CallTraceData;
  }
