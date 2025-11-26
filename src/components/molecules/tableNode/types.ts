import { ColumnType } from "@/types/domain/columnType";

type Color = {
  r: number;
  g: number;
  b: number;
};

export type Column = {
  physicalName: string;
  logicalName?: string;
  columnType?: ColumnType;
  length?: number;
  decimal?: number;
  notNull: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  referredColumn?: string;
  unique?: boolean;
  unsigned?: boolean;
  enumArgs?: string;
  description?: string;
  defaultValue?: string;
};

export type TableNodeData = {
  color: Color;
  physicalName: string;
  logicalName?: string;
  columns?: Column[];
};
