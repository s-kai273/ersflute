import type { Column } from "@/types/domain/tableNodeData";

export type AttributeDetailProps = {
  column?: Column;
  onBack: (column: Column) => void;
};
