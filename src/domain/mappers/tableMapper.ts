import type { TableResponse } from "@/types/api/diagramWalkers";
import { parseColumnType } from "@/types/domain/columnType";
import type { Relationship } from "@/types/domain/relationship";
import type { Column, Table } from "@/types/domain/table";

export function mapTablesFrom(tableResponses: TableResponse[]): Table[] {
  return tableResponses.map((table) => {
    const fkColumnNames = table.connections.relationships.flatMap(
      (relationship) =>
        relationship.fkColumns.fkColumn.map((column) => column.fkColumnName),
    );
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
      columns: table.columns.normalColumns?.map((column) => {
        return {
          physicalName: column.physicalName,
          logicalName: column.logicalName,
          columnType: column.columnType
            ? parseColumnType(column.columnType)
            : undefined,
          length: column.length,
          notNull: column.notNull,
          primaryKey: column.primaryKey,
          foreignKey: fkColumnNames.includes(column.physicalName),
          referredColumn: column.referredColumn,
        } satisfies Column;
      }),
    } satisfies Table;
  });
}

export function mapRelationshipsFrom(
  tableResponses: TableResponse[],
): Relationship[] {
  return tableResponses
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
