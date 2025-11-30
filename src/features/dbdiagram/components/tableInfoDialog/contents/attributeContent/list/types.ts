import type { Column } from "@/types/domain/tableNodeData";

export type AttributeListProps = {
  columns: Column[];
  selectedColumnIndex: number | null;
  onSelectColumn: (index: number) => void;
  onOpenDetail: (index: number) => void;
  onAddColumn: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
};
