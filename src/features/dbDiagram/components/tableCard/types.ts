import type { ComponentProps } from "react";
import type { Table } from "@/types/domain/table";

export type TableCardProps = ComponentProps<"div"> & {
  width?: number;
  height?: number;
  data: Table;
  onHeaderDoubleClick?: (event: React.MouseEvent) => void;
};
