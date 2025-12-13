import { ColumnType } from "@/types/domain/columnType";
import type { Column } from "@/types/domain/table";
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

it("formats only length when decimal is not provided", () => {
  const column = createColumn({ columnType: ColumnType.VarCharN, length: 255 });

  expect(formatColumnType(column)).toBe("varchar(255)");
});

it("formats only decimal when length is not provided", () => {
  const column = createColumn({ columnType: ColumnType.Decimal, decimal: 5 });

  expect(formatColumnType(column)).toBe("decimal(5)");
});

it("falls back to the default label when no length or decimal exists", () => {
  const column = createColumn({ columnType: ColumnType.CharN });

  expect(formatColumnType(column)).toBe("char(n)");
});
