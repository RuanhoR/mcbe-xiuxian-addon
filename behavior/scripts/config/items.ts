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
  // 丹药 20 色（金黄丹为正常分类，其余 Menu 分类为 none）
  DanYaoZhuhong = "xian:danyao_zhuhong",
  DanYaoOrange = "xian:danyao_orange",
  DanYaoGoldenYellow = "xian:danyao_golden_yellow",
  DanYaoGreen = "xian:danyao_green",
  DanYaoCyan = "xian:danyao_cyan",
  DanYaoBlue = "xian:danyao_blue",
  DanYaoRoyalBlue = "xian:danyao_royal_blue",
  DanYaoPurple = "xian:danyao_purple",
  DanYaoPink = "xian:danyao_pink",
  DanYaoBrown = "xian:danyao_brown",
  DanYaoWhite = "xian:danyao_white",
  DanYaoGray = "xian:danyao_gray",
  DanYaoBlack = "xian:danyao_black",
  DanYaoLightCyan = "xian:danyao_light_cyan",
  DanYaoGrassGreen = "xian:danyao_grass_green",
  DanYaoPeachPink = "xian:danyao_peach_pink",
  DanYaoOchre = "xian:danyao_ochre",
  DanYaoIndigo = "xian:danyao_indigo",
  DanYaoDarkTeal = "xian:danyao_dark_teal",
  DanYaoSilverWhite = "xian:danyao_silver_white",
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
