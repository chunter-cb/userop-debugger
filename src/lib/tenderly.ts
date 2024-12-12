import { UserOperation } from "./userop";
import { toHandleOp, toSimulateHandleOp } from "./entrypoint";
import { ENTRYPOINT_ADDRESS_V06 } from "./constants";

export async function tenderlySimulateHandleOpLink({ chainId, userOp }: {
  chainId: number;
  userOp: UserOperation;
}) {  
  const baseUrl = "https://dashboard.tenderly.co/chunter/alert/simulator/new";
  const params = new URLSearchParams({
    // stateOverrides: "[]",
    rawFunctionInput: toSimulateHandleOp(userOp),
    value: "0",
    contractAddress: ENTRYPOINT_ADDRESS_V06,
    network: chainId.toString(),
  });

  const simulationUrl = `${baseUrl}?${params.toString()}`;
  
  return simulationUrl;
} 