export type ConstraintOptionContentProps = {
  tableConstraint?: string;
  primaryKeyName?: string;
  option?: string;
  setTableConstraint?: (tableConstraint: string) => void;
  setPrimaryKeyName?: (primaryKeyName: string) => void;
  setOption?: (option: string) => void;
};
