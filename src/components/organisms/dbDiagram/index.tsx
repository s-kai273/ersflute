import "@xyflow/react/dist/style.css";
import { Table } from "../../../types/table";
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Edge,
  Node,
  OnNodesChange,
  ReactFlow,
  useNodesState,
} from "@xyflow/react";
import { TableNode } from "../../atoms/tableNode";

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
      data: table,
      // data: { label: table.logicalName },
    } as Node;
  });
}

function createEdges(tables: Table[]): Edge[] {
  return tables
    .filter((table) => !!table.connections)
    .flatMap((table) => table.connections!.relationship)
    .map((relationship) => {
      const source = relationship.source;
      const target = relationship.target;
      return {
        id: relationship.name,
        source,
        target,
      } as Edge;
    });
}

const tables: Table[] = [
  {
    physicalName: "MEMBERS",
    logicalName: "会員",
    description: "",
    height: 108,
    width: 194,
    fontName: "Ubuntu",
    fontSize: 9,
    x: 160,
    y: 106,
    color: {
      r: 128,
      g: 128,
      b: 192,
    },
  },
  {
    physicalName: "MEMBER_PROFILES",
    logicalName: "会員プロフィール",
    description: "",
    height: 89,
    width: 245,
    fontName: "Ubuntu",
    fontSize: 9,
    x: 488,
    y: 113,
    color: {
      r: 128,
      g: 128,
      b: 192,
    },
    connections: {
      relationship: [
        {
          name: "FK_MEMBER_PROFILES_MEMBERS",
          source: "table.MEMBERS",
          target: "table.MEMBER_PROFILES",
          fkColumns: {
            fkColumn: [
              {
                fkColumnName: "MEMBER_ID",
              },
            ],
          },
          parentCardinality: 1,
          childCardinality: 1,
          referenceForPk: true,
          onDeleteAction: "RESTRICT",
          onUpdateAction: "RESTRICT",
        },
      ],
    },
  },
];

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
        onNodesChange={onNodesChange}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};
