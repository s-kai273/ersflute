import { Menu } from "@tauri-apps/api/menu";
import { fileMenu } from "./file";

export async function setupWindowMenu() {
  const menu = await Menu.new({
    items: [fileMenu],
  });
  await menu.setAsAppMenu();
}
