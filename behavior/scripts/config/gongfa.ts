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
  /** Localization key of the gongfa name (used in lore / messages). */
  nameKey: string;
  /** Realm level (0-9), matching {@link MortalPlayerLevel} indexes. */
  levelRef: number;
}

function gf(levelRef: number, index: number): GongFaDef {
  return {
    id: `xian:gongfa_l${levelRef}_${index}`,
    nameKey: `sapi.gongfa.l${levelRef}.${index}`,
    levelRef,
  };
}

/**
 * All gongfa in the game, grouped by realm level. Display names live in the
 * language files (`sapi.gongfa.l<level>.<index>`), never in this source.
 */
export const GONGFA_DEFS: GongFaDef[] = [
  // Level 0 - Mortal
  gf(0, 0),
  gf(0, 1),
  gf(0, 2),
  gf(0, 3),
  // Level 1 - Qi Refining
  gf(1, 0),
  gf(1, 1),
  gf(1, 2),
  gf(1, 3),
  // Level 2 - Foundation Establishment
  gf(2, 0),
  gf(2, 1),
  gf(2, 2),
  gf(2, 3),
  // Level 3 - Golden Core
  gf(3, 0),
  gf(3, 1),
  gf(3, 2),
  gf(3, 3),
  // Level 4 - Nascent Soul
  gf(4, 0),
  gf(4, 1),
  gf(4, 2),
  gf(4, 3),
  // Level 5 - Spirit Transformation
  gf(5, 0),
  gf(5, 1),
  gf(5, 2),
  gf(5, 3),
  // Level 6 - Void Refinement
  gf(6, 0),
  gf(6, 1),
  gf(6, 2),
  gf(6, 3),
  // Level 7 - Body Integration
  gf(7, 0),
  gf(7, 1),
  gf(7, 2),
  gf(7, 3),
  // Level 8 - Mahayana
  gf(8, 0),
  gf(8, 1),
  gf(8, 2),
  gf(8, 3),
  // Level 9 - Tribulation Transcendence
  gf(9, 0),
  gf(9, 1),
  gf(9, 2),
  gf(9, 3),
];