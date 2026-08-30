import { ItemStack } from "@minecraft/server";
import { AddonItem } from "../config";
import { DanYaoColorItemMap, DanYaoEnum, DanYaoType } from "../config/danyao";
import { rawToText } from "./message";

/** lore 中的丹药标记行前缀（去除颜色代码后以 danyao: 开头） */
export const DANYAO_LORE_TAG = "danyao:";

const danYaoItemIds = new Set<string>(Object.values(DanYaoColorItemMap));

export function isDanYaoItem(item: ItemStack | undefined): boolean {
  if (!item) return false;
  return item.typeId === AddonItem.DanYao || danYaoItemIds.has(item.typeId);
}

function stripColorCodes(text: string) {
  return text.replace(/§./g, "");
}

/** 从物品 lore 还原丹药 id；非丹药或未知 id 返回 null */
export function getDanYaoIdFromItem(item: ItemStack): DanYaoType | null {
  for (const line of item.getLore()) {
    const clean = stripColorCodes(line);
    if (!clean.startsWith(DANYAO_LORE_TAG)) continue;
    const id = clean.slice(DANYAO_LORE_TAG.length) as DanYaoType;
    return DanYaoEnum[id] ? id : null;
  }
  return null;
}

/** 生成一颗丹药：外观取定义颜色对应的皮肤物品，name/品阶/标记全部写进 lore/nameTag */
export function createDanYaoItem(id: DanYaoType, amount = 1): ItemStack | undefined {
  const def = DanYaoEnum[id];
  if (!def) return undefined;
  const skinId = DanYaoColorItemMap[def.color as keyof typeof DanYaoColorItemMap] ?? AddonItem.DanYao;
  const item = new ItemStack(skinId, amount);
  item.nameTag = `${rawToText(def.name)} §7[${def.level}品]`;
  item.setLore([
    ...generateDanYaoLore(def),
    `§r§8${DANYAO_LORE_TAG}${id}`,
  ]);
  return item;
}

/** 丹药定义 → lore 行（名称 + 品阶） */
export function generateDanYaoLore(def: (typeof DanYaoEnum)[DanYaoType]): string[] {
  return [
    `§r${rawToText(def.name)}`,
    `§r§7${def.level}品丹药`,
  ];
}
