import type { Cardinality } from "@/types/api/diagramWalkers";

export type CardinalityEdgeData = {
  parentCardinality: Cardinality;
  childCardinality: Cardinality;
};
