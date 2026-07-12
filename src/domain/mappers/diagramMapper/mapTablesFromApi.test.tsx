import type { TableResponse } from "@/types/api/diagramWalkers";
import type { Column } from "@/types/domain/column";
import { ColumnType } from "@/types/domain/columnType";
import { mapDiagramFromApi } from ".";

function createTableResponse(
  overrides?: Partial<TableResponse>,
): TableResponse {
  return {
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
    columns: { items: [] },
    indexes: [],
    compoundUniqueKeyList: {},
    ...overrides,
  };
}

it("maps table properties and column attributes from API values", () => {
  const result = mapDiagramFromApi({
    diagramWalkers: {
      tables: [
        createTableResponse({
          identityKey: "table-users",
          width: 140,
          height: 90,
          indexes: [
            {
              identityKey: "index-users-name",
              name: "users_name",
              indexType: "BTREE",
              columns: [{ columnId: "table.users.name" }],
            },
          ],
          compoundUniqueKeyList: {
            compoundUniqueKeys: [
              {
                identityKey: "unique-users",
                name: "users_unique",
                columns: [
                  { columnId: "table.users.id" },
                  { columnId: "table.users.email" },
                ],
              },
            ],
          },
          columns: {
            items: [
              {
                identityKey: "column-id",
                physicalName: "id",
                logicalName: "ID",
                description: "Identifier",
                columnType: ColumnType.Int,
                length: 11,
                decimal: 2,
                unsigned: true,
                notNull: true,
                uniqueKey: true,
                defaultValue: "0",
                primaryKey: true,
                autoIncrement: true,
                referredColumn: "users.id",
              },
              "COMMON",
            ],
          },
        }),
      ],
    },
  });

  expect(result.tables).toEqual([
    {
      color: { r: 10, g: 20, b: 30 },
      identityKey: "table-users",
      x: 10,
      y: 20,
      width: 140,
      height: 90,
      fontName: "Arial",
      fontSize: 12,
      physicalName: "users",
      logicalName: "Users",
      description: "User table",
      tableConstraint: undefined,
      primaryKeyName: undefined,
      option: undefined,
      compoundUniqueKeys: [
        {
          identityKey: "unique-users",
          columns: ["table.users.id", "table.users.email"],
          name: "users_unique",
        },
      ],
      indexes: [
        {
          identityKey: "index-users-name",
          name: "users_name",
          indexType: "BTREE",
          description: undefined,
          fullText: undefined,
          nonUnique: undefined,
          columns: [
            {
              columnId: "table.users.name",
              desc: undefined,
            },
          ],
        },
      ],
      columns: [
        {
          identityKey: "column-id",
          physicalName: "id",
          logicalName: "ID",
          description: "Identifier",
          columnType: ColumnType.Int,
          length: 11,
          decimal: 2,
          enumArgs: undefined,
          unsigned: true,
          notNull: true,
          unique: true,
          defaultValue: "0",
          primaryKey: true,
          autoIncrement: true,
          referredColumn: "users.id",
        },
        "COMMON",
      ],
    },
  ]);
});

it("uses referred column attributes when API column details are omitted", () => {
  const result = mapDiagramFromApi({
    diagramWalkers: {
      tables: [
        createTableResponse({
          physicalName: "users",
          columns: {
            items: [
              {
                physicalName: "account_code",
                columnType: "varchar(n)",
                length: 32,
                unsigned: true,
                args: "A,B,C",
              },
            ],
          },
        }),
        createTableResponse({
          physicalName: "orders",
          columns: {
            items: [
              {
                physicalName: "account_code",
                referredColumn: "table.users.account_code",
              },
            ],
          },
        }),
      ],
    },
  });

  const column = result.tables[1].columns?.[0] as Column;
  expect(column.columnType).toBe(ColumnType.VarCharN);
  expect(column.length).toBe(32);
  expect(column.unsigned).toBe(true);
  expect(column.enumArgs).toBe("A,B,C");
});

it("omits table columns when API columns are missing", () => {
  const result = mapDiagramFromApi({
    diagramWalkers: {
      tables: [
        createTableResponse({
          columns: {},
        }),
      ],
    },
  });

  expect(result.tables[0].columns).toBeUndefined();
});

it("sets unknown API column types to undefined", () => {
  const result = mapDiagramFromApi({
    diagramWalkers: {
      tables: [
        createTableResponse({
          columns: {
            items: [
              {
                physicalName: "mystery",
                columnType: "unknown",
                notNull: false,
              },
            ],
          },
        }),
      ],
    },
  });

  expect((result.tables[0].columns?.[0] as Column).columnType).toBeUndefined();
});
