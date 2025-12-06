import { invoke } from "@tauri-apps/api/core";
import type { DiagramResponse } from "@/types/api/diagram";

export async function loadDiagram(filename: string): Promise<DiagramResponse> {
  return await invoke<DiagramResponse>("load_diagram", { filename });
}
