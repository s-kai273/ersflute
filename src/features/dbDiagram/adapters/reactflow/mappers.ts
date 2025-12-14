import { type Edge, type Node } from "@xyflow/react";
import type { Relationship } from "@/types/domain/relationship";
import { type Table } from "@/types/domain/table";

export function createNodes(tables: Table[]): Node[] {
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
    } satisfies Node<Table>;
  });
}

export function createEdges(relationships: Relationship[]): Edge[] {
  return relationships.map((relationship) => {
    return {
      id: relationship.name,
      type: "cardinality",
      source: relationship.source,
      target: relationship.target,
      data: relationship,
    } satisfies Edge<Relationship>;
  });
}
