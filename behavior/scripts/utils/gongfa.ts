import { ItemStack, ItemLockMode } from "@minecraft/server";
import { RawMessage } from "@minecraft/server";
import { AddonItem } from "../config";
import {
  GongFaEnum,
  GongFaEnumType,
  GongFaProficiency,
  GongFaType,
} from "../config/gongfa";
import { t, rawMessage } from "./message";
import { SpiritualRootType } from "../types";

export function calcGongFaProficiencyLevel(
  GongFaData: GongFaEnumType,
  p: number,
): {
  name: GongFaProficiency;
  level: 1 | 2 | 3 | 4;
} {
  const pMap = {
    1: GongFaData.proficiency.beginner.p,
    2: GongFaData.proficiency.proficient.p,
    3: GongFaData.proficiency.master.p,
    4: GongFaData.proficiency.world.p,
  };
  if (p >= pMap[4]) {
    return {
      level: 4,
      name: GongFaProficiency.world,
    };
  }
  if (p >= pMap[3]) {
    return {
      level: 3,
      name: GongFaProficiency.master,
    };
  }
  if (p >= pMap[2]) {
    return {
      level: 4,
      name: GongFaProficiency.beginner,
    };
  }
  return {
    level: 1,
    name: GongFaProficiency.beginner,
  };
}
export function getGongFaName(GongFaId: GongFaType): RawMessage {
  return t(`sapi.namedefine.gongfa.${GongFaId}`);
}
export function randomGongFa({
  level,
  srType,
}: {
  srType?: SpiritualRootType[];
  level?: { min: number; max: number } | number;
}): GongFaType {
  const filters: Array<(value: GongFaType) => boolean> = [];
  if (level !== undefined) {
    filters.push((value) => {
      const gongfaLevel = GongFaEnum[value].level;
      if (typeof level === "number") {
        return gongfaLevel === level;
      } else {
        return gongfaLevel >= level.min && gongfaLevel <= level.max;
      }
    });
  }

  if (srType && srType.length > 0) {
    const srTypeSet = new Set(srType);
    filters.push((value) =>
      GongFaEnum[value].tr.some((type) => srTypeSet.has(type)),
    );
  }

  const filteredGongFa = (Object.keys(GongFaEnum) as GongFaType[]).filter(
    (value) => filters.every((fn) => fn(value)),
  );

  if (filteredGongFa.length === 0) {
    throw new TypeError("[RandomGongFa]: Not Found GongFa in pool");
  }

  return filteredGongFa[Math.floor(Math.random() * filteredGongFa.length)];
}

/** lore 中的功法标记行前缀（去除颜色代码后以 gongfa: 开头） */
export const GONGFA_LORE_TAG = "gongfa:";

/** 从物品 lore 还原功法 id；非功法书或未知 id 返回 null */
export function getGongFaIdFromItem(item: ItemStack): GongFaType | null {
  for (const line of item.getLore()) {
    const clean = line.replace(/§./g, "");
    if (!clean.startsWith(GONGFA_LORE_TAG)) continue;
    const id = clean.slice(GONGFA_LORE_TAG.length) as GongFaType;
    return GongFaEnum[id] ? id : null;
  }
  return null;
}

/** 功法物品 lore：功法名（t() 由游戏翻译）+ 标记行 */
export function generateGongFaLore(id: GongFaType): (RawMessage | string)[] {
  return [
    getGongFaName(id),
    rawMessage`§r§8${GONGFA_LORE_TAG}${id}`,
  ];
}

/** 生成功法物品：lore 编码功法 id，默认锁定在背包（不可丢弃/转移） */
export function createGongFaItem(id: GongFaType, lock = true): ItemStack | undefined {
  if (!GongFaEnum[id]) return undefined;
  const item = new ItemStack(AddonItem.GongFa, 1);
  item.setLore(generateGongFaLore(id));
  if (lock) item.lockMode = ItemLockMode.inventory;
  return item;
}

/**
 * 规范化背包中的功法物品显示（lore 缺失/为空时按定义补全）。
 * @returns 是否有改动（有改动才需要 setItem 写回）
 */
export function normalizeGongFaItem(item: ItemStack): boolean {
  const id = getGongFaIdFromItem(item);
  if (!id) return false;
  if (item.getLore().length >= 2) return false;
  item.setLore(generateGongFaLore(id));
  return true;
}
