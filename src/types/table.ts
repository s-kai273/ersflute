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
  parentCardinality: number;
  childCardinality: number;
  referenceForPk: boolean;
  onDeleteAction: string;
  onUpdateAction: string;
};

type Connections = {
  relationship: Relationship[];
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
};
