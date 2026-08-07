import type { RawMessage } from "@minecraft/server";
import { PlayerLevelRefList } from "./types";
function t(t: string): RawMessage {
  return {
    translate: t,
  };
}
export enum AddonItem {
  RawSpiritStoneOre = "xian:raw_spirit_stone_ore",
  SpiritStoneLevel0 = "xian:spirit_stone_level_0",
  SpiritStoneLevel1 = "xian:spirit_stone_level_1",
  SpiritStoneLevel2 = "xian:spirit_stone_level_2",
  SpiritStoneLevel3 = "xian:spirit_stone_level_3",
  SpiritStoneLevel4 = "xian:spirit_stone_level_4",
  PuTuan = "xian:putuan_place",
  GongFa = "xian:sp_gongfa",
  GongFaXidei = "xian:gongfa-xidei",
  ZhenPan = "xian:sp_zhen_pan",
}
export enum AddonBlock {
  SpiritStoneOre = "xian:spirit_stone_ore",
}
export const MortalPlayerLevel = [
  // 凡人
  t("sapi.playerlevel.level0"),
  // 练气
  t("sapi.playerlevel.level1"),
  // 筑基
  t("sapi.playerlevel.level2"),
  // 金丹
  t("sapi.playerlevel.level3"),
  // 元婴
  t("sapi.playerlevel.level4"),
  // 化神
  t("sapi.playerlevel.level5"),
  // 练虚
  t("sapi.playerlevel.level6"),
  // 合体
  t("sapi.playerlevel.level7"),
  // 大乘
  t("sapi.playerlevel.level8"),
  // 渡劫
  t("sapi.playerlevel.level9"),
] as const satisfies RawMessage[];
export const PlayerLevelPhase = [
  // 初期
  t("sapi.playerlevel.phase.p0"),
  // 中期
  t("sapi.playerlevel.phase.p1"),
  // 后期
  t("sapi.playerlevel.phase.p2"),
  // 圆满
  t("sapi.playerlevel.phase.p3"),
] as const satisfies RawMessage[];
export const levelMaxLayer = {
  1: 1,
  2: 13,
  3: 9,
  4: 9,
  5: 9,
  6: 9,
  7: 9,
  8: 9,
  9: 9,
  10: 20,
} satisfies {
  [key in `${PlayerLevelRefList}`]: number;
};
export const SpiritStoneLevelMap = {
  [AddonItem.SpiritStoneLevel0]: 0,
  [AddonItem.SpiritStoneLevel1]: 1,
  [AddonItem.SpiritStoneLevel2]: 2,
  [AddonItem.SpiritStoneLevel3]: 3,
  [AddonItem.SpiritStoneLevel4]: 4,
} as const;

// ===== GongFa (功法) config =====

/** How many skill slots a player can bind learned gongfa to. */
export const GONGFA_MAX_SLOTS = 4;

/** Localization keys for the four mastery tiers. */
export const GONGFA_MASTERY_KEYS = [
  "sapi.gongfa.mastery.0", // 入门 / Entry
  "sapi.gongfa.mastery.1", // 精通 / Proficient
  "sapi.gongfa.mastery.2", // 至臻 / Supreme
  "sapi.gongfa.mastery.3", // 大师 / Grandmaster
] as const;

/** Mastery tiers of an identified / learned gongfa. */
export enum GongFaMastery {
  /** 入门 / Entry */
  Entry = 0,
  /** 精通 / Proficient */
  Proficient = 1,
  /** 至臻 / Supreme */
  Supreme = 2,
  /** 大师 / Grandmaster */
  Grandmaster = 3,
}

/** Base spirit cost of cultivating a gongfa mastery. */
export const GONGFA_CULTIVATE_BASE_COST = 100;

/**
 * Item dynamic property keys for gongfa data (id / level / mastery /
 * binding). All gongfa state is persisted through these.
 */
export const GongFaDpKeys = {
  id: "_gf_id",
  level: "_gf_level",
  mastery: "_gf_mastery",
  owner: "_gf_owner",
  slot: "_gf_slot",
} as const;

/** Player dynamic property key that stores the learned gongfa list. */
export const GongFaLearnedDpKey = "_gongfa_learned";

/** Static definition of one gongfa. */
export interface GongFaDef {
  /** Unique internal identifier, e.g. "xian:gongfa_l1_0". */
  id: string;
  /** Literal display name (shown as the item's name tag). */
  name: string;
  /** Localization key of the gongfa name (used in lore / messages). */
  nameKey: string;
  /** Realm level (0-9), matching {@link MortalPlayerLevel} indexes. */
  levelRef: number;
}

function gf(levelRef: number, index: number, name: string): GongFaDef {
  return {
    id: `xian:gongfa_l${levelRef}_${index}`,
    name,
    nameKey: `sapi.gongfa.l${levelRef}.${index}`,
    levelRef,
  };
}

/** All gongfa in the game, grouped by realm level. */
export const GONGFA_DEFS: GongFaDef[] = [
  // Level 0 - Mortal
  gf(0, 0, "强身诀"),
  gf(0, 1, "吐纳术"),
  gf(0, 2, "养气功"),
  gf(0, 3, "基础拳法"),
  // Level 1 - Qi Refining
  gf(1, 0, "御风诀"),
  gf(1, 1, "清心诀"),
  gf(1, 2, "聚灵术"),
  gf(1, 3, "火球术"),
  // Level 2 - Foundation Establishment
  gf(2, 0, "御剑术"),
  gf(2, 1, "金刚体"),
  gf(2, 2, "水灵诀"),
  gf(2, 3, "雷音掌"),
  // Level 3 - Golden Core
  gf(3, 0, "天雷诀"),
  gf(3, 1, "玄冰掌"),
  gf(3, 2, "五行遁"),
  gf(3, 3, "金光罩"),
  // Level 4 - Nascent Soul
  gf(4, 0, "太虚剑法"),
  gf(4, 1, "离火诀"),
  gf(4, 2, "神游术"),
  gf(4, 3, "玄武盾"),
  // Level 5 - Spirit Transformation
  gf(5, 0, "混元功"),
  gf(5, 1, "紫霄神雷"),
  gf(5, 2, "天眼通"),
  gf(5, 3, "缩地成寸"),
  // Level 6 - Void Refinement
  gf(6, 0, "大衍神诀"),
  gf(6, 1, "万剑归宗"),
  gf(6, 2, "阴阳逆转"),
  gf(6, 3, "太清仙光"),
  // Level 7 - Body Integration
  gf(7, 0, "混沌归元"),
  gf(7, 1, "不朽金身"),
  gf(7, 2, "星辰陨落"),
  gf(7, 3, "沧海桑田"),
  // Level 8 - Mahayana
  gf(8, 0, "大道之音"),
  gf(8, 1, "开天斧法"),
  gf(8, 2, "无尽轮回"),
  gf(8, 3, "宇宙洪荒"),
  // Level 9 - Tribulation Transcendence
  gf(9, 0, "证道仙法"),
  gf(9, 1, "鸿蒙紫气"),
  gf(9, 2, "逆天改命"),
  gf(9, 3, "超脱轮回"),
];

// ===== Cultivation (修炼) config =====

/** How many ticks between cultivation steps while sitting on the cushion. */
export const CULTIVATE_INTERVAL = 100;

/** Spirit stone tiers (lowest first) and the spirit each one grants. */
export const SPIRIT_STONE_TIERS = [
  { id: AddonItem.SpiritStoneLevel0, spirit: 10 },
  { id: AddonItem.SpiritStoneLevel1, spirit: 25 },
  { id: AddonItem.SpiritStoneLevel2, spirit: 50 },
  { id: AddonItem.SpiritStoneLevel3, spirit: 100 },
  { id: AddonItem.SpiritStoneLevel4, spirit: 250 },
] as const;

// ===== Loop config =====

/** How often (in ticks) the loop scans players' inventories for unidentified gongfa. */
export const AUTO_IDENTIFY_INTERVAL = 40;
