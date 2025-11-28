import { type Cardinality } from "../../../types/api/table";

export type CardinalityEdgeData = {
  parentCardinality: Cardinality;
  childCardinality: Cardinality;
};
