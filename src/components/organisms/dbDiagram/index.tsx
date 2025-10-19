import { Canvas, EdgeData, NodeData } from "reaflow";
import { TableNode } from "../../atoms/tableNode";
import { Table } from "../../../types/table";
import { GridBackground } from "../../atoms/gridBackground";

function createNodes(tables: Table[]): NodeData<Table>[] {
  return tables.map((table) => {
    return {
      id: table.physicalName,
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      data: table,
    } as NodeData<Table>;
  });
}

function createEdges(tables: Table[]): EdgeData[] {
  return tables
    .filter((table) => !!table.connections)
    .flatMap((table) => table.connections!.relationship)
    .map((relationship) => {
      const from = relationship.source.slice("table.".length);
      const to = relationship.target.slice("table.".length);
      return {
        id: relationship.name,
        from,
        to,
      } as EdgeData;
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

const nodes = createNodes(tables);
const edges = createEdges(tables);

export const DbDiagram = () => {
  return (
    <div className="relative inset-0 w-full h-full">
      <GridBackground className="absolute -z-10 inset-0 w-full h-full" />
      <Canvas
        panType="drag"
        nodes={nodes}
        edges={edges}
        node={(nodeProps) => <TableNode {...nodeProps} />}
        className="relative z-0"
      />
    </div>
  );
};
