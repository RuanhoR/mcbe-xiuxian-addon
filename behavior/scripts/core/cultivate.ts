import { EntityComponentTypes, Player, system } from "@minecraft/server";
import { AddonItem } from "../config";
import { rawMessage, t } from "../utils";
import { PlayerLevel } from "./playerLevel";

/**
 * Cultivation (修炼) loop: while the player sits on the meditation
 * cushion, every interval consumes the lowest-grade spirit stone from
 * their inventory and converts it into spirit (灵力).
 */

/** How many ticks between cultivation steps. */
const CULTIVATE_INTERVAL = 100;

/** Spirit stone tiers (lowest first) and the spirit each one grants. */
const STONE_TIERS = [
  { id: AddonItem.SpiritStoneLevel0, spirit: 10 },
  { id: AddonItem.SpiritStoneLevel1, spirit: 25 },
  { id: AddonItem.SpiritStoneLevel2, spirit: 50 },
  { id: AddonItem.SpiritStoneLevel3, spirit: 100 },
  { id: AddonItem.SpiritStoneLevel4, spirit: 250 },
];

/** playerId -> running interval handle. */
const running = new Map<string, number>();

/** Start the cultivation loop for a player (no-op if already running). */
export function startCultivation(player: Player): void {
  if (running.has(player.id)) return;
  running.set(
    player.id,
    system.runInterval(() => {
      if (player.getDynamicProperty("_bstatus") !== "inPuTuan") {
        stopCultivation(player);
        return;
      }
      cultivateTick(player);
    }, CULTIVATE_INTERVAL),
  );
  player.sendMessage(t("sapi.gongfa.cultivate.start"));
}

/** Stop the cultivation loop for a player. */
export function stopCultivation(player: Player): void {
  const handle = running.get(player.id);
  if (handle === undefined) return;
  system.clearRun(handle);
  running.delete(player.id);
}

/** Perform one cultivation step: consume one spirit stone and gain spirit. */
function cultivateTick(player: Player): void {
  const inventory = player.getComponent(EntityComponentTypes.Inventory);
  const container = inventory?.container;
  if (!container) return;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item) continue;
    const tier = STONE_TIERS.find((entry) => entry.id === item.typeId);
    if (!tier) continue;
    if (item.amount > 1) {
      item.amount -= 1;
      container.setItem(i, item);
    } else {
      container.setItem(i, undefined);
    }
    const level = new PlayerLevel(player);
    const breakthroughs = level.addSpirit(tier.spirit);
    for (const b of breakthroughs) {
      player.sendMessage(
        rawMessage`§e${t("sapi.playerlevel.breakthrough")}§r ${b.name}`,
      );
    }
    const after = new PlayerLevel(player).getLevel();
    player.onScreenDisplay.setActionBar(
      rawMessage`${after.name} §e${after.spirit}§r / ${after.spiritMax}`,
    );
    return;
  }
  player.sendMessage(t("sapi.gongfa.cultivate.nostone"));
  stopCultivation(player);
}
