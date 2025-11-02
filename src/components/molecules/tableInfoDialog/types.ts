import { ComponentProps } from "react";
import { Dialog } from "@/components/ui/dialog";
import { TableNodeData } from "../tableNode/types";

export type TableInfoDialogProps = ComponentProps<typeof Dialog> & {
  data: TableNodeData;
  onApply?: (data: TableNodeData) => void;
  onCancel?: () => void;
};
