import type { ColumnType } from "./columnType";

export type Column = {
  physicalName: string;
  logicalName?: string;
  description?: string;
  columnType?: ColumnType;
  length?: number;
  decimal?: number;
  unsigned?: boolean;
  notNull?: boolean;
  unique?: boolean;
  defaultValue?: string;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  referredColumn?: string;
  enumArgs?: string;
};
