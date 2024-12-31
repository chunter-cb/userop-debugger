import { CallTraceData } from "src/lib/tracing";
import { useState, useEffect } from "react";
import { Interface, AbiCoder } from "ethers";
import EntryPointABI from "../lib/abi/entrypoint06.json";
import CDPPaymasterABI from "../lib/abi/paymaster06.json";
import axios from 'axios';

const KNOWN_CONTRACTS: Record<string, { name: string; iface: Interface }> = {
  "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789": {
    name: "EntryPoint",
    iface: new Interface(EntryPointABI),
  },
  "0x709a4bae3db73a8e717aefca13e88512f738b27f": {
    name: "CDP Paymaster",
    iface: new Interface(CDPPaymasterABI),
  },
  "0x2faeb0760d4230ef2ac21496bb4f0b47d634fd4c": {
    name: "CDP Paymaster",
    iface: new Interface(CDPPaymasterABI),
  },
};

const SOURCIFY_API = 'https://sourcify.dev/server';

async function getSourcifyABI(address: string, chainId: number) {
  try {
    const response = await axios.get(
      `${SOURCIFY_API}/files/any/${chainId}/${address}`
    );
    const metadata = response.data;
    return new Interface(metadata.output.abi);
  } catch (e) {
    console.error('Failed to fetch from Sourcify:', e);
    return null;
  }
}

// Add type for cached ABI
interface CachedABI {
  timestamp: number;
  abi: string;  // Store as string to work with localStorage
}

// Modified to include cache management
const getStoredABI = (address: string): Interface | null => {
  try {
    const cached = localStorage.getItem(`abi_${address.toLowerCase()}`);
    if (cached) {
      const parsedCache: CachedABI = JSON.parse(cached);
      // Cache for 24 hours
      if (Date.now() - parsedCache.timestamp < 24 * 60 * 60 * 1000) {
        return new Interface(parsedCache.abi);
      }
    }
  } catch (e) {
    console.error('Error reading from cache:', e);
  }
  return null;
};

const storeABI = (address: string, iface: Interface) => {
  try {
    const cacheData: CachedABI = {
      timestamp: Date.now(),
      abi: JSON.stringify(iface.format()),
    };
    localStorage.setItem(`abi_${address.toLowerCase()}`, JSON.stringify(cacheData));
  } catch (e) {
    console.error('Error storing to cache:', e);
  }
};

async function getContractABI(address: string, chainId: number = 1): Promise<Interface | null> {
  const normalizedAddress = address.toLowerCase();
  
  // Check known contracts first
  if (KNOWN_CONTRACTS[normalizedAddress]) {
    return KNOWN_CONTRACTS[normalizedAddress].iface;
  }

  // Check localStorage cache
  const cachedABI = getStoredABI(normalizedAddress);
  if (cachedABI) {
    return cachedABI;
  }

  // Try Sourcify
  try {
    const iface = await getSourcifyABI(normalizedAddress, chainId);
    if (iface) {
      storeABI(normalizedAddress, iface);
      return iface;
    }
  } catch (e) {
    console.error('Failed to fetch ABI:', e);
  }
  
  return null;
}

export default function CallTraceView({
  call,
  depth = 0,
  chainId = 1,
}: {
  call: CallTraceData;
  depth?: number;
  chainId?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [decodedInput, setDecodedInput] = useState<string>(call.input ?? "0x");
  const [decodedOutput, setDecodedOutput] = useState<string>(call.output ?? "0x");
  
  useEffect(() => {
    const decodeData = async () => {
      const input = await tryDecodeCalldata(call.to, call.input ?? "0x", chainId);
      const output = await tryDecodeOutput(call.to, call.output ?? "0x", chainId);
      setDecodedInput(input);
      setDecodedOutput(output);
    };
    
    decodeData();
  }, [call.to, call.input, call.output, chainId]);

  const tryDecodeCalldata = async (to: string, input: string, chainId: number) => {
    if (!input || input === "0x") return input;
    
    const iface = await getContractABI(to, chainId);
    if (!iface) return input;

    try {
      const decoded = iface.parseTransaction({ data: input });
      if (!decoded) return input;
      return `${decoded.name}(${decoded.args.map((arg) => arg.toString()).join(", ")})`;
    } catch (e) {
      console.error("Decoding error:", e);
      return input;
    }
  };

  const tryDecodeOutput = async (to: string, output: string, chainId: number) => {
    if (!output || output === "0x") return output;

    const iface = await getContractABI(to, chainId);
    if (!iface) return output;

    try {
      // Check for standard revert error format (0x08c379a0...)
      if (output.startsWith("0x08c379a0")) {
        const abiCoder = new AbiCoder();
        const errorString = abiCoder.decode(
          ["string"],
          "0x" + output.slice(10)
        );
        return `Error: ${errorString}`;
      }

      // Rest of the existing decoding logic...
      const selector = output.slice(0, 10);
      console.log("Trying to decode output:", { to, output, selector });

      try {
        const functionFragment = iface.getFunction(selector);
        if (functionFragment) {
          const decoded = iface.decodeFunctionResult(
            functionFragment,
            output
          );
          return decoded.map((arg) => arg.toString()).join(", ");
        }

        // If function decoding fails, try error decoding
        const errorFragment = iface.getError(selector);
        if (errorFragment) {
          const decoded = iface.decodeErrorResult(
            errorFragment,
            output
          );
          return `${errorFragment.name}(${decoded.map((arg) => arg.toString()).join(", ")})`;
        }
      } catch (e) {
        console.error("Output decoding error:", e);
      }
      return output;
    } catch (e) {
      console.error("Output decoding error:", e);
      return output;
    }
  };

  const hasSubcalls = call.calls && call.calls.length > 0;

  return (
    <div className="flex flex-col" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="flex flex-col gap-1 rounded border border-gray-200 bg-gray-50 p-2">
        <div>
          <span className="font-semibold text-gray-700">From:</span> {call.from}
        </div>
        <div>
          <span className="font-semibold text-gray-700">To:</span> {call.to}
          {KNOWN_CONTRACTS[call.to.toLowerCase()] && (
            <span className="ml-2 text-sm text-blue-600">
              ({KNOWN_CONTRACTS[call.to.toLowerCase()].name})
            </span>
          )}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Input:</span>{" "}
          {decodedInput}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Output:</span>{" "}
          {decodedOutput}
        </div>
        {call.error && (
          <div>
            <span className="font-semibold text-red-700">Error:</span>{" "}
            {call.error}
          </div>
        )}
        {call.revertReason && (
          <div>
            <span className="font-semibold text-red-700">Revert Reason:</span>{" "}
            {call.revertReason}
          </div>
        )}
        {call.type && (
          <div>
            <span className="font-semibold text-gray-700 text-xs">Type:</span>{" "}
            {call.type}
          </div>
        )}
        {hasSubcalls && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-gray-600 hover:bg-gray-200 rounded mt-2 text-sm"
          >
            {isExpanded ? "▼ Collapse Subcalls" : "▶ Expand Subcalls"}
          </button>
        )}
      </div>

      {isExpanded &&
        call.calls?.map((subcall, index) => (
          <CallTraceView key={index} call={subcall} depth={depth + 1} chainId={chainId} />
        ))}
    </div>
  );
}
