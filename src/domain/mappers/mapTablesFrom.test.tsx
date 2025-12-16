import type { TableResponse } from "@/types/api/diagramWalkers";
import { ColumnType } from "@/types/domain/columnType";
import { mapTablesFrom } from "./tableMapper";

const createTableResponse = (
  overrides?: Partial<TableResponse>,
): TableResponse => ({
  physicalName: "users",
  logicalName: "Users",
  description: "User table",
  height: 80,
  width: 120,
  fontName: "Arial",
  fontSize: 12,
  x: 10,
  y: 20,
  color: { r: 10, g: 20, b: 30 },
  connections: { relationships: [] },
  columns: { normalColumns: [] },
  ...overrides,
});

describe("with populated columns", () => {
  it("maps table properties and preserves column attributes", () => {
    const result = mapTablesFrom([
      createTableResponse({
        width: 140,
        height: 90,
        columns: {
          normalColumns: [
            {
              physicalName: "id",
              logicalName: "ID",
              columnType: ColumnType.Int,
              length: 11,
              notNull: true,
              primaryKey: true,
              referredColumn: "users.id",
            },
          ],
        },
      }),
    ]);

    expect(result).toEqual([
      {
        color: { r: 10, g: 20, b: 30 },
        x: 10,
        y: 20,
        width: 140,
        height: 90,
        physicalName: "users",
        columns: [
          {
            physicalName: "id",
            logicalName: "ID",
            columnType: ColumnType.Int,
            length: 11,
            notNull: true,
            primaryKey: true,
            referredColumn: "users.id",
          },
        ],
      },
    ]);
  });

  it("parses labels into column types when mapping", () => {
    const [table] = mapTablesFrom([
      createTableResponse({
        columns: {
          normalColumns: [
            {
              physicalName: "email",
              columnType: "varchar(n)",
              length: 255,
              notNull: true,
            },
          ],
        },
      }),
    ]);

    expect(table.columns?.[0]?.columnType).toBe(ColumnType.VarCharN);
  });
});

describe("without normal columns", () => {
  it("omits columns when none are provided", () => {
    const [table] = mapTablesFrom([
      createTableResponse({
        columns: {},
      }),
    ]);

    expect(table.columns).toBeUndefined();
  });

  it("sets column type to undefined when the value is unknown", () => {
    const [table] = mapTablesFrom([
      createTableResponse({
        columns: {
          normalColumns: [
            {
              physicalName: "mystery",
              columnType: "unknown",
              notNull: false,
            },
          ],
        },
      }),
    ]);

    expect(table.columns?.[0]?.columnType).toBeUndefined();
  });
});
