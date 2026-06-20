import type { Column } from "@/types/domain/column";

export type AttributeDetailProps = {
  column?: Column;
  onChange: (column: Column) => void;
  onBack: () => void;
};
