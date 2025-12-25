import type { Column } from "@/types/domain/column";
import type { ColumnGroup } from "@/types/domain/columnGroup";

export function getColumnsFromGroupName(
  groupName: string,
  columnGroups: ColumnGroup[],
): Column[] {
  const group = columnGroups.find(
    (group) => group.columnGroupName === groupName,
  );
  if (!group) {
    throw new Error(`Column group name is not found: ${groupName}`);
  }
  return group.columns;
}
