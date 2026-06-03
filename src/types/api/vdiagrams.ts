import type { Color } from "./diagramWalkers";

export type VTableResponse = {
  tableId: string;
  x: number;
  y: number;
  fontName: string;
  fontSize: number;
};

export type VDiagramResponse = {
  vdiagramName: string;
  color?: Color;
  vtables?: VTableResponse[];
  walkerNotes: Record<string, never>;
  walkerGroups: Record<string, never>;
};
