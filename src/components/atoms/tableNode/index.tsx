import { Handle, NodeProps, Position } from "@xyflow/react";
import { Table } from "../../../types/table";

export function TableNode({ width, height, ...props }: NodeProps) {
  const data = props.data as Table;
  return (
    <div
      className="flex flex-col min-h-0 rounded-sm"
      style={{
        width,
        height,
        background: `rgb(${data.color.r}, ${data.color.g}, ${data.color.b})`,
      }}
    >
      <div className="flex items-center justify-center h-5 pointer-events-none">
        <p className="text-sm">{data.physicalName}</p>
      </div>
      <div className="nodrag flex-1 w-full px-1 pb-1">
        <div className="w-full h-full bg-white"></div>
      </div>
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
    </div>
  );
}
