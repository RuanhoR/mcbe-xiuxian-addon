import {
  Block,
  Direction,
  Entity,
  EntityDamageCause,
  Player,
} from "@minecraft/server";
import { PlayerLevelRefList, SpiritualRootType } from "../../types";
import { PlayerLevelDataType } from "../../schemas";

export interface GongFaEvent {
  player: Player;
  playerLevel: PlayerLevelDataType;
  proficiency: number;
  proficiencyLevelName: GongFaProficiency;
  proficiencyLevel: 1 | 2 | 3 | 4;
}
export enum GongFaProficiency {
  beginner = "beginner",
  world = "world",
  proficient = "proficient",
  master = "master",
}
export interface GongFaUseEvent extends GongFaEvent {
  playerHurt?: {
    damgingEntity?: Entity;
    hurtCause: EntityDamageCause;
    damage: number;
    damagingProjectile?: Entity;
  };
  hitEntity?: { hitEntity: Entity };
  interactBlock?: { block: Block; face: Direction };
  type: GongFaExecUseEvent;
}
export interface GongFaProficiencyData {
  /**
   * Give Player Effect
   */
  effect?: { id: string; level: number }[];
  onUnlock?: (event: GongFaEvent) => void;
  unlockMessage?: string;
  p: number;
}
export type GongFaExecUseEvent =
  | "playerHurt"
  | "hitEntity"
  | "interactBlock"
  | "ItemUse";
export interface GongFaBackendEvent extends GongFaEvent {}
export interface GongFaEnumType {
  level: PlayerLevelRefList;
  // 功法属性定义，0 = 金 1 = 木 2 = 水 3 = 火 4= 土 5 = 无，可混合
  tr: SpiritualRootType[];
  proficiency: {
    // 初入
    beginner: GongFaProficiencyData;
    // 精通
    proficient: GongFaProficiencyData;
    // 大师
    master: GongFaProficiencyData;
    // 世界级
    world: GongFaProficiencyData;
  };
  use: {
    /**
     *
     * @param {GongFaUseEvent} event - Event
     * On Player Use, run the fn
     */
    onUse?: (event: GongFaUseEvent) => void;
    /**
     * 灵气消耗（可选）。功法生效（onUse / backend 每次调用）前从玩家
     * 现存灵力中扣除，不足则不生效；主动技能不足时会收到提示。
     * - number：固定消耗
     * - 函数：随熟练度等动态计算
     * 未定义 = 不消耗
     */
    spiritCost?: number | ((event: GongFaBackendEvent) => number);
    /**
     * Called every 10 ticks while this GongFa is active (after player has learned it).
     * Use this for persistent effects like aura damage, passive detection, or resource drain.
     *
     * @param {GongFaBackendEvent} event - Event context containing player, proficiency, and stage info
     * @returns {void}
     */
    backend?: (event: GongFaBackendEvent) => void;
    /**
     * Active Skill
     */
    isActiveSkill: boolean;
    /**
     * Exec Use Event
     */
    exec_use_event?: GongFaExecUseEvent[];
  };
}
