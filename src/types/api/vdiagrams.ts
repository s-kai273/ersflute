import type { Color } from "./diagramWalkers";
import type { Identified } from "../identified";

export type VTableResponse = Identified<{
  tableId: string;
  x: number;
  y: number;
  fontName: string;
  fontSize: number;
}>;

export type VDiagramResponse = Identified<{
  vdiagramName: string;
  color?: Color;
  vtables?: VTableResponse[];
  walkerNotes: Record<string, never>;
  walkerGroups: Record<string, never>;
}>;
