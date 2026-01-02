import type { TableResponse } from "@/types/api/diagramWalkers";
import type { Column } from "@/types/domain/column";
import { parseColumnType } from "@/types/domain/columnType";
import type { Relationship } from "@/types/domain/relationship";
import { type Table } from "@/types/domain/table";

export function mapTablesFrom(tableResponses: TableResponse[]): Table[] {
  return tableResponses.map((table) => {
    return {
      color: {
        r: table.color.r,
        g: table.color.g,
        b: table.color.b,
      },
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      physicalName: table.physicalName,
      logicalName: table.logicalName,
      description: table.description,
      columns: table.columns.items?.map((item) => {
        if (typeof item === "string") {
          return item;
        }
        return {
          physicalName: item.physicalName,
          logicalName: item.logicalName,
          description: item.description,
          columnType: item.columnType
            ? parseColumnType(item.columnType)
            : undefined,
          length: item.length,
          decimal: item.decimal,
          unsigned: item.unsigned,
          notNull: item.notNull,
          unique: item.uniqueKey,
          defaultValue: item.defaultValue,
          primaryKey: item.primaryKey,
          autoIncrement: item.autoIncrement,
          referredColumn: item.referredColumn,
        } satisfies Column;
      }),
    } satisfies Table;
  });
}

export function mapRelationshipsFrom(
  tableResponses: TableResponse[],
): Relationship[] {
  return tableResponses
    .filter((table) => !!table.connections.relationships)
    .flatMap((table) => table.connections.relationships)
    .map((relationship) => {
      return {
        name: relationship.name,
        source: relationship.source,
        target: relationship.target,
        parentCardinality: relationship.parentCardinality,
        childCardinality: relationship.childCardinality,
      } satisfies Relationship;
    });
}
