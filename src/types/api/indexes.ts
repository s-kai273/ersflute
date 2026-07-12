type Column = {
  identityKey?: string;
  columnId: string;
  desc?: boolean;
};

type Index = {
  identityKey?: string;
  name: string;
  indexType: string;
  description?: string;
  fullText?: boolean;
  nonUnique?: boolean;
  columns: Column[];
};

export type Indexes = Index[];
