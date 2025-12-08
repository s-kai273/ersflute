import { create } from "zustand";

type ErmFileStore = {
  isLoaded: boolean;
  setLoaded: (value: boolean) => void;
  filePath: string | null;
  setFilePath: (path: string | null) => void;
};

export const useErmFileStore = create<ErmFileStore>((set) => ({
  isLoaded: false,
  setLoaded: (value) => set({ isLoaded: value }),
  filePath: null,
  setFilePath: (path) => set({ filePath: path }),
}));
