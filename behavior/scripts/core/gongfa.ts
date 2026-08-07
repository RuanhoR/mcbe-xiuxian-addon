import { EntityComponentTypes, ItemStack, Player, RawMessage } from "@minecraft/server";
import {
  AddonItem,
  GONGFA_CULTIVATE_BASE_COST,
  GONGFA_DEFS,
  GONGFA_MASTERY_KEYS,
  GONGFA_MAX_SLOTS,
  GongFaDef,
  GongFaDpKeys,
  GongFaLearnedDpKey,
  GongFaMastery,
  MortalPlayerLevel,
} from "../config";
import { consumeMainhand, rawMessage, setMainhand, t } from "../utils";
import { PlayerLevel } from "./playerLevel";

/**
 * GongFa (cultivation technique) system.
 *
 * An item with id {@link AddonItem.GongFa} goes through these states:
 *   1. Unidentified  - empty lore, level has not been rolled yet.
 *   2. Rolled        - lore equals `§0<levelRef>§r §6<levelName>§r`, the level is
 *                      hidden in black while the realm name is shown in gold.
 *   3. Identified    - a specific gongfa of the rolled level. Its name tag is set
 *                      to the gongfa's name and it carries a mastery
 *                      (入门 / 精通 / 至臻 / 大师).
 *   4. Learned       - bound to a player's skill slot. It can be withdrawn as a
 *                      `xian:gongfa-xidei` item whose lore holds the slot number;
 *                      using that item releases the bound skill.
 *
 * All state data is persisted through dynamic properties (see config.ts).
 */

const GONGFA_INDEX = new Map<string, GongFaDef>();
const GONGFA_BY_LEVEL = new Map<number, GongFaDef[]>();
const GONGFA_BY_NAMEKEY = new Map<string, GongFaDef>();
for (const def of GONGFA_DEFS) {
  GONGFA_INDEX.set(def.id, def);
  GONGFA_BY_NAMEKEY.set(def.nameKey, def);
  const bucket = GONGFA_BY_LEVEL.get(def.levelRef) ?? [];
  bucket.push(def);
  GONGFA_BY_LEVEL.set(def.levelRef, bucket);
}

/** Mastery tiers of an identified / learned gongfa. */
export { GongFaMastery } from "../config";

/** Look up a gongfa definition by its internal id. */
export function getGongFaDef(id: string): GongFaDef | undefined {
  return GONGFA_INDEX.get(id);
}

/**
 * Roll a random gongfa level (0-9). Each successive level is 1/5 as
 * likely as the previous one, e.g. weights are 1, 1/5, 1/25, ...
 */
export function rollGongFaLevel(): number {
  let total = 0;
  for (let levelRef = 0; levelRef <= 9; levelRef++) total += 5 ** -levelRef;
  let r = Math.random() * total;
  for (let levelRef = 0; levelRef <= 9; levelRef++) {
    r -= 5 ** -levelRef;
    if (r <= 0) return levelRef;
  }
  return 9;
}

/** Lifecycle states of a gongfa item. */
export enum GongFaItemState {
  /** The item is not a gongfa. */
  Other,
  /** State 1 - unidentified, empty lore. */
  Unidentified,
  /** State 2 - level rolled, lore hides the level info. */
  Rolled,
  /** State 3 - identified, a concrete gongfa. */
  Identified,
}

/** Flatten a RawMessage (rawtext / text / translate) into a plain string. */
function rawToText(msg: RawMessage | string | undefined): string {
  if (msg === undefined || msg === null) return "";
  if (typeof msg === "string") return msg;
  if (msg.rawtext) return msg.rawtext.map(rawToText).join("");
  if (msg.text !== undefined) return msg.text;
  if (msg.translate !== undefined) return msg.translate;
  return "";
}

/** Find the first translate key inside a RawMessage tree. */
function findTranslateKey(msg: RawMessage | string | undefined): string | undefined {
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

/**
 * Read the rolled level back from the lore of a state-2 gongfa.
 * The lore is built with `rawMessage` and must equal
 * `§0<levelRef>§r §6<levelName>§r`, so we can locate the hidden level.
 */
export function parseRolledLevel(lore: RawMessage[]): number | undefined {
  const line = rawToText(lore[0]);
  const match = /§0(\d+)§r/.exec(line);
  if (!match) return undefined;
  const levelRef = Number(match[1]);
  return levelRef >= 0 && levelRef <= 9 ? levelRef : undefined;
}

/** Set the hidden-level lore of a gongfa item (state 1 -> state 2). */
export function setRolledLore(item: ItemStack, levelRef: number): void {
  const levelName = MortalPlayerLevel[levelRef];
  item.setLore([rawMessage`§0${levelRef}§r §6${levelName}§r`]);
}

/** Identified gongfa data carried by an item. */
export interface IdentifiedGongFa {
  id: string;
  levelRef: number;
  mastery: GongFaMastery;
}

/** Parse the identified gongfa from an item (dynamic properties, with lore fallback). */
export function parseIdentified(item: ItemStack): IdentifiedGongFa | undefined {
  const rawId = item.getDynamicProperty(GongFaDpKeys.id);
  const def = typeof rawId === "string" ? getGongFaDef(rawId) : undefined;
  if (def) {
    const level = item.getDynamicProperty(GongFaDpKeys.level);
    const mastery = item.getDynamicProperty(GongFaDpKeys.mastery);
    return {
      id: def.id,
      levelRef: typeof level === "number" ? level : def.levelRef,
      mastery: typeof mastery === "number" ? mastery : GongFaMastery.Entry,
    };
  }
  return parseIdentifiedFromLore(item.getRawLore());
}

/** Fallback: derive the identified gongfa purely from its lore. */
function parseIdentifiedFromLore(lore: RawMessage[]): IdentifiedGongFa | undefined {
  const nameKey = findTranslateKey(lore[0]);
  if (!nameKey) return undefined;
  const def = GONGFA_BY_NAMEKEY.get(nameKey);
  if (!def) return undefined;
  let mastery = GongFaMastery.Entry;
  const masteryKey = findTranslateKey(lore[1]);
  if (masteryKey) {
    const index = GONGFA_MASTERY_KEYS.indexOf(
      masteryKey as (typeof GONGFA_MASTERY_KEYS)[number],
    );
    if (index >= 0) mastery = index as GongFaMastery;
  }
  return { id: def.id, levelRef: def.levelRef, mastery };
}

/** Write the identified lore (name + mastery) of a gongfa item. */
function writeIdentifiedLore(
  item: ItemStack,
  def: GongFaDef,
  mastery: GongFaMastery,
): void {
  item.setLore([
    rawMessage`§b${t(def.nameKey)}§r`,
    rawMessage`§7[${t(GONGFA_MASTERY_KEYS[mastery])}]§r`,
  ]);
}

/**
 * Turn a state-2 gongfa into a concrete identified gongfa (state 2 -> state 3).
 * Mutates the given item (name tag + lore + dynamic properties) and returns
 * the chosen definition.
 */
export function identifyGongFa(
  item: ItemStack,
  levelRef: number,
): GongFaDef | undefined {
  const pool = GONGFA_BY_LEVEL.get(levelRef);
  if (!pool || pool.length === 0) return undefined;
  const def = pool[Math.floor(Math.random() * pool.length)];
  writeIdentifiedLore(item, def, GongFaMastery.Entry);
  item.setDynamicProperty(GongFaDpKeys.id, def.id);
  item.setDynamicProperty(GongFaDpKeys.level, def.levelRef);
  item.setDynamicProperty(GongFaDpKeys.mastery, GongFaMastery.Entry);
  item.nameTag = def.name;
  return def;
}

/** Detect the current state of a gongfa item. */
export function getGongFaItemState(item: ItemStack): GongFaItemState {
  if (item.typeId !== AddonItem.GongFa) return GongFaItemState.Other;
  const lore = item.getRawLore();
  if (lore.length === 0) return GongFaItemState.Unidentified;
  if (parseRolledLevel(lore) !== undefined) return GongFaItemState.Rolled;
  if (parseIdentified(item) !== undefined) return GongFaItemState.Identified;
  return GongFaItemState.Unidentified;
}

/** A gongfa that a player has learned and bound to a skill slot. */
export interface LearnedGongFa {
  id: string;
  levelRef: number;
  mastery: GongFaMastery;
  slot: number;
}

/** Read the learned gongfa list from the player's dynamic properties. */
function readLearnedList(player: Player): LearnedGongFa[] {
  const raw = player.getDynamicProperty(GongFaLearnedDpKey);
  if (typeof raw !== "string") return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (entry): entry is LearnedGongFa =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as LearnedGongFa).id === "string" &&
        typeof (entry as LearnedGongFa).levelRef === "number" &&
        typeof (entry as LearnedGongFa).mastery === "number" &&
        typeof (entry as LearnedGongFa).slot === "number",
    );
  } catch {
    return [];
  }
}

function writeLearnedList(player: Player, list: LearnedGongFa[]): void {
  player.setDynamicProperty(GongFaLearnedDpKey, JSON.stringify(list));
}

/**
 * Manages the gongfa a player has learned (state 4).
 * Data is persisted on the player as a JSON dynamic property.
 */
export class GongFaLearn {
  private _player: Player;
  private _list: LearnedGongFa[];

  constructor(player: Player) {
    this._player = player;
    this._list = readLearnedList(player);
  }

  /** All learned gongfa, ordered by skill slot. */
  getList(): LearnedGongFa[] {
    return [...this._list].sort((a, b) => a.slot - b.slot);
  }

  /** The learned gongfa bound to a slot, if any. */
  getBySlot(slot: number): LearnedGongFa | undefined {
    return this._list.find((entry) => entry.slot === slot);
  }

  /** The first free skill slot, or undefined if all are occupied. */
  getFreeSlot(): number | undefined {
    for (let slot = 0; slot < GONGFA_MAX_SLOTS; slot++) {
      if (!this.getBySlot(slot)) return slot;
    }
    return undefined;
  }

  /** Whether the player has no free skill slots left. */
  isFull(): boolean {
    return this._list.length >= GONGFA_MAX_SLOTS;
  }

  /** Bind a gongfa definition to the next free slot. */
  learn(def: GongFaDef): LearnedGongFa | undefined {
    if (this.isFull()) return undefined;
    const slot = this.getFreeSlot();
    if (slot === undefined) return undefined;
    const learned: LearnedGongFa = {
      id: def.id,
      levelRef: def.levelRef,
      mastery: GongFaMastery.Entry,
      slot,
    };
    this._list.push(learned);
    writeLearnedList(this._player, this._list);
    return learned;
  }

  /** Learn the identified gongfa carried by an item, if any. */
  learnFromItem(item: ItemStack): LearnedGongFa | undefined {
    const identified = parseIdentified(item);
    if (!identified) return undefined;
    const def = getGongFaDef(identified.id);
    if (!def) return undefined;
    return this.learn(def);
  }

  /**
   * Cultivate a learned gongfa to advance its mastery, spending spirit.
   */
  cultivate(slot: number): {
    status: "success" | "maxed" | "notenough" | "notfound";
    learned?: LearnedGongFa;
    cost?: number;
  } {
    const learned = this.getBySlot(slot);
    if (!learned) return { status: "notfound" };
    if (learned.mastery >= GongFaMastery.Grandmaster) {
      return { status: "maxed" };
    }
    const cost = getCultivateCost(learned.levelRef, learned.mastery);
    const level = new PlayerLevel(this._player);
    const data = level.getLevel();
    if (data.spirit < cost) return { status: "notenough", cost };
    level.updateSpirit(data.spirit - cost);
    learned.mastery = (learned.mastery + 1) as GongFaMastery;
    writeLearnedList(this._player, this._list);
    return { status: "success", learned, cost };
  }

  /**
   * Withdraw a learned gongfa as a `xian:gongfa-xidei` item.
   * The item's lore holds only the skill slot number, and it is bound
   * to the withdrawing player.
   */
  withdraw(slot: number): ItemStack | undefined {
    const learned = this.getBySlot(slot);
    if (!learned) return undefined;
    const item = new ItemStack(AddonItem.GongFaXidei, 1);
    item.setLore([String(slot)]);
    item.setDynamicProperty(GongFaDpKeys.owner, this._player.id);
    item.setDynamicProperty(GongFaDpKeys.slot, slot);
    return item;
  }
}

/** Spirit cost to advance a gongfa's mastery. */
export function getCultivateCost(levelRef: number, mastery: number): number {
  return GONGFA_CULTIVATE_BASE_COST * (mastery + 1) * (levelRef + 1);
}

/**
 * Scan a player's inventory for identified gongfa items.
 * Returns their container indexes together with the item stacks.
 */
export function findIdentifiedGongfaInInventory(
  player: Player,
): Array<{ index: number; item: ItemStack }> {
  const inventory = player.getComponent(EntityComponentTypes.Inventory);
  const container = inventory?.container;
  if (!container) return [];
  const found: Array<{ index: number; item: ItemStack }> = [];
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (
      item &&
      item.typeId === AddonItem.GongFa &&
      getGongFaItemState(item) === GongFaItemState.Identified
    ) {
      found.push({ index: i, item });
    }
  }
  return found;
}

/**
 * Cultivate an identified gongfa item found in the player's inventory.
 * Advances its mastery (stored in dynamic properties) by spending spirit.
 */
export function cultivateGongFaItem(player: Player, index: number): {
  status: "success" | "maxed" | "notenough" | "notfound";
  def?: GongFaDef;
  cost?: number;
  mastery?: GongFaMastery;
} {
  const inventory = player.getComponent(EntityComponentTypes.Inventory);
  const container = inventory?.container;
  if (!container) return { status: "notfound" };
  const item = container.getItem(index);
  if (!item || item.typeId !== AddonItem.GongFa) return { status: "notfound" };
  const identified = parseIdentified(item);
  if (!identified) return { status: "notfound" };
  const def = getGongFaDef(identified.id);
  if (!def) return { status: "notfound" };
  if (identified.mastery >= GongFaMastery.Grandmaster) {
    return { status: "maxed" };
  }
  const cost = getCultivateCost(identified.levelRef, identified.mastery);
  const level = new PlayerLevel(player);
  const data = level.getLevel();
  if (data.spirit < cost) return { status: "notenough", cost };
  level.updateSpirit(data.spirit - cost);
  const mastery = (identified.mastery + 1) as GongFaMastery;
  item.setDynamicProperty(GongFaDpKeys.mastery, mastery);
  writeIdentifiedLore(item, def, mastery);
  container.setItem(index, item);
  return { status: "success", def, cost, mastery };
}

/** Handler that releases a learned gongfa's skill. */
export type GongFaSkillHandler = (player: Player, learned: LearnedGongFa) => void;

const gongFaSkillHandlers = new Map<string, GongFaSkillHandler>();

/** Register a custom skill release handler for a gongfa id. */
export function registerGongFaSkill(
  id: string,
  handler: GongFaSkillHandler,
): void {
  gongFaSkillHandlers.set(id, handler);
}

function defaultSkillHandler(player: Player, learned: LearnedGongFa): void {
  const def = getGongFaDef(learned.id);
  const name = def ? t(def.nameKey) : learned.id;
  player.sendMessage(
    rawMessage`§e${t("sapi.gongfa.release")}§r ${name} §7[${t(
      GONGFA_MASTERY_KEYS[learned.mastery],
    )}]§r`,
  );
  const loc = player.location;
  player.dimension.spawnParticle("minecraft:endrod", {
    x: loc.x,
    y: loc.y + 1.5,
    z: loc.z,
  });
}

/** Release the skill bound to a player's skill slot. Returns whether a skill fired. */
export function releaseGongFaSkill(player: Player, slot: number): boolean {
  const learned = new GongFaLearn(player).getBySlot(slot);
  if (!learned) return false;
  const handler = gongFaSkillHandlers.get(learned.id) ?? defaultSkillHandler;
  handler(player, learned);
  return true;
}

/** Result of automatically identifying one gongfa in a player's inventory. */
export interface AutoIdentifyResult {
  /** Whether an unidentified gongfa was found and processed. */
  found: boolean;
  /** The revealed gongfa, if it was successfully identified. */
  def?: GongFaDef;
}

/**
 * Scan a player's inventory and fully identify the first unidentified
 * gongfa found (both state 1 and state 2 are handled). One item per call,
 * so the game loop can pace the identification nicely.
 */
export function autoIdentifyFirstGongFa(player: Player): AutoIdentifyResult {
  const inventory = player.getComponent(EntityComponentTypes.Inventory);
  const container = inventory?.container;
  if (!container) return { found: false };
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item || item.typeId !== AddonItem.GongFa) continue;
    switch (getGongFaItemState(item)) {
      case GongFaItemState.Unidentified: {
        // State 1 -> state 3: roll the hidden level, then reveal it.
        const def = identifyGongFa(item, rollGongFaLevel());
        container.setItem(i, item);
        return { found: true, def };
      }
      case GongFaItemState.Rolled: {
        // State 2 -> state 3: reveal a concrete gongfa of the rolled level.
        const levelRef = parseRolledLevel(item.getRawLore());
        if (levelRef === undefined) break;
        const def = identifyGongFa(item, levelRef);
        container.setItem(i, item);
        return { found: true, def };
      }
      default:
        break;
    }
  }
  return { found: false };
}

/** Handle using a `xian:sp_gongfa` item (the identification flow). */
export function handleGongFaUse(player: Player, item: ItemStack): void {
  switch (getGongFaItemState(item)) {
    case GongFaItemState.Unidentified: {
      // State 1 -> state 2: roll the hidden level and write its lore.
      const levelRef = rollGongFaLevel();
      setRolledLore(item, levelRef);
      setMainhand(player, item);
      player.sendMessage(
        rawMessage`${t("sapi.gongfa.identify.step1")} ${MortalPlayerLevel[levelRef]}`,
      );
      break;
    }
    case GongFaItemState.Rolled: {
      // State 2 -> state 3: reveal a concrete gongfa of the rolled level.
      const levelRef = parseRolledLevel(item.getRawLore());
      if (levelRef === undefined) break;
      const def = identifyGongFa(item, levelRef);
      setMainhand(player, item);
      if (def) {
        player.sendMessage(
          rawMessage`${t("sapi.gongfa.identify.step2")} ${t(def.nameKey)}`,
        );
      }
      break;
    }
    case GongFaItemState.Identified:
      player.sendMessage(t("sapi.gongfa.identify.done"));
      break;
    default:
      break;
  }
}

/** Handle using a `xian:gongfa-xidei` item (skill release). */
export function handleGongFaXideiUse(player: Player, item: ItemStack): void {
  const owner = item.getDynamicProperty(GongFaDpKeys.owner);
  if (typeof owner !== "string" || owner !== player.id) {
    player.sendMessage(t("sapi.gongfa.xidei.owner"));
    return;
  }
  const slotRaw = item.getDynamicProperty(GongFaDpKeys.slot);
  let slot = typeof slotRaw === "number" ? slotRaw : NaN;
  if (Number.isNaN(slot)) {
    const parsed = Number(item.getLore()[0]);
    slot = Number.isNaN(parsed) ? -1 : parsed;
  }
  if (!releaseGongFaSkill(player, slot)) {
    player.sendMessage(t("sapi.gongfa.xidei.empty"));
    return;
  }
  consumeMainhand(player);
}
