import type { ColumnGroupResponse } from "@/types/api/columnGroups";
import type { Column } from "@/types/domain/column";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import { parseColumnType } from "@/types/domain/columnType";

export function mapColumnGroupsFrom(
  columnGroupResponses: ColumnGroupResponse[],
): ColumnGroup[] {
  return columnGroupResponses.map((columnGroup) => {
    return {
      columnGroupName: columnGroup.columnGroupName,
      columns: columnGroup.columns.normalColumns.map((column) => {
        return {
          physicalName: column.physicalName,
          logicalName: column.logicalName,
          columnType: parseColumnType(column.columnType),
          notNull: column.notNull,
          unique: column.uniqueKey,
          unsigned: column.unsigned,
        } satisfies Column;
      }),
    } satisfies ColumnGroup;
  });
}
