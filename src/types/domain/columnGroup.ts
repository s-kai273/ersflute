import type { Column } from "./column";

export type ColumnGroup = {
  xmlNodeId?: string;
  columnGroupName: string;
  columns: Column[];
};
