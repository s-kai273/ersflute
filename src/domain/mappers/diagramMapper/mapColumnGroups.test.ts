import { defaultSettings } from "@/domain/diagram/defaultSettings";
import { ColumnType } from "@/types/domain/columnType";
import { mapDiagramFromApi, mapDiagramToApi } from ".";

it("maps column groups from API values", () => {
  const result = mapDiagramFromApi({
    columnGroups: [
      {
        columnGroupName: "Audit",
        columns: {
          normalColumns: [
            {
              physicalName: "registered_at",
              logicalName: "Registered at",
              description: "Registration timestamp",
              columnType: "timestamp",
              length: 6,
              decimal: 0,
              args: "a,b",
              notNull: true,
              uniqueKey: false,
              unsigned: false,
              defaultValue: "CURRENT_TIMESTAMP",
            },
          ],
        },
      },
    ],
  });

  expect(result.columnGroups).toEqual([
    {
      columnGroupName: "Audit",
      columns: [
        {
          physicalName: "registered_at",
          logicalName: "Registered at",
          description: "Registration timestamp",
          columnType: ColumnType.Timestamp,
          length: 6,
          decimal: 0,
          enumArgs: "a,b",
          notNull: true,
          unique: false,
          unsigned: false,
          defaultValue: "CURRENT_TIMESTAMP",
        },
      ],
    },
  ]);
});

it("maps column groups to API values", () => {
  const result = mapDiagramToApi({
    settings: defaultSettings,
    tables: [],
    relationships: [],
    columnGroups: [
      {
        columnGroupName: "Audit",
        columns: [
          {
            physicalName: "registered_at",
            logicalName: "Registered at",
            description: "Registration timestamp",
            columnType: ColumnType.Timestamp,
            length: 6,
            decimal: 0,
            enumArgs: "a,b",
            notNull: true,
            unique: false,
            unsigned: false,
            defaultValue: "CURRENT_TIMESTAMP",
          },
        ],
      },
    ],
    vdiagrams: [],
  });

  expect(result.columnGroups).toEqual([
    {
      columnGroupName: "Audit",
      columns: {
        normalColumns: [
          {
            physicalName: "registered_at",
            logicalName: "Registered at",
            description: "Registration timestamp",
            columnType: ColumnType.Timestamp,
            length: 6,
            decimal: 0,
            args: "a,b",
            notNull: true,
            uniqueKey: false,
            unsigned: false,
            defaultValue: "CURRENT_TIMESTAMP",
          },
        ],
      },
    },
  ]);
});
