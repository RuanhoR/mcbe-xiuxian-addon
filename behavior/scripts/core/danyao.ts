import {
  EntityComponentTypes,
  ItemStack,
  Player,
  RawMessage,
} from "@minecraft/server";
import {
  AddonItem,
  DanYaoDef,
  DanYaoDpKeys,
  DANYAO_DEFS,
  MortalPlayerLevel,
} from "../config";
import { rawMessage, t } from "../utils";
import { parseRolledLevel, setRolledLore } from "./gongfa";
import { PlayerLevel } from "./playerLevel";

/**
 * DanYao (丹药 / pill) system.
 *
 * A pill with id {@link AddonItem.DanYao} goes through these states:
 *   1. Unidentified  - empty lore, name is the base "丹药".
 *   2. Rolled        - lore equals `§0<levelRef>§r §6<realmName>§r`, the
 *                      realm is hidden in black while the realm name shows.
 *   3. Identified    - a concrete pill of the rolled realm. Its name is written
 *                      to the lore as a translated raw message, and the realm
 *                      is persisted in dynamic properties.
 *
 * Pills are a food: eating an identified pill grants spirit, and eating a
 * pill of the NEXT realm while at the realm bottleneck breaks through to
 * that realm (spirit clears). Identification is paced by the game loop
 * (see loop.ts), one item per tick, mirroring gongfa.
 */

const DANYAO_INDEX = new Map<string, DanYaoDef>();
const DANYAO_BY_LEVEL = new Map<number, DanYaoDef[]>();
for (const def of DANYAO_DEFS) {
  DANYAO_INDEX.set(def.id, def);
  const bucket = DANYAO_BY_LEVEL.get(def.levelRef) ?? [];
  bucket.push(def);
  DANYAO_BY_LEVEL.set(def.levelRef, bucket);
}

/** Look up a pill definition by its internal id. */
export function getDanYaoDef(id: string): DanYaoDef | undefined {
  return DANYAO_INDEX.get(id);
}

/** Lifecycle states of a pill item. */
export enum DanYaoItemState {
  /** The item is not a pill. */
  Other,
  /** State 1 - unidentified, empty lore. */
  Unidentified,
  /** State 2 - realm rolled, lore hides it. */
  Rolled,
  /** State 3 - identified, a concrete pill. */
  Identified,
}

/** Find the first translate key inside a RawMessage tree. */
function findTranslateKey(
  msg: RawMessage | string | undefined,
): string | undefined {
  if (!msg) return undefined;
  if (typeof msg === "string") return undefined;
  if (msg.translate) return msg.translate;
  if (msg.rawtext) {
    for (const part of msg.rawtext) {
      const key = findTranslateKey(part);
      if (key) return key;
    }
  }
  return undefined;
}

/** Identified pill data carried by an item. */
export interface IdentifiedDanYao {
  id: string;
  levelRef: number;
}

/** Read the identified pill from an item's dynamic properties. */
export function parseIdentifiedDanYao(
  item: ItemStack,
): IdentifiedDanYao | undefined {
  const rawId = item.getDynamicProperty(DanYaoDpKeys.id);
  const def = typeof rawId === "string" ? getDanYaoDef(rawId) : undefined;
  if (!def) return undefined;
  const level = item.getDynamicProperty(DanYaoDpKeys.level);
  return {
    id: def.id,
    levelRef: typeof level === "number" ? level : def.levelRef,
  };
}

/** Detect the current state of a pill item. */
export function getDanYaoItemState(item: ItemStack): DanYaoItemState {
  if (item.typeId !== AddonItem.DanYao) return DanYaoItemState.Other;
  const lore = item.getRawLore();
  if (lore.length === 0) return DanYaoItemState.Unidentified;
  if (parseRolledLevel(lore) !== undefined) return DanYaoItemState.Rolled;
  if (parseIdentifiedDanYao(item) !== undefined)
    return DanYaoItemState.Identified;
  return DanYaoItemState.Unidentified;
}

/** Write the identified lore (name + realm) of a pill item. */
function writeIdentifiedLore(item: ItemStack, def: DanYaoDef): void {
  item.setLore([
    rawMessage`§b${t(def.nameKey)}§r`,
    rawMessage`§7${MortalPlayerLevel[def.levelRef]}§r`,
  ]);
}

/**
 * Turn a state-2 pill into a concrete identified pill (state 2 -> state 3).
 * Mutates the given item (name tag + lore + dynamic properties) and returns
 * the chosen definition.
 */
export function identifyDanYao(
  item: ItemStack,
  levelRef: number,
): DanYaoDef | undefined {
  const pool = DANYAO_BY_LEVEL.get(levelRef);
  if (!pool || pool.length === 0) return undefined;
  const def = pool[Math.floor(Math.random() * pool.length)];
  writeIdentifiedLore(item, def);
  item.setDynamicProperty(DanYaoDpKeys.id, def.id);
  item.setDynamicProperty(DanYaoDpKeys.level, def.levelRef);
  return def;
}

/**
 * Scan a player's inventory and fully identify the first unidentified pill
 * found (both state 1 and state 2 are handled). One item per call, so the
 * game loop can pace the identification nicely.
 */
export function autoIdentifyFirstDanYao(player: Player): {
  found: boolean;
  def?: DanYaoDef;
} {
  const inventory = player.getComponent(EntityComponentTypes.Inventory);
  const container = inventory?.container;
  if (!container) return { found: false };
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item || item.typeId !== AddonItem.DanYao) continue;
    switch (getDanYaoItemState(item)) {
      case DanYaoItemState.Unidentified: {
        const levelRef = rollDanYaoLevel();
        setRolledLore(item, levelRef);
        container.setItem(i, item);
        return { found: true };
      }
      case DanYaoItemState.Rolled: {
        const levelRef = parseRolledLevel(item.getRawLore());
        if (levelRef === undefined) break;
        const def = identifyDanYao(item, levelRef);
        container.setItem(i, item);
        return { found: true, def };
      }
      default:
        break;
    }
  }
  return { found: false };
}

/**
 * Roll a random pill realm (0-9). Each successive realm is 1/5 as likely as
 * the previous one, mirroring gongfa's weighting.
 */
export function rollDanYaoLevel(): number {
  let total = 0;
  for (let levelRef = 0; levelRef <= 9; levelRef++) total += 5 ** -levelRef;
  let r = Math.random() * total;
  for (let levelRef = 0; levelRef <= 9; levelRef++) {
    r -= 5 ** -levelRef;
    if (r <= 0) return levelRef;
  }
  return 9;
}

/**
 * Handle finishing a pill (food eaten). An unidentified / rolled pill just
 * fills hunger. An identified pill grants spirit; if the pill belongs to the
 * NEXT realm and the player is at the realm bottleneck, it breaks through.
 */
export function handleDanYaoCompleteUse(player: Player, item: ItemStack): void {
  if (item.typeId !== AddonItem.DanYao) return;
  const identified = parseIdentifiedDanYao(item);
  if (!identified) return;
  const def = getDanYaoDef(identified.id);
  if (!def) return;

  const level = new PlayerLevel(player);
  const data = level.getLevel();
  const isBreakthroughPill = def.levelRef === data.levelRef + 1;
  const atBottleneck = level.isRealmBottleneck();

  if (isBreakthroughPill && atBottleneck) {
    const next = level.breakthroughRealm();
    if (next) {
      player.sendMessage(
        rawMessage`§e${t("sapi.danyao.breakthrough")}§r ${next.name}`,
      );
    }
    return;
  }

  const layerUps = level.addSpirit(def.spirit);
  player.sendMessage(
    rawMessage`${t("sapi.danyao.eat")} §b${t(def.nameKey)}§r §f+${def.spirit}§r ${t(
      "sapi.danyao.eat.spirit",
    )}`,
  );
  for (const b of layerUps) {
    player.sendMessage(
      rawMessage`§e${t("sapi.playerlevel.breakthrough")}§r ${b.name}`,
    );
  }
}
