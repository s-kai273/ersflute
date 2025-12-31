import type { Column } from "@/types/domain/column";
import { ColumnType } from "@/types/domain/columnType";
import { formatColumnType } from "./formatColumnType";

const createColumn = (overrides: Partial<Column> = {}): Column => ({
  physicalName: "COLUMN",
  notNull: true,
  columnType: ColumnType.VarCharN,
  ...overrides,
});

it("returns an empty string when column type is missing", () => {
  const column = createColumn({ columnType: undefined });

  expect(formatColumnType(column)).toBe("");
});

it("formats length and decimal when both are provided", () => {
  const column = createColumn({
    columnType: ColumnType.DecimalPS,
    length: 12,
    decimal: 3,
  });

  expect(formatColumnType(column)).toBe("decimal(12, 3)");
});

it("formats length and decimal when both are supported, but values are not provided", () => {
  const column = createColumn({
    columnType: ColumnType.DecimalPS,
  });

  expect(formatColumnType(column)).toBe("decimal(0, 0)");
});

it("formats decimal when decimal is provided without length", () => {
  const column = createColumn({
    columnType: ColumnType.DecimalPS,
    decimal: 2,
  });

  expect(formatColumnType(column)).toBe("decimal(0, 2)");
});

it("formats only length when decimal is not provided", () => {
  const column = createColumn({
    columnType: ColumnType.DecimalP,
    length: 255,
  });

  expect(formatColumnType(column)).toBe("decimal(255)");
});

it("ignores decimal when the column type does not support it", () => {
  const column = createColumn({
    columnType: ColumnType.DecimalP,
    length: 8,
    decimal: 3,
  });

  expect(formatColumnType(column)).toBe("decimal(8)");
});

it("falls back to the default label when no length or decimal exists", () => {
  const column = createColumn({ columnType: ColumnType.Char });

  expect(formatColumnType(column)).toBe("char");
});

it("adds unsigned when the column type supports it", () => {
  const column = createColumn({
    columnType: ColumnType.Int,
    unsigned: true,
  });

  expect(formatColumnType(column)).toBe("int unsigned");
});
