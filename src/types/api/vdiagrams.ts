import type { Color } from "./diagramWalkers";

export type VTableResponse = {
  identityKey?: string;
  tableId: string;
  x: number;
  y: number;
  fontName: string;
  fontSize: number;
};

export type VDiagramResponse = {
  identityKey?: string;
  vdiagramName: string;
  color?: Color;
  vtables?: VTableResponse[];
  walkerNotes: Record<string, never>;
  walkerGroups: Record<string, never>;
};
