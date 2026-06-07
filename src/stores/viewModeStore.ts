import { create } from "zustand";
import type { DiagramMode } from "@/types/domain/diagramMode";

type ViewModeStore = {
  isReadOnly: boolean;
  setReadOnly: (value: boolean) => void;
  diagramMode: DiagramMode | null;
  setDiagramMode: (mode: DiagramMode | null) => void;
};

export const useViewModeStore = create<ViewModeStore>((set) => ({
  isReadOnly: false,
  setReadOnly: (value) => set({ isReadOnly: value }),
  diagramMode: null,
  setDiagramMode: (mode) => set({ diagramMode: mode }),
}));
