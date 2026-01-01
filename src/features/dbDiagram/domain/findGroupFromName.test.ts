import type { Column } from "@/types/domain/column";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import { findGroupFromName } from "./findGroupFromName";

const createColumn = (overrides: Partial<Column> = {}): Column => ({
  physicalName: "COLUMN",
  ...overrides,
});

const createGroup = (
  name: string,
  overrides: Partial<ColumnGroup> = {},
): ColumnGroup => ({
  columnGroupName: name,
  columns: [createColumn()],
  ...overrides,
});

it("returns the matching group when the name exists", () => {
  const target = createGroup("Target Group");
  const groups = [createGroup("Other Group"), target];

  const result = findGroupFromName("Target Group", groups);

  expect(result).toBe(target);
});

it("returns null when the name does not exist", () => {
  const groups = [createGroup("Alpha"), createGroup("Beta")];

  const result = findGroupFromName("Gamma", groups);

  expect(result).toBeNull();
});

it("returns null when there are no groups", () => {
  const result = findGroupFromName("Any", []);

  expect(result).toBeNull();
});
