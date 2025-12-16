import { MenuItem } from "@tauri-apps/api/menu";
import { open } from "@tauri-apps/plugin-dialog";
import { showErrorDialog } from "@/features/errorDialog";
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
      .catch((error) => {
        showErrorDialog(error, {
          title: "Failed to open file",
          message: "The ER diagram could not be opened.",
          context: "Opening a file from the menu",
        });
      });
  },
});
