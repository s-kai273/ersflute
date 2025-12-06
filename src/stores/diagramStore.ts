import { create } from "zustand";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";

type DiagramStore = {
  tables: Table[];
  relationships: Relationship[];
  setTables: (tables: Table[]) => void;
  setRelationships: (relationships: Relationship[]) => void;
};

export const useDiagramStore = create<DiagramStore>((set) => ({
  tables: [],
  relationships: [],
  setTables: (tables: Table[]) => set({ tables }),
  setRelationships: (relationships: Relationship[]) => set({ relationships }),
}));
