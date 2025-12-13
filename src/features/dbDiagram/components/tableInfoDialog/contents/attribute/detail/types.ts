import type { Column } from "@/types/domain/table";

export type AttributeDetailProps = {
  column?: Column;
  onBack: (column: Column) => void;
};
