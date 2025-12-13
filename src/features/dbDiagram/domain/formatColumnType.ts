import { ColumnTypeConfigMap } from "@/types/domain/columnType";
import type { Column } from "@/types/domain/table";

export const formatColumnType = (column: Column) => {
  if (!column.columnType) {
    return "";
  }

  const labelWithougArgs =
    ColumnTypeConfigMap[column.columnType].labelWithoutArgs;
  if (column.length != null && column.length >= 0) {
    if (column.decimal != null && column.decimal >= 0) {
      return `${labelWithougArgs}(${column.length}, ${column.decimal})`;
    }
    return `${labelWithougArgs}(${column.length})`;
  }

  if (column.decimal != null && column.decimal >= 0) {
    return `${labelWithougArgs}(${column.decimal})`;
  }

  return ColumnTypeConfigMap[column.columnType].label;
};
