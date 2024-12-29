import { CallTraceData } from "src/lib/tracing";
import { useState } from "react";
import { Interface } from "ethers";
import EntryPointABI from "../lib/abi/entrypoint06.json";

const KNOWN_CONTRACTS: Record<string, { name: string; iface: Interface }> = {
  "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789": {
    name: "EntryPoint",
    iface: new Interface(EntryPointABI)
  }
};

export default function CallTraceView({ call, depth = 0 }: { call: CallTraceData, depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubcalls = call.calls && call.calls.length > 0;

  const tryDecodeCalldata = (to: string, input: string) => {
    const normalizedTo = to.toLowerCase();
    console.log('Trying to decode:', { 
      to, 
      normalizedTo, 
      input, 
      knownAddresses: Object.keys(KNOWN_CONTRACTS),
      foundContract: !!KNOWN_CONTRACTS[normalizedTo]
    });
    
    const contract = KNOWN_CONTRACTS[normalizedTo];
    if (!contract || !input || input === '0x') return input;
    
    try {
      const decoded = contract.iface.parseTransaction({ data: input });
      console.log('Decoded result:', decoded);
      if (!decoded) return input;
      return `${decoded.name}(${decoded.args.map(arg => arg.toString()).join(', ')})`;
    } catch (e) {
      console.error('Decoding error:', e);
      return input;
    }
  };

  const tryDecodeOutput = (to: string, output: string) => {
    const contract = KNOWN_CONTRACTS[to.toLowerCase()];
    if (!contract || !output || output === '0x') return output;
    
    try {
      // First 10 characters (including 0x) are the function selector
      const selector = output.slice(0, 10);
      console.log('Trying to decode output:', { to, output, selector });
      
      // Try to decode the function first
      const functionFragment = contract.iface.getFunction(selector);
      if (!functionFragment) return output;
      
      const decoded = contract.iface.decodeFunctionResult(functionFragment, output);
      console.log('Decoded output:', decoded);
      if (!decoded) return output;
      return decoded.map(arg => arg.toString()).join(', ');
    } catch (e) {
      console.error('Output decoding error:', e);
      return output;
    }
  };

  const decodedInput = tryDecodeCalldata(call.to, call.input ?? '0x');
  const decodedOutput = tryDecodeOutput(call.to, call.output ?? '0x');

  return (
    <div className="flex flex-col" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="flex flex-col gap-1 rounded border border-gray-200 bg-gray-50 p-2">
        <div>
          <span className="font-semibold text-gray-700">From:</span> {call.from}
        </div>
        <div>
          <span className="font-semibold text-gray-700">To:</span> {call.to}
          {KNOWN_CONTRACTS[call.to.toLowerCase()] && 
            <span className="ml-2 text-sm text-blue-600">
              ({KNOWN_CONTRACTS[call.to.toLowerCase()].name})
            </span>
          }
        </div>
        <div>
          <span className="font-semibold text-gray-700">Input:</span> {decodedInput}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Output:</span> {decodedOutput}
        </div>
        {call.error && <div><span className="font-semibold text-red-700">Error:</span> {call.error}</div>}
        {call.revertReason && <div><span className="font-semibold text-red-700">Revert Reason:</span> {call.revertReason}</div>}
        {call.type && <div><span className="font-semibold text-gray-700 text-xs">Type:</span> {call.type}</div>}
        {hasSubcalls && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-gray-600 hover:bg-gray-200 rounded mt-2 text-sm"
          >
            {isExpanded ? '▼ Collapse Subcalls' : '▶ Expand Subcalls'}
          </button>
        )}
      </div>
      
      {isExpanded && call.calls?.map((subcall, index) => (
        <CallTraceView key={index} call={subcall} depth={depth + 1} />
      ))}
    </div>
  );
}
