import type { Column } from "@/types/domain/column";
import { ColumnType } from "@/types/domain/columnType";
import { resolveColumnTypeAttributes } from "./resolveColumnTypeAttributes";

it("uses inherited attributes without merging explicit attributes", () => {
  const column: Column = {
    physicalName: "STATUS_CODE",
    columnType: ColumnType.VarCharN,
    length: 8,
    unsigned: false,
    enumArgs: "ACTIVE,INACTIVE",
    inheritedTypeAttributes: {
      columnType: ColumnType.CharN,
      length: 3,
      unsigned: true,
    },
  };

  expect(resolveColumnTypeAttributes(column)).toEqual({
    columnType: ColumnType.CharN,
    length: 3,
    unsigned: true,
  });
});

it("uses explicit type attributes when inherited attributes are missing", () => {
  const column: Column = {
    physicalName: "STATUS_CODE",
    columnType: ColumnType.VarCharN,
    length: 8,
    unsigned: false,
  };

  expect(resolveColumnTypeAttributes(column)).toEqual({
    columnType: ColumnType.VarCharN,
    length: 8,
    decimal: undefined,
    enumArgs: undefined,
    unsigned: false,
  });
});
