import type { Column } from "./column";
import type { Identified } from "../identified";

export type ColumnGroup = Identified<{
  columnGroupName: string;
  columns: Column[];
}>;
