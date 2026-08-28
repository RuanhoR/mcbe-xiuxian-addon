import {
  Block,
  Direction,
  Entity,
  EntityDamageCause,
  Player,
  world,
} from "@minecraft/server";
import { PlayerLevelRefList } from "../types";
import { PlayerLevelDataType } from "../schemas";

export const GongFaEnum = {
  // 强身健体决 · 练气卷
  greatbody_v1: {
    level: 2,
    proficiency: {
      beginner: {
        effect: [
          {
            id: "regeneration",
            level: 1,
          },
        ],
        p: 10,
      },
      proficient: {
        effect: [
          {
            id: "regeneration",
            level: 2,
          },
          {
            id: "resistance",
            level: 2,
          },
        ],
        p: 60,
      },
      master: {
        effect: [
          {
            id: "regeneration",
            level: 3,
          },
          {
            id: "resistance",
            level: 2,
          },
        ],
        p: 180,
      },
      world: {
        effect: [
          {
            id: "regeneration",
            level: 3,
          },
          {
            id: "resistance",
            level: 3,
          },
        ],
        p: 4000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 金刚不坏决 · 化神卷
  greatbody_v2: {
    level: 6,
    proficiency: {
      beginner: {
        effect: [
          {
            id: "regeneration",
            level: 1,
          },
          {
            id: "resistance",
            level: 2,
          },
        ],
        p: 300,
      },
      proficient: {
        effect: [
          {
            id: "regeneration",
            level: 2,
          },
          {
            id: "resistance",
            level: 3,
          },
        ],
        p: 700,
      },
      master: {
        effect: [
          {
            id: "regeneration",
            level: 3,
          },
          {
            id: "resistance",
            level: 4,
          },
          {
            id: "fire_resistance",
            level: 1,
          },
        ],
        p: 1200,
      },
      world: {
        effect: [
          {
            id: "regeneration",
            level: 4,
          },
          {
            id: "resistance",
            level: 4,
          },
          {
            id: "fire_resistance",
            level: 1,
          },
        ],
        p: 9000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 水行决
  water_breathing: {
    level: 2,
    proficiency: {
      beginner: {
        effect: [
          {
            id: "water_breathing",
            level: 1,
          },
        ],
        p: 60,
      },
      proficient: {
        effect: [{ id: "water_breathing", level: 4 }],
        p: 400,
      },
      master: {
        effect: [
          { id: "conduit_power", level: 4 },
          { id: "water_breathing", level: 5 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "conduit_power", level: 5 },
          { id: "water_breathing", level: 6 },
        ],
        p: 9000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 万灵回复术
  recover_entity_health: {
    level: 4,
    use: {
      useItem: true,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const level = event.proficiencyLevel;
        const entities = event.player.dimension.getEntities({
          maxDistance: level * 3,
          excludeFamilies: ["monster", "inanimate"],
        });
        for (const entity of entities) {
          if (entity.id == event.player.id) continue;
          try {
            entity.addEffect("regeneration", level * 30, {
              amplifier: level,
              showParticles: false,
            });
          } catch (error) {
            console.error(error);
          }
        }
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
    proficiency: {
      beginner: {
        p: 30,
      },
      proficient: {
        p: 200,
      },
      master: {
        p: 1000,
      },
      world: {
        p: 8000,
      },
    },
  },
} satisfies {
  [key: string]: GongFaEnumType;
};
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
    damgingEntity: Entity;
    hurtCause: EntityDamageCause;
    damage: number;
  };
  hitEntity: { hitEntity?: Entity };
  hitBlock: { block: Block; face: Direction };
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
  | "hitBlock"
  | "ItemUse";
export interface GongFaBackendEvent extends GongFaEvent {}
export interface GongFaEnumType {
  level: PlayerLevelRefList;
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
     * On Item use, run onUse event
     */
    useItem?: boolean;
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
export type GongFaType = keyof typeof GongFaEnum;
