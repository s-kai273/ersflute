import type { ColumnGroupResponse } from "@/types/api/columnGroups";
import type { Column } from "@/types/domain/column";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import { parseColumnType } from "@/types/domain/columnType";

export function mapColumnGroupsFromApi(
  columnGroupResponses: ColumnGroupResponse[],
): ColumnGroup[] {
  return columnGroupResponses.map((columnGroup) => {
    const normalColumns = columnGroup.columns.normalColumns ?? [];
    return {
      columnGroupName: columnGroup.columnGroupName,
      columns: normalColumns.map((column) => {
        return {
          physicalName: column.physicalName,
          logicalName: column.logicalName,
          description: column.description,
          columnType: parseColumnType(column.columnType),
          length: column.length,
          decimal: column.decimal,
          enumArgs: column.args,
          notNull: column.notNull,
          unique: column.uniqueKey,
          unsigned: column.unsigned,
          defaultValue: column.defaultValue,
        } satisfies Column;
      }),
    } satisfies ColumnGroup;
  });
}

function mapColumnGroupColumnToApi(column: Column) {
  return {
    physicalName: column.physicalName,
    logicalName: column.logicalName,
    description: column.description,
    columnType: column.columnType ?? "",
    length: column.length,
    decimal: column.decimal,
    args: column.enumArgs,
    notNull: column.notNull,
    uniqueKey: column.unique,
    unsigned: column.unsigned,
    defaultValue: column.defaultValue,
  };
}

export function mapColumnGroupsToApi(
  columnGroups: ColumnGroup[],
): ColumnGroupResponse[] {
  return columnGroups.map((columnGroup) => ({
    columnGroupName: columnGroup.columnGroupName,
    columns: {
      normalColumns: columnGroup.columns.map(mapColumnGroupColumnToApi),
    },
  }));
}
