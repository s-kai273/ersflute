type Color = {
  r: number;
  g: number;
  b: number;
};

type FkColumn = {
  fkColumnName: string;
};

type FkColumns = {
  fkColumn: FkColumn[];
};

type Relationship = {
  name: string;
  source: string;
  target: string;
  fkColumns: FkColumns;
  parentCardinality: string;
  childCardinality: string;
  referenceForPk: boolean;
  onDeleteAction: string;
  onUpdateAction: string;
};

type Connections = {
  relationship?: Relationship[];
};

type NormalColumn = {
  physicalName: string;
  logicalName?: string;
  columnType?: string;
  length?: number;
  notNull: boolean;
  primaryKey?: boolean;
  referredColumn?: string;
  relationship?: string;
};

type Columns = {
  normalColumn: NormalColumn[];
};

export type Table = {
  physicalName: string;
  logicalName: string;
  description: string;
  height: number;
  width: number;
  fontName: string;
  fontSize: number;
  x: number;
  y: number;
  color: Color;
  connections?: Connections;
  columns?: Columns;
};
