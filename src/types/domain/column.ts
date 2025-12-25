import type { ColumnType } from "./columnType";

export type Column = {
  physicalName: string;
  logicalName?: string;
  columnType?: ColumnType;
  length?: number;
  decimal?: number;
  notNull?: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  referredColumn?: string;
  unique?: boolean;
  unsigned?: boolean;
  enumArgs?: string;
  description?: string;
  defaultValue?: string;
};
