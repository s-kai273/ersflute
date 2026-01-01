type NormalColumn = {
  physicalName: string;
  logicalName?: string;
  columnType: string;
  notNull?: boolean;
  uniqueKey?: boolean;
  unsigned?: boolean;
};

type Columns = {
  normalColumns?: NormalColumn[];
};

export type ColumnGroupResponse = {
  columnGroupName: string;
  columns: Columns;
};

export type ColumnGroupsResponse = {
  columnGroups?: ColumnGroupResponse[];
};
