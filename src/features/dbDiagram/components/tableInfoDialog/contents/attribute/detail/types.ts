import type { Column } from "@/types/domain/column";

export type AttributeDetailProps = {
  column?: Column;
  onBack: (column: Column) => void;
};
