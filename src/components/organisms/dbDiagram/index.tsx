import { Canvas, NodeData } from "reaflow";
import { TableNode } from "../../atoms/tableNode";
import { Table } from "../../../types/table";
import { GridBackground } from "../../atoms/gridBackground";

function createNodes(tables: Table[]): NodeData<Table>[] {
  return tables.map((table, index) => {
    return {
      id: index.toString(),
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      data: table,
    } as NodeData<Table>;
  });
}

const tables: Table[] = [
  {
    physical_name: "MEMBERS",
    logical_name: "会員",
    description: "",
    height: 108,
    width: 194,
    font_name: "Ubuntu",
    font_size: 9,
    x: 160,
    y: 106,
    color: {
      r: 128,
      g: 128,
      b: 192,
    },
  },
  {
    physical_name: "MEMBER_PROFILES",
    logical_name: "会員プロフィール",
    description: "",
    height: 89,
    width: 245,
    font_name: "Ubuntu",
    font_size: 9,
    x: 488,
    y: 113,
    color: {
      r: 128,
      g: 128,
      b: 192,
    },
  },
];

const nodes = createNodes(tables);

// const edges = [
//   {
//     id: "1-2",
//     from: "1",
//     to: "2",
//   },
// ];

export const DbDiagram = () => {
  return (
    <div className="relative inset-0 w-full h-full pointer-events-none">
      <GridBackground className="absolute -z-10 inset-0 w-full h-full" />
      <Canvas
        nodes={nodes}
        // edges={edges}
        node={(nodeProps) => <TableNode {...nodeProps} />}
        className="relative z-10"
      />
    </div>
  );
};
