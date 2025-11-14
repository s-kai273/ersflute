import { Column } from "@/components/molecules/tableNode/types";

export type AttributeDetailProps = {
  column?: Column;
  onBack: (column: Column) => void;
};
