import { loadDiagram } from "@/api/diagram";
import { useDiagramStore } from "@/stores/diagramStore";
import { useErmFileStore } from "@/stores/ermFileStore";

export async function applyDiagramFromFile(filePath: string) {
  try {
    const { tables, relationships } = await loadDiagram(filePath);
    const { setTables, setRelationships } = useDiagramStore.getState();
    setTables(tables);
    setRelationships(relationships);
    const { setLoaded, setFilePath } = useErmFileStore.getState();
    setLoaded(true);
    setFilePath(filePath);
  } catch (e) {
    console.error("Failed to load diagram:", e);
  }
}
