import { create } from "zustand";

type ReadOnlyStore = {
  isReadOnly: boolean;
  setReadOnly: (value: boolean) => void;
};

export const useReadOnlyStore = create<ReadOnlyStore>((set) => ({
  isReadOnly: false,
  setReadOnly: (value) => set({ isReadOnly: value }),
}));
