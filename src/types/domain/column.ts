import type { ColumnType } from "./columnType";
import type { Identified } from "../identified";

export type Column = Identified<{
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
  relationship?: string;
  enumArgs?: string;
}>;
