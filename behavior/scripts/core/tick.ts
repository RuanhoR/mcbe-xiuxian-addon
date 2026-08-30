import { EntityComponentTypes, Player, system } from "@minecraft/server";
import { LevelCore } from "./levelCore";
import { GongFaRuntime } from "./gongFaRuntime";
import { GongFaEnumType, GongFaType } from "../config/gongfa";
import { AddonItem } from "../config";
import { processDanYaoInTick } from "./danYaoRuntime";
import { processMeditationInTick } from "./meditation";
import {
  getDanYaoIdFromItem,
  normalizeDanYaoItem,
} from "../utils/danyao";
import {
  getGongFaIdFromItem,
  normalizeGongFaItem,
} from "../utils/gongfa";
import { getZhenFaIdFromItem, normalizeZhenFaItem } from "../utils/zhenfa";

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
  // task 2.5: meditation (修炼，检查周围灵气)
  system.run(() => {
    processMeditationInTick(player);
  });
  // task 3: scan inventory, normalize danyao / gongfa item display
  system.run(() => {
    const container = player.getComponent(
      EntityComponentTypes.Inventory,
    )?.container;
    if (!container) return;
    for (let slot = 0; slot < container.size; slot++) {
      const item = container.getItem(slot);
      if (!item) continue;
      if (getDanYaoIdFromItem(item)) {
        if (normalizeDanYaoItem(item)) container.setItem(slot, item);
      } else if (item.typeId == AddonItem.ZhenPan) {
        if (normalizeZhenFaItem(item)) container.setItem(slot, item);
      } else if (item.typeId == AddonItem.GongFa) {
        if (normalizeGongFaItem(item)) container.setItem(slot, item);
      }
    }
  });
}
