import type { Column } from "@/types/domain/column";
import { ColumnType } from "@/types/domain/columnType";
import { resolveColumnTypeAttributes } from "./resolveColumnTypeAttributes";

it("uses inherited type attributes when explicit values are missing", () => {
  const column: Column = {
    physicalName: "STATUS_CODE",
    inheritedTypeAttributes: {
      columnType: ColumnType.CharN,
      length: 3,
      unsigned: false,
    },
  };

  expect(resolveColumnTypeAttributes(column)).toEqual({
    columnType: ColumnType.CharN,
    length: 3,
    decimal: undefined,
    enumArgs: undefined,
    unsigned: false,
  });
});

it("uses only explicit type attributes when a column type is specified", () => {
  const column: Column = {
    physicalName: "STATUS_CODE",
    columnType: ColumnType.VarCharN,
    unsigned: false,
    inheritedTypeAttributes: {
      columnType: ColumnType.CharN,
      length: 3,
      unsigned: true,
    },
  };

  expect(resolveColumnTypeAttributes(column)).toMatchObject({
    columnType: ColumnType.VarCharN,
    length: undefined,
    unsigned: false,
  });
});
