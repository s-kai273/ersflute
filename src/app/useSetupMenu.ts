import { useEffect } from "react";
import { setupWindowMenu } from "@/adapters/tauri/menu";
import { saveMenu } from "@/adapters/tauri/menu/file/save";

export function useSetupMenu(isLoaded: boolean) {
  useEffect(() => {
    void (async () => {
      await setupWindowMenu();
    })();
  }, []);

  useEffect(() => {
    void saveMenu.setEnabled(isLoaded);
  }, [isLoaded]);
}
