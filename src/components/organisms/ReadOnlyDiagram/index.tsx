import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  ReactFlow,
  useNodesState,
} from "@xyflow/react";
import { tables } from "@/test/testData";
import { parseColumnType } from "@/types/domain/columnType";
import { Table } from "../../../types/api/table";
import { CardinalityEdge } from "../../molecules/cardinalityEdge";
import { CardinalityEdgeData } from "../../molecules/cardinalityEdge/types";
import { TableNode } from "../../molecules/tableNode";
import { Column, TableNodeData } from "../../molecules/tableNode/types";

function createNodes(tables: Table[]): Node[] {
  return tables.map((table) => {
    return {
      id: `table.${table.physicalName}`,
      type: "table",
      position: {
        x: table.x,
        y: table.y,
      },
      width: table.width,
      height: table.height,
      data: {
        color: {
          r: table.color.r,
          g: table.color.g,
          b: table.color.b,
        },
        physicalName: table.physicalName,
        columns: table.columns?.normalColumn.map((column) => {
          return {
            physicalName: column.physicalName,
            logicalName: column.logicalName,
            columnType: column.columnType
              ? parseColumnType(column.columnType)
              : undefined,
            length: column.length,
            notNull: column.notNull,
            primaryKey: column.primaryKey,
            referredColumn: column.referredColumn,
          } satisfies Column;
        }),
      } satisfies TableNodeData,
    } satisfies Node;
  });
}

function createEdges(tables: Table[]): Edge[] {
  return tables
    .filter((table) => !!table.connections && !!table.connections!.relationship)
    .flatMap((table) => table.connections!.relationship!)
    .map((relationship) => {
      const source = relationship.source;
      const target = relationship.target;
      return {
        id: relationship.name,
        type: "cardinality",
        source,
        target,
        data: {
          parentCardinality: relationship.parentCardinality,
          childCardinality: relationship.childCardinality,
        },
      } as Edge<CardinalityEdgeData>;
    });
}

export const ReadOnlyDiagram = () => {
  const [nodes, _, onNodesChange] = useNodesState(createNodes(tables));
  const initialEdges = createEdges(tables);
  return (
    <div className="relative flex h-full w-full">
      <ReactFlow
        className="flex-1 cursor-default"
        style={{ width: "100%", height: "100%" }}
        nodes={nodes}
        edges={initialEdges}
        nodeTypes={{
          table: TableNode,
        }}
        edgeTypes={{
          cardinality: CardinalityEdge,
        }}
        onNodesChange={onNodesChange}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={false}
        selectionOnDrag={false}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};
