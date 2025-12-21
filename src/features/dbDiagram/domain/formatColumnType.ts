import { ColumnTypeConfigMap } from "@/types/domain/columnType";
import type { Column } from "@/types/domain/table";

export const formatColumnType = (column: Column) => {
  if (!column.columnType) {
    return "";
  }

  const config = ColumnTypeConfigMap[column.columnType];
  const labelWithougArgs = config.labelWithoutArgs;
  // By design, there is no columnType that supports decimal only.
  // If decimal is specified without an explicit length, length is set to 0 to indicate an unspecified precision,
  // meaning the column is still treated as supporting both length and decimal.
  // Hence, a case where supportsDecimal is true and supportsLength is false does not exist.
  if (config.supportsLength && config.supportsDecimal) {
    return `${labelWithougArgs}(${column.length ?? 0}, ${column.decimal ?? 0})`;
  }
  if (config.supportsLength) {
    return `${labelWithougArgs}(${column.length ?? 0})`;
  }
  return ColumnTypeConfigMap[column.columnType].label;
};
