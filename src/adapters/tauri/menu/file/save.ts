import { MenuItem } from "@tauri-apps/api/menu";
import { showErrorDialog } from "@/features/errorDialog";
import { saveCurrentDiagram } from "@/usecases/saveCurrentDiagram";

export const saveMenu = await MenuItem.new({
  id: "save",
  text: "Save",
  accelerator: "CmdOrCtrl+S",
  action: () => {
    void saveCurrentDiagram().catch((error: unknown) => {
      showErrorDialog(error, {
        title: "Failed to save diagram",
        message: "The ER diagram could not be saved.",
        context: "Saving the current file from the File menu",
      });
    });
  },
});
