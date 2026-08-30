import {
  Container,
  EntityComponentTypes,
  Player,
} from "@minecraft/server";
import { GongFaType } from "../config/gongfa";
import { getGongFaIdFromItem, createGongFaItem } from "../utils/gongfa";

function getContainer(player: Player) {
  return player.getComponent(EntityComponentTypes.Inventory)?.container;
}

/** 遍历背包，收集所有 lore 指向指定功法的物品槽位 */
export function findGongFaItemSlots(player: Player, id: GongFaType): number[] {
  const container = getContainer(player);
  if (!container) return [];
  const slots: number[] = [];
  for (let slot = 0; slot < container.size; slot++) {
    const item = container.getItem(slot);
    if (!item) continue;
    if (getGongFaIdFromItem(item) === id) slots.push(slot);
  }
  return slots;
}

/** 删除背包内指定功法的所有物品（弃功用） */
export function removeGongFaItems(player: Player, id: GongFaType) {
  const container = getContainer(player);
  if (!container) return;
  for (const slot of findGongFaItemSlots(player, id)) {
    container.setItem(slot, undefined);
  }
}

/**
 * 唯一发放功法物品：背包里已存在该功法的物品则不动，否则给一本（lockMode = inventory）。
 * @returns true = 本次发放了新物品；false = 已持有
 */
export function giveUniqueGongFaItem(player: Player, id: GongFaType): boolean {
  if (findGongFaItemSlots(player, id).length > 0) return false;
  const container = getContainer(player);
  const item = createGongFaItem(id);
  if (!container || !item) return false;
  const overflow = container.addItem(item);
  if (overflow) {
    // 背包已满：丢一份到脚下（锁定物品无法被玩家丢出，只能脚本投放）
    try {
      player.dimension.spawnItem(item, player.location);
    } catch (error) {
      console.error(error);
    }
  }
  return true;
}
