import type {
  Column,
  ColumnTypeAttributes,
} from "@/types/domain/column";

export function usesInheritedTypeAttributes(column: Column): boolean {
  return column.inheritedTypeAttributes !== undefined;
}

export function resolveColumnTypeAttributes(
  column: Column,
): ColumnTypeAttributes {
  if (usesInheritedTypeAttributes(column)) {
    return column.inheritedTypeAttributes ?? {};
  }

  return {
    columnType: column.columnType,
    length: column.length,
    decimal: column.decimal,
    enumArgs: column.enumArgs,
    unsigned: column.unsigned,
  };
}
