import { system, world } from "@minecraft/server";
import { PlayerLevel } from "./playerLevel";
import { onPlayerStatusChange } from "../command/resolve";
import { ActionFormData } from "@minecraft/server-ui";
import { rawMessage } from "../utils";
export function startLoop() {
  onPlayerStatusChange((status, player) => {
    if (status == "inPuTuan") {
      new ActionFormData()
        .title({ translate: "sapi.message.intoputuan.formtitle" })
        .button("");
    }
  });
  return system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
      const data = new PlayerLevel(player).getLevel();
      player.onScreenDisplay.setActionBar(
        rawMessage`${data.name} ${data.phase} ${data.spirit}/${data.spiritMax}`,
      );
    }
  }, 10);
}
