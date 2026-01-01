import type { Column } from "@/types/domain/column";
import { ColumnTypeConfigMap } from "@/types/domain/columnType";

function buildColumnTypeWithoutUnsigned(column: Column) {
  const columnType = column.columnType!;
  const config = ColumnTypeConfigMap[columnType];
  const labelWithoutArgs = config.labelWithoutArgs;
  // By design, there is no columnType that supports decimal only.
  // If decimal is specified without an explicit length, length is set to 0 to indicate an unspecified precision,
  // meaning the column is still treated as supporting both length and decimal.
  // Hence, a case where supportsDecimal is true and supportsLength is false does not exist.
  if (config.supportsLength && config.supportsDecimal) {
    return `${labelWithoutArgs}(${column.length ?? 0}, ${column.decimal ?? 0})`;
  }
  if (config.supportsLength) {
    return `${labelWithoutArgs}(${column.length ?? 0})`;
  }
  return ColumnTypeConfigMap[columnType].label;
}

export function formatColumnType(column: Column) {
  if (!column.columnType) {
    return "";
  }
  return `${buildColumnTypeWithoutUnsigned(column)}${column.unsigned ? " unsigned" : ""}`;
}
