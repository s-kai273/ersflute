import { create } from "zustand";
import type { ErrorDialogContent } from "@/features/errorDialog/types";

type ErrorDialogStore = {
  isOpen: boolean;
  content: ErrorDialogContent | null;
  openDialog: (content: ErrorDialogContent) => void;
  closeDialog: () => void;
};

export const useErrorDialogStore = create<ErrorDialogStore>((set) => ({
  isOpen: false,
  content: null,
  openDialog: (content) => set({ isOpen: true, content }),
  closeDialog: () => set({ isOpen: false, content: null }),
}));
