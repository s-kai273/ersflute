type Color = {
  r: number;
  g: number;
  b: number;
};

export type Table = {
  physical_name: string;
  logical_name: string;
  description: string;
  height: number;
  width: number;
  font_name: string;
  font_size: number;
  x: number;
  y: number;
  color: Color;
};
