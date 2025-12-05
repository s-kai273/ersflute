import { invoke } from "@tauri-apps/api/core";
import type { Diagram } from "@/types/api/diagram";

export async function loadDiagram(filename: string): Promise<Diagram> {
  return await invoke<Diagram>("load_diagram", { filename });
}
