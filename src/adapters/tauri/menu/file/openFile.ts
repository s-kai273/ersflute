import { MenuItem } from "@tauri-apps/api/menu";
import { open } from "@tauri-apps/plugin-dialog";
import { applyDiagramFromFile } from "@/usecases/applyDiagramFromFile";

function getAccelerator() {
  return "CmdOrCtrl+O";
}

export const openFileMenu = await MenuItem.new({
  id: "openFile",
  text: "Open File",
  accelerator: getAccelerator(),
  action: () => {
    open({ filters: [{ name: "ER Diagram", extensions: ["erm"] }] })
      .then(async (filePath) => {
        if (filePath) {
          await applyDiagramFromFile(filePath);
        }
      })
      .catch((e) => {
        console.error("Failed to open file:", e);
      });
  },
});
