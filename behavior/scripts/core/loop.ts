import { system, world } from "@minecraft/server";
import { PlayerLevel } from "./playerLevel";

export function startLoop() {
  return system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
      const data = new PlayerLevel(player).getLevel();
      player.onScreenDisplay.setActionBar({
        rawtext: [
          data.name,
          { text: " " },
          data.phase,
          { text: ` ${data.spirit}/${data.spiritMax}` },
        ],
      });
    }
  }, 10);
}
