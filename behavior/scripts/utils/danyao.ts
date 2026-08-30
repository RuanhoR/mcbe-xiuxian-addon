import { ItemStack, RawMessage } from "@minecraft/server";
import { AddonItem } from "../config";
import { DanYaoColorItemMap, DanYaoEnum, DanYaoType } from "../config/danyao";
import { rawMessage } from "./message";
const skinIdToDanYao = new Map<string, DanYaoType>();
for (const [id, def] of Object.entries(DanYaoEnum) as [
  DanYaoType,
  (typeof DanYaoEnum)[DanYaoType],
][]) {
  const skinId =
    DanYaoColorItemMap[def.color as keyof typeof DanYaoColorItemMap] ??
    AddonItem.DanYao;
  if (skinIdToDanYao.has(skinId))
    throw new TypeError(`[danyao]: duplicate color skin ${skinId} on ${id}`);
  skinIdToDanYao.set(skinId, id);
}

export function isDanYaoItem(item: ItemStack | undefined): boolean {
  if (!item) return false;
  return skinIdToDanYao.has(item.typeId);
}

export function getDanYaoIdFromItem(item: ItemStack): DanYaoType | null {
  return skinIdToDanYao.get(item.typeId) ?? null;
}
export function generateDanYaoLore(
  def: (typeof DanYaoEnum)[DanYaoType],
): (RawMessage | string)[] {
  return [def.name, rawMessage`§r§7${def.level}品丹药`];
}

export function createDanYaoItem(
  id: DanYaoType,
  amount = 1,
): ItemStack | undefined {
  const def = DanYaoEnum[id];
  if (!def) return undefined;
  const skinId =
    DanYaoColorItemMap[def.color as keyof typeof DanYaoColorItemMap] ??
    AddonItem.DanYao;
  const item = new ItemStack(skinId, amount);
  item.setLore(generateDanYaoLore(def));
  return item;
}
export function normalizeDanYaoItem(item: ItemStack): boolean {
  const id = getDanYaoIdFromItem(item);
  if (!id) return false;
  if (item.getLore().length >= 2) return false;
  item.setLore(generateDanYaoLore(DanYaoEnum[id]));
  return true;
}
