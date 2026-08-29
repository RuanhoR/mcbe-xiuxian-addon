import type { GongFaEnumType } from "./types";
import {
  damageEntity,
  forwardLocation,
  getNearbyEnemies,
  giveEffect,
} from "./utils";

export const NeutralGongFa = {
  // 万灵回复术
  recover_entity_health: {
    tr: [1, 2, 4],
    level: 4,
    use: {
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
  // 御风诀
  swift_wind: {
    tr: [5],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "speed", level: 1 }], p: 10 },
      proficient: { effect: [{ id: "speed", level: 2 }], p: 60 },
      master: { effect: [{ id: "speed", level: 3 }], p: 180 },
      world: { effect: [{ id: "speed", level: 4 }], p: 4000 },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 夜视术
  night_eye: {
    tr: [5],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "night_vision", level: 1 }], p: 10 },
      proficient: { effect: [{ id: "night_vision", level: 1 }], p: 60 },
      master: {
        effect: [
          { id: "night_vision", level: 1 },
          { id: "speed", level: 1 },
        ],
        p: 180,
      },
      world: {
        effect: [
          { id: "night_vision", level: 1 },
          { id: "speed", level: 2 },
        ],
        p: 4000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 踏云步
  cloud_step: {
    tr: [5],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "jump_boost", level: 1 }], p: 30 },
      proficient: {
        effect: [
          { id: "jump_boost", level: 2 },
          { id: "slow_falling", level: 1 },
        ],
        p: 150,
      },
      master: {
        effect: [
          { id: "jump_boost", level: 2 },
          { id: "slow_falling", level: 1 },
          { id: "speed", level: 1 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "jump_boost", level: 3 },
          { id: "slow_falling", level: 1 },
          { id: "speed", level: 2 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 羽落术
  feather_fall: {
    tr: [5],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "slow_falling", level: 1 }], p: 30 },
      proficient: {
        effect: [
          { id: "slow_falling", level: 1 },
          { id: "jump_boost", level: 1 },
        ],
        p: 150,
      },
      master: {
        effect: [
          { id: "slow_falling", level: 1 },
          { id: "jump_boost", level: 2 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "slow_falling", level: 1 },
          { id: "jump_boost", level: 2 },
          { id: "speed", level: 1 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 福星诀
  luck_star: {
    tr: [5],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "luck", level: 1 }], p: 30 },
      proficient: { effect: [{ id: "luck", level: 2 }], p: 150 },
      master: {
        effect: [
          { id: "luck", level: 3 },
          { id: "regeneration", level: 1 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "luck", level: 3 },
          { id: "regeneration", level: 2 },
          { id: "hero_of_village", level: 1 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 凝神诀
  deep_focus: {
    tr: [5],
    level: 4,
    proficiency: {
      beginner: { effect: [{ id: "haste", level: 1 }], p: 60 },
      proficient: { effect: [{ id: "haste", level: 2 }], p: 300 },
      master: {
        effect: [
          { id: "haste", level: 3 },
          { id: "night_vision", level: 1 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "haste", level: 3 },
          { id: "night_vision", level: 1 },
          { id: "regeneration", level: 1 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 神速诀
  divine_speed: {
    tr: [5],
    level: 4,
    proficiency: {
      beginner: {
        effect: [
          { id: "speed", level: 2 },
          { id: "haste", level: 1 },
        ],
        p: 60,
      },
      proficient: {
        effect: [
          { id: "speed", level: 3 },
          { id: "haste", level: 1 },
        ],
        p: 300,
      },
      master: {
        effect: [
          { id: "speed", level: 3 },
          { id: "haste", level: 2 },
          { id: "jump_boost", level: 1 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "speed", level: 4 },
          { id: "haste", level: 2 },
          { id: "jump_boost", level: 2 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 护魂诀
  soul_shield: {
    tr: [5],
    level: 4,
    proficiency: {
      beginner: { effect: [{ id: "resistance", level: 1 }], p: 60 },
      proficient: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "absorption", level: 1 },
        ],
        p: 300,
      },
      master: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "absorption", level: 2 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 打坐诀
  meditation: {
    tr: [5],
    level: 3,
    proficiency: {
      beginner: { p: 30 },
      proficient: { p: 150 },
      master: { p: 500 },
      world: { p: 6000 },
    },
    use: {
      // 每 10 tick 生效：吐纳调息，气息绵长
      backend(event) {
        giveEffect(event.player, "regeneration", 80, Math.max(0, event.proficiencyLevel - 2));
      },
      isActiveSkill: false,
    },
  },
  // 月华诀
  moon_grace: {
    tr: [5, 2],
    level: 5,
    proficiency: {
      beginner: {
        effect: [
          { id: "regeneration", level: 1 },
          { id: "night_vision", level: 1 },
        ],
        p: 150,
      },
      proficient: {
        effect: [
          { id: "regeneration", level: 2 },
          { id: "night_vision", level: 1 },
        ],
        p: 500,
      },
      master: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "night_vision", level: 1 },
          { id: "absorption", level: 1 },
        ],
        p: 1200,
      },
      world: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "night_vision", level: 1 },
          { id: "absorption", level: 2 },
        ],
        p: 10000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 铁血意志
  iron_will: {
    tr: [5],
    level: 5,
    proficiency: {
      beginner: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "absorption", level: 2 },
        ],
        p: 150,
      },
      proficient: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 500,
      },
      master: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "absorption", level: 3 },
          { id: "strength", level: 1 },
        ],
        p: 1200,
      },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "absorption", level: 3 },
          { id: "strength", level: 2 },
        ],
        p: 10000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 灵犀诀
  spirit_gift: {
    tr: [5],
    level: 5,
    proficiency: {
      beginner: {
        effect: [
          { id: "luck", level: 1 },
          { id: "regeneration", level: 1 },
        ],
        p: 150,
      },
      proficient: {
        effect: [
          { id: "luck", level: 2 },
          { id: "regeneration", level: 2 },
        ],
        p: 500,
      },
      master: {
        effect: [
          { id: "luck", level: 2 },
          { id: "regeneration", level: 2 },
          { id: "hero_of_village", level: 1 },
        ],
        p: 1200,
      },
      world: {
        effect: [
          { id: "luck", level: 3 },
          { id: "regeneration", level: 3 },
          { id: "hero_of_village", level: 1 },
        ],
        p: 10000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 御空术
  sky_levitation: {
    tr: [5],
    level: 5,
    proficiency: {
      beginner: { p: 150 },
      proficient: { p: 500 },
      master: { p: 1200 },
      world: { p: 10000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        giveEffect(event.player, "levitation", 40 + lvl * 20, 1, true);
        giveEffect(event.player, "slow_falling", 200, 0);
        event.player.playSound("mob.elytra.loop");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 洗髓诀
  cleanse_body: {
    tr: [5],
    level: 6,
    proficiency: {
      beginner: {
        effect: [
          { id: "regeneration", level: 2 },
          { id: "absorption", level: 2 },
        ],
        p: 300,
      },
      proficient: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 700,
      },
      master: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "absorption", level: 3 },
          { id: "resistance", level: 2 },
        ],
        p: 1500,
      },
      world: {
        effect: [
          { id: "regeneration", level: 4 },
          { id: "absorption", level: 4 },
          { id: "resistance", level: 2 },
        ],
        p: 9000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 虚空漫步
  void_walk: {
    tr: [5],
    level: 7,
    proficiency: {
      beginner: { p: 500 },
      proficient: { p: 1500 },
      master: { p: 4000 },
      world: { p: 20000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const dist = 6 + event.proficiencyLevel * 3;
        event.player.teleport(forwardLocation(event.player, dist));
        event.player.dimension.spawnParticle(
          "minecraft:portal",
          event.player.location,
        );
        event.player.playSound("mob.endermen.portal");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 星陨术
  star_fall: {
    tr: [5],
    level: 10,
    proficiency: {
      beginner: { p: 2000 },
      proficient: { p: 6000 },
      master: { p: 15000 },
      world: { p: 60000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        const center = forwardLocation(event.player, 8);
        for (const target of getNearbyEnemies(event.player, 10 + lvl)) {
          giveEffect(target, "slowness", 200, 3, true);
          damageEntity(target, lvl * 5, event.player);
        }
        try {
          event.player.dimension.spawnEntity(
            "minecraft:lightning_bolt",
            center,
          );
        } catch (error) {
          console.error(error);
        }
        event.player.dimension.spawnParticle(
          "minecraft:huge_explosion_emitter",
          center,
        );
        event.player.playSound("mob.warden.sonic_boom");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
} satisfies Record<string, GongFaEnumType>;
