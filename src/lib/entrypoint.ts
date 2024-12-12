import { UserOperation } from './userop';
import entrypointABI from './abi/entrypoint06.json';
import { encodeFunctionData, Address } from 'viem';
import { ZERO_ADDRESS } from './constants';

/**
 * Converts a UserOperation into the format expected by simulateHandleOp
 * @param userOp UserOperation to convert
 * @param postOpAddress Address for post-operation execution
 * @param postOpData Data for post-operation execution
 * @returns Encoded function data for simulateHandleOp
 */
export function toSimulateHandleOp(
  userOp: UserOperation
): `0x${string}` {
  // Transform UserOperation into tuple format expected by the contract
  const userOpTuple = [
    userOp.sender,
    userOp.nonce,
    userOp.initCode,
    userOp.callData,
    userOp.callGasLimit,
    userOp.verificationGasLimit,
    userOp.preVerificationGas,
    userOp.maxFeePerGas,
    userOp.maxPriorityFeePerGas,
    userOp.paymasterAndData,
    userOp.signature,
  ] as const;

  let postOpAddress: Address;
  let postOpData: `0x${string}`;

  if (userOp.paymasterAndData.length >= 42) {
    // postOpAddress is the first 42 characters (including '0x')
    postOpAddress = userOp.paymasterAndData.slice(0, 42) as Address;
    // postOpData is the rest of paymasterAndData
    postOpData = `0x${userOp.paymasterAndData.slice(42)}` as `0x${string}`;
  } else {
    postOpAddress = ZERO_ADDRESS;
    postOpData = '0x';
  }

  return encodeFunctionData({
    abi: entrypointABI,
    functionName: 'simulateHandleOp',
    args: [userOpTuple, postOpAddress, postOpData]
  });
}

/**
 * Converts a UserOperation into the format expected by handleOp
 * @param userOp UserOperation to convert
 * @returns Encoded function data for handleOp
 */
export function toHandleOp(userOp: UserOperation): `0x${string}` {
  const userOpTuple = [
    userOp.sender,
    userOp.nonce,
    userOp.initCode,
    userOp.callData,
    userOp.callGasLimit,
    userOp.verificationGasLimit,
    userOp.preVerificationGas,
    userOp.maxFeePerGas,
    userOp.maxPriorityFeePerGas,
    userOp.paymasterAndData,
    userOp.signature,
  ] as const;

  return encodeFunctionData({
    abi: entrypointABI,
    functionName: 'handleOps',
    args: [[userOpTuple], ZERO_ADDRESS]
  });
} 