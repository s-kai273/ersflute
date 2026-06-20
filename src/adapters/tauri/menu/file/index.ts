import { Submenu } from "@tauri-apps/api/menu";
import { openFileMenu } from "./openFile";
import { quitMenu } from "./quit";
import { saveMenu } from "./save";

export const fileMenu = await Submenu.new({
  text: "File",
  items: [openFileMenu, saveMenu, quitMenu],
});
