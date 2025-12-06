import { create } from "zustand";
import type { DiagramResponse } from "@/types/api/diagram";
import type { TableResponse } from "@/types/api/diagramWalkers";

type DiagramStore = {
  tables: TableResponse[];
  setDiagram: (diagram: DiagramResponse) => void;
};

export const useDiagramStore = create<DiagramStore>((set) => ({
  tables: [],
  setDiagram: (diagram: DiagramResponse) =>
    set({ tables: diagram.diagramWalkers.tables }),
}));
