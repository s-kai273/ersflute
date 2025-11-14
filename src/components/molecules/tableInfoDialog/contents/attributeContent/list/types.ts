import type { Column } from "@/components/molecules/tableNode/types";

export type AttributeListProps = {
  columns: Column[];
  selectedColumnIndex: number | null;
  onSelectColumn: (index: number) => void;
  onOpenDetail: (index: number) => void;
  onAddColumn: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
};
