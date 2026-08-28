import { Player } from "@minecraft/server";
import { LevelCore } from "./levelCore";

export function processPlayerInTick(player: Player) {
  const playerLevelData = new LevelCore(player);
  for (const GongFaData of Object.entries(playerLevelData.gongFaList)) {
  }
}
