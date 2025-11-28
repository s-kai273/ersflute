import { type ComponentProps } from "react";
import { type Dialog } from "@/components/ui/dialog";
import { type TableNodeData } from "../tableNode/types";

export type TableInfoDialogProps = ComponentProps<typeof Dialog> & {
  data: TableNodeData;
  onApply?: (data: TableNodeData) => void;
  onCancel?: () => void;
};
