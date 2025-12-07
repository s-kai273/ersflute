import { useEffect } from "react";
import { setupWindowMenu } from "@/adapters/tauri/menu";

export function useSetupMenu() {
  useEffect(() => {
    setupWindowMenu();
  }, []);
}
