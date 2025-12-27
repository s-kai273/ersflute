import type { ColumnGroup } from "@/types/domain/columnGroup";

export function getColumnGroupFromName(
  groupName: string,
  columnGroups: ColumnGroup[],
): ColumnGroup {
  const group = columnGroups.find(
    (group) => group.columnGroupName === groupName,
  );
  if (!group) {
    throw new Error(`Column group name is not found: ${groupName}`);
  }
  return group;
}
