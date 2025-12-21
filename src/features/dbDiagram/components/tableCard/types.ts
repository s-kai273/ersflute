import type { ComponentProps } from "react";
import type { Table } from "@/types/domain/table";

export type TableCardProps = ComponentProps<"div"> & {
  width?: number;
  height?: number;
  setWidth?: (width: number) => void;
  setHeight?: (width: number) => void;
  data: Table;
  onHeaderDoubleClick?: (event: React.MouseEvent) => void;
};
