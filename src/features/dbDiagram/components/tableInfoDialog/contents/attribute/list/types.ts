import type { Column } from "@/types/domain/column";
import type { ColumnGroupName } from "@/types/domain/table";

export type AttributeListProps = {
  columns: (Column | ColumnGroupName)[];
  selectedColumnIndex: number | null;
  onSelectColumn: (index: number) => void;
  onOpenDetail: (index: number) => void;
  onAddColumn: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
};
