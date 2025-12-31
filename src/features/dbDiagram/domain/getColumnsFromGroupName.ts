import type { ColumnGroup } from "@/types/domain/columnGroup";

export function getColumnGroupFromName(
  groupName: string,
  columnGroups: ColumnGroup[],
): ColumnGroup | null {
  const group = columnGroups.find(
    (group) => group.columnGroupName === groupName,
  );
  if (!group) {
    return null;
  }
  return group;
}
