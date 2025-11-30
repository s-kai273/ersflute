import { type DialogProps } from "@/components/ui/dialog";
import { type TableNodeData } from "@/types/domain/tableNodeData";

export type TableInfoDialogProps = DialogProps & {
  data: TableNodeData;
  onApply?: (data: TableNodeData) => void;
  onCancel?: () => void;
};
