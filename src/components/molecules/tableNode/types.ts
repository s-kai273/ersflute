type Color = {
  r: number;
  g: number;
  b: number;
};

export type Column = {
  physicalName: string;
  logicalName?: string;
  columnType?: string;
  length?: number;
  notNull: boolean;
  primaryKey?: boolean;
  referredColumn?: string;
  unique?: boolean;
};

export type TableNodeData = {
  color: Color;
  physicalName: string;
  logicalName?: string;
  columns?: Column[];
};
