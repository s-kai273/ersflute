import { Cardinality } from "../../../types/table";

export type CardinalityEdgeData = {
  parentCardinality: Cardinality;
  childCardinality: Cardinality;
};
