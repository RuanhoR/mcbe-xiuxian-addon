import {
  Dimension,
  EntityComponentTypes,
  EquipmentSlot,
  ItemStack,
  Player,
  RawMessage,
  Vector3,
  World,
} from "@minecraft/server";
import { PlayerLevelPhase } from "./config";
const STACK_LIMIT = 64;
export function getMainhand(player: Player) {
  return player
    .getComponent(EntityComponentTypes.Equippable)
    ?.getEquipment(EquipmentSlot.Mainhand);
}
export function setMainhand(player: Player, item: ItemStack | undefined) {
  player
    .getComponent(EntityComponentTypes.Equippable)
    ?.setEquipment(EquipmentSlot.Mainhand, item);
}
export function consumeMainhand(player: Player, count = 1) {
  const current = getMainhand(player);
  if (!current) return;
  const remaining = current.amount - count;
  if (remaining <= 0) {
    setMainhand(player, undefined);
  } else {
    current.amount = remaining;
    setMainhand(player, current);
  }
}
export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
function getFortuneDrop(level: number): number {
  const rand = Math.random() * (level + 2);
  if (rand < 2) {
    return 1;
  } else {
    return 2 + Math.floor(rand - 2);
  }
}
function weightedPick(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}
export type Value = number | string | boolean | object;
export class KV {
  constructor(private _kvSource: World | Player | ItemStack) {}
  public get<T extends Value>(key: string, defaultValue: Value): T {
    let parsed = defaultValue as string | number | boolean;
    let isJSON: boolean = false;
    let needWrite: boolean = false;
    const old = this._kvSource.getDynamicProperty(key);
    if (!old || typeof old !== typeof defaultValue) needWrite = true;
    if (typeof defaultValue == "object") {
      isJSON = true;
      parsed = JSON.stringify(parsed);
    }
    if (needWrite) {
      this._kvSource.setDynamicProperty(key, parsed);
    }
    let current = this._kvSource.getDynamicProperty(key);
    if (isJSON && typeof current == "string") current = JSON.parse(current);
    return current as T;
  }
  public set(key: string, value: Value) {
    this._kvSource.setDynamicProperty(
      key,
      typeof value == "object" ? JSON.stringify(value) : value,
    );
  }
  public totalByte() {
    return this._kvSource.getDynamicPropertyTotalByteCount;
  }
  public idList() {
    return this._kvSource.getDynamicPropertyIds;
  }
}
export function playerDestroyOre(
  location: Vector3,
  dim: Dimension,
  useItem: ItemStack | undefined,
  lootItem: Record<string, number>, // { itemId: weight } 权重
  oreId: string,
) {
  const enchantable = useItem?.getComponent("minecraft:enchantable");
  const silk = enchantable?.getEnchantment("silk_touch");
  const fortune = enchantable?.getEnchantment("fortune");
  if (silk) {
    dim.spawnItem(new ItemStack(oreId, 1), location);
    return;
  }
  const xpCount = Math.floor(Math.random() * 6) + 1;
  dim.spawnXp(location, xpCount);
  let totalCount = 1;
  if (fortune && fortune.level !== undefined) {
    totalCount = getFortuneDrop(fortune.level);
  }
  if (totalCount < 1) totalCount = 1;
  const counts: Record<string, number> = {};
  const itemIds = Object.keys(lootItem);
  if (itemIds.length === 0) return;

  for (let i = 0; i < totalCount; i++) {
    const chosen = weightedPick(lootItem);
    counts[chosen] = (counts[chosen] || 0) + 1;
  }
  for (const [itemId, count] of Object.entries(counts)) {
    if (count <= 0) continue;
    let remaining = count;
    while (remaining > 0) {
      const stackSize = Math.min(remaining, STACK_LIMIT);
      dim.spawnItem(new ItemStack(itemId, stackSize), location);
      remaining -= stackSize;
    }
  }
}
export function layerNumber(layer: number): RawMessage {
  return {
    translate: `sapi.playerlevel.layer.n${layer + 1}`,
  };
}
export function getPhase(layer: number, maxLayer: number): RawMessage {
  const ratio = layer / maxLayer;
  const index = Math.floor(ratio * 4); // 0 ~ 3
  return PlayerLevelPhase[Math.min(index, PlayerLevelPhase.length - 1)];
}
const SPIRIT_BASE = 20;
const SPIRIT_LAYER_STEP = 10;
/**
 * Spirit capacity of the current realm + layer. Spirit resets to 0 after
 * each breakthrough, so the cap is the amount that must be filled to advance.
 */
export function getSpiritMax(levelRef: number, layer: number) {
  if (levelRef === 0) return SPIRIT_BASE;
  return SPIRIT_LAYER_STEP * 2 ** levelRef * (layer + 1);
}
export function rawMessage(...args: unknown[]): { rawtext: RawMessage[] } {
  const convert = (arg: unknown): RawMessage => {
    if (typeof arg === "string") return { text: arg };
    if (typeof arg === "number" || typeof arg === "boolean")
      return { text: String(arg) };
    if (arg === null || arg === undefined) return { text: "" };
    if (
      (typeof arg === "object" && (arg as RawMessage).text !== undefined) ||
      (arg as RawMessage).translate !== undefined ||
      (arg as RawMessage).rawtext !== undefined
    ) {
      return { ...arg } as RawMessage;
    }
    if (Array.isArray(arg)) {
      return { rawtext: arg.map((item) => convert(item)) };
    }
    try {
      return { text: JSON.stringify(arg) };
    } catch {
      return { text: "[Object]" };
    }
  };
  const firstArg = args[0];
  if (Array.isArray(firstArg) && "raw" in firstArg) {
    const strings = firstArg as TemplateStringsArray;
    const substitutions = args.slice(1);
    const result: RawMessage[] = [];

    for (let i = 0; i < strings.length; i++) {
      result.push({ text: strings[i] });
      if (i < substitutions.length) {
        result.push(convert(substitutions[i]));
      }
    }
    return { rawtext: result };
  }
  return {
    rawtext: args.map(convert),
  };
}
export function t(t: string): RawMessage {
  return {
    translate: t,
  };
}
