import { invoke } from "@tauri-apps/api/core";
import {
  mapRelationshipsFrom,
  mapTablesFrom,
} from "@/domain/mappers/tableMapper";
import type { DiagramResponse } from "@/types/api/diagram";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";

export async function loadDiagram(filename: string): Promise<{
  tables: Table[];
  relationships: Relationship[];
}> {
  const diagram = await invoke<DiagramResponse>("load_diagram", { filename });
  return {
    tables: mapTablesFrom(diagram.diagramWalkers.tables),
    relationships: mapRelationshipsFrom(diagram.diagramWalkers.tables),
  };
}
