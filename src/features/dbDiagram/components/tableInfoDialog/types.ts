import { type DialogProps } from "@/components/ui/dialog";
import { type Table } from "@/types/domain/table";

export type TableInfoDialogProps = DialogProps & {
  data: Table;
  onApply?: (data: Table) => void;
  onCancel?: () => void;
};
