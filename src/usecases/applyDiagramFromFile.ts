import { loadDiagram } from "@/api/diagram";
import { useDiagramStore } from "@/stores/diagramStore";

export async function applyDiagramFromFile(filePath: string) {
  try {
    const { tables, relationships } = await loadDiagram(filePath);
    const { setTables, setRelationships } = useDiagramStore.getState();
    setTables(tables);
    setRelationships(relationships);
  } catch (e) {
    console.error("Failed to load diagram:", e);
  }
}
