import { ItemStack, ItemLockMode, RawMessage } from "@minecraft/server";
import { AddonItem } from "../config";
import { ZhenFaEnum, ZhenFaType } from "../config/zhenfa";
import { rawMessage, rawToText } from "./message";

/** lore 中的阵法标记行前缀（去除颜色代码后以 zhenfa: 开头） */
export const ZHENFA_LORE_TAG = "zhenfa:";

/** 从物品 lore 还原阵法 id；非阵盘或未知 id 返回 null */
export function getZhenFaIdFromItem(item: ItemStack): ZhenFaType | null {
  for (const line of item.getLore()) {
    const clean = line.replace(/§./g, "");
    if (!clean.startsWith(ZHENFA_LORE_TAG)) continue;
    const id = clean.slice(ZHENFA_LORE_TAG.length) as ZhenFaType;
    return ZhenFaEnum[id] ? id : null;
  }
  return null;
}

/** 阵盘 lore：阵法名（RawMessage）+ 品阶/时长 + 标记行 */
export function generateZhenFaLore(id: ZhenFaType): (RawMessage | string)[] {
  const def = ZhenFaEnum[id];
  return [
    def.name,
    rawMessage`§r§7${def.level}重阵法 · 存续${Math.floor(def.duration / 20)}s · 半径${def.radius}`,
    rawMessage`§r§8${ZHENFA_LORE_TAG}${id}`,
  ];
}

/** 生成一张已铭刻阵法的阵盘，默认锁定在背包 */
export function createZhenFaItem(id: ZhenFaType, lock = true): ItemStack | undefined {
  if (!ZhenFaEnum[id]) return undefined;
  const item = new ItemStack(AddonItem.ZhenPan, 1);
  item.setLore(generateZhenFaLore(id));
  if (lock) item.lockMode = ItemLockMode.inventory;
  return item;
}

/** 空白阵盘（未铭刻） */
export function createBlankZhenPanItem(amount = 1): ItemStack {
  const item = new ItemStack(AddonItem.ZhenPan, amount);
  item.nameTag = rawToText(rawMessage`空白阵盘`);
  item.setLore([rawMessage`§r§7右键（轻触方块）无法布阵`, rawMessage`§r§7需先铭刻阵法`]);
  return item;
}

/**
 * 规范化背包中的阵盘显示（lore 缺失时补全）。
 * @returns 是否有改动
 */
export function normalizeZhenFaItem(item: ItemStack): boolean {
  const id = getZhenFaIdFromItem(item);
  if (!id) return false;
  if (item.getLore().length >= 3) return false;
  item.setLore(generateZhenFaLore(id));
  return true;
}
