import { Menu } from "@tauri-apps/api/menu";
import { fileMenu } from "./file";

// Although Tauri provides PredefinedMenuItem, its behavior is inconsistent on Linux.
// To ensure consistent cross-platform behavior, an equivalent menu item is implemented manually.
export async function setupWindowMenu() {
  const menu = await Menu.new({
    items: [fileMenu],
  });
  await menu.setAsAppMenu();
}
