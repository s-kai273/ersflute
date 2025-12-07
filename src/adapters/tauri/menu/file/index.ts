import { Submenu } from "@tauri-apps/api/menu";
import { quitMenu } from "./quit";

export const fileMenu = await Submenu.new({
  text: "File",
  items: [quitMenu],
});
