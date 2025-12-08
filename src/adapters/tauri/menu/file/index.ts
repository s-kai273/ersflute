import { Submenu } from "@tauri-apps/api/menu";
import { openFileMenu } from "./openFile";
import { quitMenu } from "./quit";

export const fileMenu = await Submenu.new({
  text: "File",
  items: [openFileMenu, quitMenu],
});
