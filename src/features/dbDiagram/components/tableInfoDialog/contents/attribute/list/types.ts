import type { Attributes } from "react";
import type { Column } from "@/types/domain/column";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import type { ColumnGroupName } from "@/types/domain/table";

export type ColumnItemProps = {
  column: Column;
  isSelected: boolean;
  isReadOnly: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
} & Attributes;

export type ColumnGroupItemProps = {
  columnGroup: ColumnGroup;
  index: number;
  selectedIndex: number | null;
  selectedInGroupIndex: number | null;
  isReadOnly: boolean;
  onSelect: (columnIndex: number | null, inGroupIndex: number | null) => void;
} & Attributes;

export type AttributeListProps = {
  columns: (Column | ColumnGroupName)[];
  selectedColumnIndex: number | null;
  selectedInGroupIndex: number | null;
  onSelectColumn: (index: number) => void;
  onSelectColumnGroup: (
    columnIndex: number | null,
    inGroupIndex: number | null,
  ) => void;
  onOpenDetail: (index: number) => void;
  onAddColumn: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
};
