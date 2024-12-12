import { UserOperation } from "./userop";
import { getChainId } from "./constants";
import { toSimulateHandleOp } from "./entrypoint";
export async function tenderlySimulateHandleOpLink({ chain, userOp }: {
  chain: string;
  userOp: UserOperation;
}) {
  const chainId = getChainId(chain);
  const ENTRYPOINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  
  const baseUrl = "https://dashboard.tenderly.co/chunter/alert/simulator/new";
  const params = new URLSearchParams({
    // stateOverrides: "[]",
    rawFunctionInput: toSimulateHandleOp(userOp), // Assuming this is the correct field from UserOperation
    value: "0",
    contractAddress: ENTRYPOINT,
    network: chainId.toString(),
  });

  const simulationUrl = `${baseUrl}?${params.toString()}`;
  
  return { status: 'simulated', chain, userOp, simulationUrl };
} 