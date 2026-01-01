import { invoke } from "@tauri-apps/api/core";
import { mapColumnGroupsFrom } from "@/domain/mappers/columnGroupMapper";
import {
  mapRelationshipsFrom,
  mapTablesFrom,
} from "@/domain/mappers/tableMapper";
import type { DiagramResponse } from "@/types/api/diagram";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";

export async function loadDiagram(filename: string): Promise<{
  tables: Table[];
  relationships: Relationship[];
  columnGroups: ColumnGroup[];
}> {
  const diagram = await invoke<DiagramResponse>("load_diagram", { filename });
  const tables = diagram.diagramWalkers.tables ?? [];
  const columnGroups = diagram.columnGroups?.columnGroups ?? [];
  return {
    tables: mapTablesFrom(tables),
    relationships: mapRelationshipsFrom(tables),
    columnGroups: mapColumnGroupsFrom(columnGroups),
  };
}
