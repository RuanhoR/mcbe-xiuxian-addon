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
  DanYao = "xian:sp_danyao",
  ZhenPan = "xian:sp_zhen_pan",
}
export enum AddonBlock {
  SpiritStoneOre = "xian:spirit_stone_ore",
}
export const SpiritStoneLevelMap = {
  [AddonItem.SpiritStoneLevel0]: 0,
  [AddonItem.SpiritStoneLevel1]: 1,
  [AddonItem.SpiritStoneLevel2]: 2,
  [AddonItem.SpiritStoneLevel3]: 3,
  [AddonItem.SpiritStoneLevel4]: 4,
} as const;

/** Spirit stone tiers (lowest first) and the spirit each one grants. */
export const SPIRIT_STONE_TIERS = [
  { id: AddonItem.SpiritStoneLevel0, spirit: 10 },
  { id: AddonItem.SpiritStoneLevel1, spirit: 25 },
  { id: AddonItem.SpiritStoneLevel2, spirit: 50 },
  { id: AddonItem.SpiritStoneLevel3, spirit: 100 },
  { id: AddonItem.SpiritStoneLevel4, spirit: 250 },
] as const;
