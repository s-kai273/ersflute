import type { Column } from "./column";

export type ColumnGroup = {
  identityKey?: string;
  columnGroupName: string;
  columns: Column[];
};
