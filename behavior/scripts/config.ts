import { RawMessage } from "@minecraft/server";
import { PlayerLevelRefList } from "./types";

export enum AddonItem {
  RawSpiritStoneOre = "xian:raw_spirit_stone_ore",
  SpiritStoneLevel0 = "xian:spirit_stone_level_0",
  SpiritStoneLevel1 = "xian:spirit_stone_level_1",
  SpiritStoneLevel2 = "xian:spirit_stone_level_2",
  SpiritStoneLevel3 = "xian:spirit_stone_level_3",
  SpiritStoneLevel4 = "xian:spirit_stone_level_4",
  PuTuan = "xian:putuan_place",
}
export enum AddonBlock {
  SpiritStoneOre = "xian:spirit_stone_ore",
}
export const MortalPlayerLevel = [
  // 凡人
  {
    translate: "sapi.playerlevel.level0",
  },
  // 练气
  {
    translate: "sapi.playerlevel.level1",
  },
  // 筑基
  {
    translate: "sapi.playerlevel.level2",
  },
  // 金丹
  {
    translate: "sapi.playerlevel.level3",
  },
  // 元婴
  {
    translate: "sapi.playerlevel.level4",
  },
  // 化神
  {
    translate: "sapi.playerlevel.level5",
  },
  // 练虚
  {
    translate: "sapi.playerlevel.level6",
  },
  // 合体
  {
    translate: "sapi.playerlevel.level7",
  },
  // 大乘
  {
    translate: "sapi.playerlevel.level8",
  },
  // 渡劫
  {
    translate: "sapi.playerlevel.level9",
  },
] as const satisfies RawMessage[];
export const PlayerLevelPhase = [
  // 初期
  {
    translate: "sapi.playerlevel.phase.p0",
  },
  // 中期
  {
    translate: "sapi.playerlevel.phase.p1",
  },
  // 后期
  {
    translate: "sapi.playerlevel.phase.p2",
  },
  // 圆满
  {
    translate: "sapi.playerlevel.phase.p3",
  },
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
