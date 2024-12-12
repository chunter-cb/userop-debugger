export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export function parseUserOp(jsonStr: string): UserOperation {
  try {
    // Parse JSON string
    var parsed = JSON.parse(jsonStr);

    // Check if the UserOp is nested under request.transaction
    if (parsed?.request?.transaction) {
      parsed = parsed.request.transaction;
    }

    // Extract UserOperation fields, defaulting to empty strings if missing
    const userOp: UserOperation = {
      sender: parsed.sender || '',
      nonce: parsed.nonce || '0x0',
      initCode: parsed.initCode || '0x',
      callData: parsed.callData || '0x',
      callGasLimit: parsed.callGasLimit || '0x0',
      verificationGasLimit: parsed.verificationGasLimit || '0x0',
      preVerificationGas: parsed.preVerificationGas || '0x0',
      maxFeePerGas: parsed.maxFeePerGas || '0x0',
      maxPriorityFeePerGas: parsed.maxPriorityFeePerGas || '0x0',
      paymasterAndData: parsed.paymasterAndData || '0x',
      signature: parsed.signature || '0x'
    };

    // Validate required fields
    if (!userOp.sender || !userOp.sender.startsWith('0x')) {
      throw new Error('Invalid or missing sender address');
    }

    // Ensure all hex fields start with 0x
    Object.entries(userOp).forEach(([key, value]) => {
      if (typeof value === 'string' && !value.startsWith('0x')) {
        userOp[key as keyof UserOperation] = '0x' + value;
      }
    });

    console.log(userOp);

    return userOp;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse UserOperation: ${error.message}`);
    }
    throw new Error('Failed to parse UserOperation');
  }
}

