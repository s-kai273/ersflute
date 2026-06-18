import { saveDiagram } from "@/api/diagram";
import { mapDiagramToApi } from "@/domain/mappers/diagramMapper";
import { useDiagramStore } from "@/stores/diagramStore";
import { useErmFileStore } from "@/stores/ermFileStore";

export async function saveCurrentDiagram() {
  const { filePath, preservedXml } = useErmFileStore.getState();
  if (!filePath || !preservedXml) {
    return;
  }

  const { settings, tables, relationships, columnGroups, vdiagrams } =
    useDiagramStore.getState();
  const nextDiagram = mapDiagramToApi({
    preservedXml,
    settings,
    tables,
    relationships,
    columnGroups,
    vdiagrams,
  });
  await saveDiagram(filePath, nextDiagram);
}
