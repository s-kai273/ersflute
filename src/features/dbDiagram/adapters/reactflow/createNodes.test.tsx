import type { Table } from "@/types/domain/table";
import { createNodes } from "./mappers";

function createTable(overrides?: Partial<Table>): Table {
  return {
    color: { r: 120, g: 140, b: 160 },
    x: 32,
    y: 48,
    width: 240,
    height: 120,
    physicalName: "USERS",
    logicalName: "Users",
    description: "",
    columns: [],
    ...overrides,
  };
}

it("creates a table node with geometry and metadata intact", () => {
  const table = createTable({
    x: 100,
    y: 200,
    width: 320,
    height: 180,
    physicalName: "ORDERS",
  });

  const [node] = createNodes([table]);

  expect(node).toMatchObject({
    id: "table.ORDERS",
    type: "table",
    position: { x: 100, y: 200 },
    width: 320,
    height: 180,
    data: table,
  });
  expect(node.data).toBe(table);
});

it("returns an empty array when no tables are provided", () => {
  expect(createNodes([])).toEqual([]);
});
