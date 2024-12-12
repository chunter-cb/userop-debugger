import { CallTraceData } from "src/lib/tracing";

export default function CallTraceView({ call, depth = 0 }: { call: CallTraceData, depth?: number     }) {
  return (
    <div className="flex flex-col" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="flex flex-col gap-1 rounded border border-gray-200 bg-gray-50 p-2">
        <div>From: {call.from}</div>
        <div>To: {call.to}</div>
        <div>Input: {call.input}</div>
        <div>Output: {call.output}</div>
        {call.error && <div className="text-red-500">Error: {call.error}</div>}
        {call.revertReason && <div className="text-red-500">Revert Reason: {call.revertReason}</div>}
        {call.type && <div className="text-grey-500 text-xs">Type: {call.type}</div>}
      </div>
      
      {call.calls?.map((subcall, index) => (
        <CallTraceView key={index} call={subcall} depth={depth + 1} />
      ))}
    </div>
  );
}
