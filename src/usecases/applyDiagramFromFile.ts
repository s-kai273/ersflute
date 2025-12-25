import { loadDiagram } from "@/api/diagram";
import { useDiagramStore } from "@/stores/diagramStore";
import { useErmFileStore } from "@/stores/ermFileStore";

export async function applyDiagramFromFile(filePath: string) {
  const { tables, relationships, columnGroups } = await loadDiagram(filePath);
  const { setTables, setRelationships, setColumnGroups } =
    useDiagramStore.getState();
  setTables(tables);
  setRelationships(relationships);
  setColumnGroups(columnGroups);
  const { setLoaded, setFilePath } = useErmFileStore.getState();
  setLoaded(true);
  setFilePath(filePath);
}
