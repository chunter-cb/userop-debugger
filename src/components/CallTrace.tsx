import { CallTraceData } from "src/lib/tracing";
import { useState } from "react";

export default function CallTraceView({ call, depth = 0 }: { call: CallTraceData, depth?: number     }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubcalls = call.calls && call.calls.length > 0;

  return (
    <div className="flex flex-col" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="flex flex-col gap-1 rounded border border-gray-200 bg-gray-50 p-2">
        <div><span className="font-semibold text-gray-700">From:</span> {call.from}</div>
        <div><span className="font-semibold text-gray-700">To:</span> {call.to}</div>
        <div><span className="font-semibold text-gray-700">Input:</span> {call.input}</div>
        <div><span className="font-semibold text-gray-700">Output:</span> {call.output}</div>
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
