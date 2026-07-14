import type { VDiagramResponse } from "@/types/api/vdiagrams";
import type { VirtualDiagram, VirtualTable } from "@/types/domain/vdiagram";

export function mapVDiagramsFromApi(
  vdiagramResponses: VDiagramResponse[],
): VirtualDiagram[] {
  return vdiagramResponses.map((vdiagram) => {
    return {
      identityKey: vdiagram.identityKey,
      vdiagramName: vdiagram.vdiagramName,
      color: vdiagram.color,
      vtables: (vdiagram.vtables ?? []).map((vtable) => {
        return {
          identityKey: vtable.identityKey,
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
    identityKey: vdiagram.identityKey,
    vdiagramName: vdiagram.vdiagramName,
    color: vdiagram.color,
    vtables: vdiagram.vtables?.map((vtable) => ({
      identityKey: vtable.identityKey,
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
