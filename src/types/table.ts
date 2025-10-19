type Color = {
  r: number;
  g: number;
  b: number;
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
};
