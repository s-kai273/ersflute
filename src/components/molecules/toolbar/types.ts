import type { DiagramMode } from "../../../types/diagramMode";

export type ToolbarProps = {
  activeMode: DiagramMode;
  onModeChange: (mode: DiagramMode) => void;
};
