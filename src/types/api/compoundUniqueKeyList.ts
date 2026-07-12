type Column = {
  identityKey?: string;
  columnId: string;
};

type CompoundUniqueKey = {
  identityKey?: string;
  name: string;
  columns: Column[];
};

export type CompoundUniqueKeyList = {
  compoundUniqueKeys?: CompoundUniqueKey[];
};
