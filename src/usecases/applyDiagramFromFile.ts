import { loadDiagram } from "@/api/diagram";
import { useDiagramStore } from "@/stores/diagramStore";
import { useErmFileStore } from "@/stores/ermFileStore";

export async function applyDiagramFromFile(filePath: string) {
  const {
    settings,
    tables,
    relationships,
    columnGroups,
    vdiagrams,
    preservedXml,
  } = await loadDiagram(filePath);
  const {
    setSettings,
    setTables,
    setRelationships,
    setColumnGroups,
    setVDiagrams,
  } = useDiagramStore.getState();
  setSettings(settings);
  setTables(tables);
  setRelationships(relationships);
  setColumnGroups(columnGroups);
  setVDiagrams(vdiagrams);
  const { setLoaded, setFilePath, setPreservedXml } =
    useErmFileStore.getState();
  setLoaded(true);
  setFilePath(filePath);
  setPreservedXml(preservedXml ?? null);
}
