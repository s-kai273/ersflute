export const Cardinality = {
  One: "1",
  ZeroOne: "0..1",
  OneN: "1..n",
  ZeroN: "0..n",
} as const;

export type Cardinality = (typeof Cardinality)[keyof typeof Cardinality];

export type Relationship = {
  name: string;
  source: string;
  target: string;
  parentCardinality: Cardinality;
  childCardinality: Cardinality;
};
