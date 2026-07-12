import type { Color } from "./table";

export type VirtualTable = {
  identityKey?: string;
  tableId: string;
  x: number;
  y: number;
  fontName: string;
  fontSize: number;
};

export type VirtualDiagram = {
  identityKey?: string;
  vdiagramName: string;
  color?: Color;
  vtables: VirtualTable[];
  walkerNotes: Record<string, never>;
  walkerGroups: Record<string, never>;
};
