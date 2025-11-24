import type { DiagramMode } from "@/types/domain/diagramMode";

export type ToolbarProps = {
  activeMode: DiagramMode | null;
  onModeChange: (mode: DiagramMode) => void;
};
