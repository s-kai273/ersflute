import type { Color } from "./table";
import type { Identified } from "../identified";

export type VirtualTable = Identified<{
  tableId: string;
  x: number;
  y: number;
  fontName: string;
  fontSize: number;
}>;

export type VirtualDiagram = Identified<{
  vdiagramName: string;
  color?: Color;
  vtables: VirtualTable[];
  walkerNotes: Record<string, never>;
  walkerGroups: Record<string, never>;
}>;
