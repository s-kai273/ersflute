import type { ColumnGroupsResponse } from "./columnGroups";
import { type DiagramSettingsResponse } from "./diagramSettings";
import type { DiagramWalkersResponse } from "./diagramWalkers";
import type { VDiagramResponse } from "./vdiagrams";

export type XmlNodeIdentity = {
  id: string;
  tag: string;
  parentId?: string;
  index: number;
};

export type DiagramResponse = {
  preservedXml?: string;
  xmlNodeIds?: XmlNodeIdentity[];
  diagramSettings?: DiagramSettingsResponse;
  diagramWalkers?: DiagramWalkersResponse;
  vdiagrams?: VDiagramResponse[];
  columnGroups?: ColumnGroupsResponse["columnGroups"];
};
