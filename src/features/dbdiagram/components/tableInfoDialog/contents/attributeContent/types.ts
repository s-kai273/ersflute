import type { TableNodeData } from "@/types/domain/tableNodeData";

export type AttributeContentProps = {
  data: TableNodeData;
  setData: (
    data: TableNodeData | ((data: TableNodeData) => TableNodeData),
  ) => void;
};
