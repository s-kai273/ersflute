import { type Edge, type Node } from "@xyflow/react";
import { type Table } from "@/types/api/diagramWalkers";
import { parseColumnType } from "@/types/domain/columnType";
import { type Column, type TableNodeData } from "@/types/domain/tableNodeData";
import { type CardinalityEdgeData } from "./components/cardinalityEdge/types";

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
      data: {
        color: {
          r: table.color.r,
          g: table.color.g,
          b: table.color.b,
        },
        physicalName: table.physicalName,
        columns: table.columns?.normalColumns.map((column) => {
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

export function createEdges(tables: Table[]): Edge[] {
  return tables
    .filter((table) => !!table.connections && !!table.connections.relationships)
    .flatMap((table) => table.connections!.relationships!)
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
