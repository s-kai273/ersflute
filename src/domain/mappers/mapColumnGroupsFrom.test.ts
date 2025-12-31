import type { ColumnGroupResponse } from "@/types/api/columnGroups";
import { ColumnType } from "@/types/domain/columnType";
import { mapColumnGroupsFrom } from "./columnGroupMapper";

const createColumnGroupResponse = (
  overrides: Partial<ColumnGroupResponse> = {},
): ColumnGroupResponse => ({
  columnGroupName: "Group A",
  columns: {
    normalColumns: [
      {
        physicalName: "COLUMN_A",
        logicalName: "Column A",
        columnType: ColumnType.VarCharN,
        notNull: true,
        uniqueKey: false,
        unsigned: false,
      },
    ],
  },
  ...overrides,
});

it("maps column groups and columns with parsed column types", () => {
  const input = [
    createColumnGroupResponse({
      columnGroupName: "Group A",
      columns: {
        normalColumns: [
          {
            physicalName: "COLUMN_A",
            logicalName: "Column A",
            columnType: ColumnType.VarCharN,
            notNull: true,
            uniqueKey: true,
            unsigned: false,
          },
        ],
      },
    }),
    createColumnGroupResponse({
      columnGroupName: "Group B",
      columns: {
        normalColumns: [
          {
            physicalName: "COLUMN_B",
            logicalName: "Column B",
            columnType: ColumnType.Int,
            notNull: false,
            uniqueKey: false,
            unsigned: true,
          },
        ],
      },
    }),
  ];

  const result = mapColumnGroupsFrom(input);

  expect(result).toEqual([
    {
      columnGroupName: "Group A",
      columns: [
        {
          physicalName: "COLUMN_A",
          logicalName: "Column A",
          columnType: ColumnType.VarCharN,
          notNull: true,
          unique: true,
          unsigned: false,
        },
      ],
    },
    {
      columnGroupName: "Group B",
      columns: [
        {
          physicalName: "COLUMN_B",
          logicalName: "Column B",
          columnType: ColumnType.Int,
          notNull: false,
          unique: false,
          unsigned: true,
        },
      ],
    },
  ]);
});

