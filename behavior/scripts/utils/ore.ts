import {
  Dimension,
  ItemStack,
  Vector3,
} from "@minecraft/server";
const STACK_LIMIT = 64;
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
