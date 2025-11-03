import { TableNodeData } from "@/components/molecules/tableNode/types";

export type AttributeContentProps = {
  data: TableNodeData;
  setData: (
    data: TableNodeData | ((data: TableNodeData) => TableNodeData),
  ) => void;
};
