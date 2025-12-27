import { create } from "zustand";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";

type DiagramStore = {
  tables: Table[];
  relationships: Relationship[];
  columnGroups: ColumnGroup[];
  setTables: (tables: Table[]) => void;
  setRelationships: (relationships: Relationship[]) => void;
  setColumnGroups: (columnGroups: ColumnGroup[]) => void;
};

export const useDiagramStore = create<DiagramStore>((set) => ({
  tables: [],
  relationships: [],
  columnGroups: [],
  setTables: (tables: Table[]) => set({ tables }),
  setRelationships: (relationships: Relationship[]) => set({ relationships }),
  setColumnGroups: (columnGroups: ColumnGroup[]) => set({ columnGroups }),
}));
