import type { DiagramResponse } from "@/types/api/diagram";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import type { Relationship } from "@/types/domain/relationship";
import type { Settings } from "@/types/domain/settings";
import type { Table } from "@/types/domain/table";
import type { VirtualDiagram } from "@/types/domain/vdiagram";
import {
  mapColumnGroupsFromApi,
  mapColumnGroupsToApi,
} from "./columnGroupMapper";
import { mapSettingsFromApi, mapSettingsToApi } from "./settingsMapper";
import {
  mapRelationshipsFromApi,
  mapTablesFromApi,
  mapTablesToApi,
} from "./tableMapper";
import { mapVDiagramsFromApi, mapVDiagramsToApi } from "./vdiagramMapper";
import {
  applyXmlNodeIdentities,
  collectXmlNodeIdentities,
} from "./xmlNodeIdentities";

export type DiagramMapping = {
  settings: Settings;
  tables: Table[];
  relationships: Relationship[];
  columnGroups: ColumnGroup[];
  vdiagrams: VirtualDiagram[];
  preservedXml?: string;
};

export function mapDiagramFromApi(diagram: DiagramResponse): DiagramMapping {
  const tables = diagram.diagramWalkers?.tables ?? [];
  const mapping = {
    settings: mapSettingsFromApi(diagram.diagramSettings),
    tables: mapTablesFromApi(tables),
    relationships: mapRelationshipsFromApi(tables),
    columnGroups: mapColumnGroupsFromApi(diagram.columnGroups ?? []),
    vdiagrams: mapVDiagramsFromApi(diagram.vdiagrams ?? []),
    preservedXml: diagram.preservedXml,
  };
  applyXmlNodeIdentities(diagram, mapping);
  return mapping;
}

export function mapDiagramToApi({
  preservedXml,
  settings,
  tables,
  relationships,
  columnGroups,
  vdiagrams,
}: DiagramMapping): DiagramResponse {
  return {
    preservedXml,
    xmlNodeIds: collectXmlNodeIdentities({
      tables,
      relationships,
      columnGroups,
      vdiagrams,
    }),
    diagramSettings: mapSettingsToApi(settings),
    diagramWalkers: {
      tables: mapTablesToApi(tables, relationships),
    },
    columnGroups: mapColumnGroupsToApi(columnGroups),
    vdiagrams: mapVDiagramsToApi(vdiagrams),
  };
}
