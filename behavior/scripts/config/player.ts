import type { RawMessage } from "@minecraft/server";
import type { PlayerLevelRefList } from "../types";
import { t } from "../utils/message";
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
