import { invoke } from "@tauri-apps/api/core";
import {
  type DiagramMapping,
  mapDiagramFromApi,
} from "@/domain/mappers/diagramMapper";
import type { DiagramResponse } from "@/types/api/diagram";

export async function loadDiagram(filename: string): Promise<DiagramMapping> {
  const diagram = await invoke<DiagramResponse>("load_diagram", { filename });
  return mapDiagramFromApi(diagram);
}

export async function saveDiagram(
  filename: string,
  diagram: DiagramResponse,
): Promise<void> {
  await invoke("save_diagram", { filename, diagram });
}
