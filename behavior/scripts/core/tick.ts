import { Player } from "@minecraft/server";
import { LevelCore } from "./levelCore";
import { GongFaRuntime } from "./gongFaRuntime";
import { GongFaEnumType, GongFaType } from "../config/gongfa";

export function processPlayerInTick(player: Player) {
  const playerLevelData = new LevelCore(player);
  for (const GongFaData of Object.entries(playerLevelData.gongFaList) as [
    GongFaType,
    { gongFaData: GongFaEnumType; playerP: number },
  ][]) {
    const gongFaRuntime = new GongFaRuntime(
      GongFaData[1].gongFaData,
      player,
      playerLevelData.getRawData(),
      GongFaData[1].playerP,
    );
  }
}
