import type { ColumnGroupsResponse } from "./columnGroups";
import { type DiagramSettingsResponse } from "./diagramSettings";
import type { DiagramWalkersResponse } from "./diagramWalkers";
import type { VDiagramResponse } from "./vdiagrams";

export type DiagramResponse = {
  preservedXml?: string;
  diagramSettings?: DiagramSettingsResponse;
  diagramWalkers?: DiagramWalkersResponse;
  vdiagrams?: VDiagramResponse[];
  columnGroups?: ColumnGroupsResponse["columnGroups"];
};
