import { create } from "zustand";

type ReadOnlyStore = {
  isReadOnly: boolean;
  setReadOnly: (value: boolean) => void;
};

export const useReadOnlyStore = create<ReadOnlyStore>((set) => ({
  // First release ships in view-only mode, so this stays true until editing features call setReadOnly(false) in the future.
  isReadOnly: true,
  setReadOnly: (value) => set({ isReadOnly: value }),
}));
