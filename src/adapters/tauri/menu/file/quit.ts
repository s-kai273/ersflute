import { MenuItem } from "@tauri-apps/api/menu";
import { type } from "@tauri-apps/plugin-os";
import { exit } from "@tauri-apps/plugin-process";

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
    exit(0).catch((e) => {
      console.error("Failed to quit the application:", e);
    });
  },
});
