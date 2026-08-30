import type { Entity, Player, RawMessage } from "@minecraft/server";

/** 阵法 backend 事件：阵法实体存续期间每 RUN_TICK 调用一次 */
export interface ZhenFaBackendEvent {
  /** 阵法实体 */
  entity: Entity;
  /** 阵法 id（ZhenFaEnum 的 key） */
  id: string;
  def: ZhenFaEnumType;
  /** 布阵者（可能已离线，可能为空） */
  owner?: Player;
}

/** 阵法放置事件：轻触方块成功布阵时 */
export interface ZhenFaPlaceEvent extends ZhenFaBackendEvent {
  player: Player;
  /** 阵法中心（方块坐标上表面中心） */
  location: { x: number; y: number; z: number };
}

export interface ZhenFaUseData {
  /**
   * 灵气消耗（布阵瞬间从玩家现存灵力扣除，不足则布阵失败）。
   */
  spiritCost?: number;
  /**
   * 布阵成功瞬间的一次性效果（可选）
   */
  onPlace?: (event: ZhenFaPlaceEvent) => void;
  /**
   * 阵法存续期间每 RUN_TICK 调用（可选）
   */
  backend?: (event: ZhenFaBackendEvent) => void;
}

export interface ZhenFaEnumType {
  /** 显示名（rawMessage 构造） */
  name: RawMessage;
  /**
   * 品阶 = 布阵所需最低境界（lr >= level 才能布阵）。
   */
  level: number;
  /** 存续时长（tick） */
  duration: number;
  /** 影响半径（格） */
  radius: number;
  use: ZhenFaUseData;
}
