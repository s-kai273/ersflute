export const Cardinality = {
  One: "1",
  ZeroOne: "0..1",
  OneN: "1..n",
  ZeroN: "0..n",
} as const;

export type Cardinality = (typeof Cardinality)[keyof typeof Cardinality];

export type Color = {
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
  parentCardinality: Cardinality;
  childCardinality: Cardinality;
  referenceForPk: boolean;
  onDeleteAction: string;
  onUpdateAction: string;
};

type Connections = {
  relationships?: Relationship[];
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
  normalColumns: NormalColumn[];
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

export type DiagramWalkers = {
  tables: Table[];
};
