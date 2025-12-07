import { MenuItem } from "@tauri-apps/api/menu";

function getAccelerator() {
  return "CmdOrCtrl+O";
}

export const openFileMenu = await MenuItem.new({
  id: "openFile",
  text: "Open File",
  accelerator: getAccelerator(),
  action: () => {},
});
