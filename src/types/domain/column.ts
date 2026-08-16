import type { ColumnType } from "./columnType";
import type { Identified } from "../identified";

export type ColumnTypeAttributes = {
  columnType?: ColumnType;
  length?: number;
  decimal?: number;
  unsigned?: boolean;
  enumArgs?: string;
};

export type Column = Identified<
  ColumnTypeAttributes & {
    physicalName: string;
    logicalName?: string;
    description?: string;
    inheritedTypeAttributes?: ColumnTypeAttributes;
    notNull?: boolean;
    unique?: boolean;
    defaultValue?: string;
    primaryKey?: boolean;
    autoIncrement?: boolean;
    referredColumn?: string;
    relationship?: string;
  }
>;
