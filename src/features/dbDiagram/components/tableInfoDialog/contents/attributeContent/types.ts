import type { Table } from "@/types/domain/table";

export type AttributeContentProps = {
  data: Table;
  setData: (data: Table | ((data: Table) => Table)) => void;
};
