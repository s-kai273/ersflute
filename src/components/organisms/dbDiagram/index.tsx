import "@xyflow/react/dist/style.css";
import { Table } from "../../../types/table";
import {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  ReactFlow,
  useNodesState,
} from "@xyflow/react";
import { TableNode } from "../../molecules/tableNode";
import { CardinalityEdge } from "../../molecules/cardinalityEdge";
import { CardinalityEdgeData } from "../../molecules/cardinalityEdge/types";
import { tables } from "./testData";
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
            columnType: column.columnType,
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

const initialNodes = createNodes(tables);
const initialEdges = createEdges(tables);

export const DbDiagram = () => {
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={initialEdges}
        nodeTypes={{
          table: TableNode,
        }}
        edgeTypes={{
          cardinality: CardinalityEdge,
        }}
        onNodesChange={onNodesChange}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};
