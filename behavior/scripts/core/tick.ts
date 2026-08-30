import { EntityComponentTypes, Player, system } from "@minecraft/server";
import { LevelCore } from "./levelCore";
import { GongFaRuntime } from "./gongFaRuntime";
import { GongFaEnumType, GongFaType } from "../config/gongfa";
import { AddonItem } from "../config";
import { processDanYaoInTick } from "./danYaoRuntime";

export function processPlayerInTick(player: Player) {
  const playerLevelData = new LevelCore(player);
  // task 1: run gongfa backend
  system.run(() => {
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
      if (!GongFaData[1].gongFaData.use.isActiveSkill)
        gongFaRuntime.runBackend();
    }
  });
  // task 2: run danyao backend (buff 生效期间)
  system.run(() => {
    processDanYaoInTick(player);
  });
  // task 2: identify gongfa, danyao
  system.run(() => {
    const playerInv = player.getComponent(
      EntityComponentTypes.Inventory,
    )?.container;
    if (!playerInv) {
      return;
    }
    for (let slot = 0; slot < playerInv?.size; slot++) {
      const item = playerInv.getItem(slot);
      if (!item) continue;
      if (item.typeId == AddonItem.GongFa) {
      }
    }
  });
}
