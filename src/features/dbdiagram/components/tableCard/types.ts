import type { ComponentProps } from "react";
import type { TableNodeData } from "@/types/domain/tableNodeData";

export type TableCardProps = ComponentProps<"div"> & {
  width?: number;
  height?: number;
  data: TableNodeData;
  onHeaderDoubleClick?: (event: React.MouseEvent) => void;
};
