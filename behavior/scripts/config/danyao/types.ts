import type { Player, RawMessage } from "@minecraft/server";

/** 丹药 backend 事件：buff 生效期间每 RUN_TICK 调用一次 */
export interface DanYaoBackendEvent {
  player: Player;
  /** 丹药 id（DanYaoEnum 的 key，写入物品 lore） */
  id: string;
  def: DanYaoEnumType;
}

/** 丹药服用事件 */
export interface DanYaoUseEvent extends DanYaoBackendEvent {
  type: "ItemUse";
}

export interface DanYaoUseData {
  /**
   * 灵气消耗（可选）。不足时丹药不生效并提示（不消耗物品）。
   */
  spiritCost?: number;
  /**
   * 服用瞬间的效果
   */
  onUse?: (event: DanYaoUseEvent) => void;
  /**
   * buff 生效期间每 RUN_TICK 调用，持续 buffDuration tick
   */
  backend?: (event: DanYaoBackendEvent) => void;
  /**
   * backend 生效时长（tick）。仅与 backend 搭配使用。
   */
  buffDuration?: number;
}

export interface DanYaoEnumType {
  /** 显示名（rawMessage 构造，lore/UI 使用） */
  name: RawMessage;
  /**
   * 品阶 1~9。玩家境界 lr 超过 品阶 + DANYAO_LEVEL_TOLERANCE 后，
   * 服用无效（如 渡劫期(9) 吃 2 品黄豆丹无效果）。
   */
  level: number;
  /** 外观颜色，对应 DanYaoColorItemMap 中的一个 key */
  color: string;
  /** 服用冷却（tick），不填 = 无冷却 */
  cooldown?: number;
  use: DanYaoUseData;
}
