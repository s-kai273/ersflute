import type { VDiagramResponse } from "@/types/api/vdiagrams";
import type { VirtualDiagram, VirtualTable } from "@/types/domain/vdiagram";

export function mapVDiagramsFromApi(
  vdiagramResponses: VDiagramResponse[],
): VirtualDiagram[] {
  return vdiagramResponses.map((vdiagram) => {
    return {
      vdiagramName: vdiagram.vdiagramName,
      color: vdiagram.color,
      vtables: (vdiagram.vtables ?? []).map((vtable) => {
        return {
          tableId: vtable.tableId,
          x: vtable.x,
          y: vtable.y,
          fontName: vtable.fontName,
          fontSize: vtable.fontSize,
        } satisfies VirtualTable;
      }),
      walkerNotes: vdiagram.walkerNotes,
      walkerGroups: vdiagram.walkerGroups,
    } satisfies VirtualDiagram;
  });
}

export function mapVDiagramsToApi(
  vdiagrams: VirtualDiagram[],
): VDiagramResponse[] {
  return vdiagrams.map((vdiagram) => ({
    vdiagramName: vdiagram.vdiagramName,
    color: vdiagram.color,
    vtables: vdiagram.vtables?.map((vtable) => ({
      tableId: vtable.tableId,
      x: vtable.x,
      y: vtable.y,
      fontName: vtable.fontName,
      fontSize: vtable.fontSize,
    })),
    walkerNotes: vdiagram.walkerNotes,
    walkerGroups: vdiagram.walkerGroups,
  }));
}
