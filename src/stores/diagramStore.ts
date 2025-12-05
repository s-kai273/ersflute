import { create } from "zustand";
import type { Diagram } from "@/types/api/diagram";
import type { Table } from "@/types/api/diagramWalkers";

type DiagramStore = {
  tables: Table[];
  setDiagram: (diagram: Diagram) => void;
};

export const useDiagramStore = create<DiagramStore>((set) => ({
  tables: [],
  setDiagram: (diagram: Diagram) =>
    set({ tables: diagram.diagramWalkers.tables }),
}));
