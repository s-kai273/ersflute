import type { ColumnGroupsResponse } from "./columnGroups";
import type { DiagramWalkersResponse } from "./diagramWalkers";

export type DiagramResponse = {
  diagramWalkers: DiagramWalkersResponse;
  columnGroups: ColumnGroupsResponse;
};
