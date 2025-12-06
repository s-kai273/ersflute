import { useState } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { TableCard } from "@/features/dbDiagram/components/tableCard";
import { TableInfoDialog } from "@/features/dbDiagram/components/tableInfoDialog";
import type { Table } from "@/types/domain/table";

export function TableNode({ id, width, height, data }: NodeProps<Node<Table>>) {
  const { setNodes } = useReactFlow();
  const [tableInfoDialogOpen, setTableInfoDialogOpen] = useState(false);
  return (
    <>
      <TableCard
        width={width}
        height={height}
        data={data}
        onHeaderDoubleClick={() => setTableInfoDialogOpen(true)}
      />
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
    </>
  );
}
