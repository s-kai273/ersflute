import { MenuItem } from "@tauri-apps/api/menu";
import { type } from "@tauri-apps/plugin-os";
import { exit } from "@tauri-apps/plugin-process";
import { showErrorDialog } from "@/features/errorDialog";

function getAccelerator() {
  const osType = type();
  if (osType === "linux" || osType === "windows") {
    return "Alt+F4";
  }
  if (osType === "macos") {
    return "Cmd+Q";
  }
  return undefined;
}

export const quitMenu = await MenuItem.new({
  id: "quit",
  text: "Quit",
  accelerator: getAccelerator(),
  action: () => {
    exit(0).catch((error) => {
      showErrorDialog(error, {
        title: "Unable to quit",
        message:
          "The application could not exit. Please close the window manually.",
        context: "Quitting the application from the File menu",
      });
    });
  },
});
