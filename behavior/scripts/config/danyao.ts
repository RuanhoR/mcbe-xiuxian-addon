import type { DanYaoEnumType } from "./danyao/types";
import { LevelCore } from "../core/levelCore";
import { rawMessage } from "../utils/message";

/**
 * 丹药颜色 → 外观物品 id 的映射。
 * 20 色丹药物品只是"皮肤"，丹药定义以内部映射表的 key 为准，
 * 通过物品 lore 中的 `danyao:<id>` 标记还原定义。
 */
export const DanYaoColorItemMap = {
  zhuhong: "xian:danyao_zhuhong",
  orange: "xian:danyao_orange",
  golden_yellow: "xian:danyao_golden_yellow",
  green: "xian:danyao_green",
  cyan: "xian:danyao_cyan",
  blue: "xian:danyao_blue",
  royal_blue: "xian:danyao_royal_blue",
  purple: "xian:danyao_purple",
  pink: "xian:danyao_pink",
  brown: "xian:danyao_brown",
  white: "xian:danyao_white",
  gray: "xian:danyao_gray",
  black: "xian:danyao_black",
  light_cyan: "xian:danyao_light_cyan",
  grass_green: "xian:danyao_grass_green",
  peach_pink: "xian:danyao_peach_pink",
  ochre: "xian:danyao_ochre",
  indigo: "xian:danyao_indigo",
  dark_teal: "xian:danyao_dark_teal",
  silver_white: "xian:danyao_silver_white",
} as const;

export type DanYaoColor = keyof typeof DanYaoColorItemMap;

/**
 * 丹药注册表：key 即丹药 id（写入 lore），定义品阶/颜色/onUse/backend。
 */
export const DanYaoEnum = {
  // 回气丹：低阶通用恢复
  huiqi_dan: {
    name: rawMessage`回气丹`,
    level: 1,
    color: "gray",
    cooldown: 1200,
    use: {
      onUse(event) {
        event.player.addEffect("regeneration", 600, {
          amplifier: 1,
          showParticles: false,
        });
      },
    },
  },
  // 筋骨丹：短时强化肉身
  jingu_dan: {
    name: rawMessage`筋骨丹`,
    level: 1,
    color: "brown",
    cooldown: 1800,
    use: {
      spiritCost: 20,
      onUse(event) {
        event.player.addEffect("strength", 600, {
          amplifier: 0,
          showParticles: false,
        });
        event.player.addEffect("resistance", 600, {
          amplifier: 0,
          showParticles: false,
        });
      },
    },
  },
  // 燕血丹：爆发身法，带持续回血 backend
  yanxue_dan: {
    name: rawMessage`燕血丹`,
    level: 2,
    color: "zhuhong",
    cooldown: 3600,
    use: {
      spiritCost: 60,
      onUse(event) {
        event.player.addEffect("speed", 600, {
          amplifier: 2,
          showParticles: false,
        });
        event.player.addEffect("haste", 600, {
          amplifier: 1,
          showParticles: false,
        });
      },
      backend(event) {
        event.player.addEffect("regeneration", 60, {
          amplifier: 0,
          showParticles: false,
        });
      },
      buffDuration: 300,
    },
  },
  // 黄龙丹：瞬间灌注大量灵气（突破常用），超出上限部分溢出
  huanglong_dan: {
    name: rawMessage`黄龙丹`,
    level: 2,
    color: "golden_yellow",
    cooldown: 600,
    use: {
      onUse(event) {
        LevelCore.addSpirit(event.player, 500);
      },
    },
  },
  // 洗髓丹：重 roll 灵根并清除身上效果
  xisui_dan: {
    name: rawMessage`洗髓丹`,
    level: 4,
    color: "silver_white",
    cooldown: 12000,
    use: {
      spiritCost: 500,
      onUse(event) {
        const roots = LevelCore.rerollSpiritualRoot(event.player);
        for (const effect of event.player.getEffects()) {
          try {
            event.player.removeEffect(effect.typeId);
          } catch (error) {
            console.error(error);
          }
        }
        event.player.onScreenDisplay.setActionBar(
          rawMessage`§b洗髓完成，灵根已重塑（共 ${roots.length} 属性）`,
        );
      },
    },
  },
  // 破境丹：突破辅助，长时护体 backend
  pojing_dan: {
    name: rawMessage`破境丹`,
    level: 5,
    color: "purple",
    cooldown: 7200,
    use: {
      spiritCost: 200,
      onUse(event) {
        event.player.addEffect("absorption", 1200, {
          amplifier: 2,
          showParticles: false,
        });
      },
      backend(event) {
        event.player.addEffect("resistance", 60, {
          amplifier: 1,
          showParticles: false,
        });
      },
      buffDuration: 600,
    },
  },
} satisfies Record<string, DanYaoEnumType>;

export type DanYaoType = keyof typeof DanYaoEnum;
