import type { Column } from "./column";

export type ColumnGroupName = string;

export function isColumnGroupName(
  value: Column | ColumnGroupName,
): value is ColumnGroupName {
  return typeof value === "string";
}

export type Color = {
  r: number;
  g: number;
  b: number;
};

export type IndexColumn = {
  columnId: string;
  desc?: boolean;
};

export type Index = {
  identityKey?: string;
  name: string;
  indexType: string;
  description?: string;
  fullText?: boolean;
  nonUnique?: boolean;
  columns: IndexColumn[];
};

export type CompoundUniqueKey = {
  identityKey?: string;
  name: string;
  columns: string[];
};

export type Table = {
  identityKey?: string;
  color: Color;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
  fontSize?: number;
  physicalName: string;
  logicalName: string;
  description: string;
  tableConstraint?: string;
  primaryKeyName?: string;
  option?: string;
  columns?: (Column | ColumnGroupName)[];
  indexes?: Index[];
  compoundUniqueKeys?: CompoundUniqueKey[];
};
