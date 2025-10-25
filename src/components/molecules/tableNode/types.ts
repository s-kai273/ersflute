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
};

export type TableNodeData = {
  color: Color;
  physicalName: string;
  columns?: Column[];
};
