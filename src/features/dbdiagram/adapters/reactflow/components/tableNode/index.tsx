import { useState } from "react";
import { CheckCircleIcon, KeyIcon } from "@heroicons/react/16/solid";
import {
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { TableInfoDialog } from "@/features/dbdiagram/components/tableInfoDialog";
import { formatColumnType } from "@/features/dbdiagram/services/formatColumnType";
import { cn } from "@/lib/utils";
import { useViewModeStore } from "@/stores/viewModeStore";
import type { TableNodeData } from "@/types/domain/tableNodeData";

export function TableNode({
  id,
  width,
  height,
  data,
}: NodeProps<Node<TableNodeData>>) {
  const isReadOnly = useViewModeStore((s) => s.isReadOnly);
  const { setNodes } = useReactFlow();
  const [tableInfoDialogOpen, setTableInfoDialogOpen] = useState(false);
  return (
    <div
      className={cn(
        "flex flex-col min-h-0 rounded-sm",
        isReadOnly && "nopan nodrag cursor-default",
      )}
      style={{
        width,
        height,
        background: `rgb(${data.color.r}, ${data.color.g}, ${data.color.b})`,
      }}
    >
      <div
        onDoubleClick={() => {
          setTableInfoDialogOpen(true);
        }}
        className="flex items-center justify-center h-5 cursor-pointer"
      >
        <h1 className="text-sm">{data.physicalName}</h1>
      </div>
      <div className="nodrag flex-1 w-full px-1 pb-1">
        <div className="w-full h-full bg-white">
          {data.columns?.map((column) => (
            <p
              key={column.physicalName}
              className="flex items-center text-[0.625rem] leading-5 whitespace-nowrap"
            >
              <span className="flex items-center justify-center w-4 h-4">
                {column.primaryKey && (
                  <KeyIcon width={10} height={10} className="text-yellow-500" />
                )}
              </span>
              <span className="flex items-center justify-center w-4 h-4">
                {column.notNull && (
                  <CheckCircleIcon
                    width={10}
                    height={10}
                    className="text-green-400"
                  />
                )}
              </span>
              <span>
                {column.physicalName && <span>{column.physicalName}</span>}
                {column.columnType && <span>: {formatColumnType(column)}</span>}
              </span>
            </p>
          ))}
        </div>
      </div>
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Right} />
      <Handle type="target" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <TableInfoDialog
        data={data}
        open={tableInfoDialogOpen}
        onOpenChange={setTableInfoDialogOpen}
        onApply={(data) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id ? { ...node, data: data } : node,
            ),
          );
        }}
      />
    </div>
  );
}
