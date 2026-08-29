import type { GongFaEnumType } from "./types";
import {
  damageEntity,
  forwardLocation,
  getNearbyEnemies,
  giveEffect,
} from "./utils";

export const WaterGongFa = {
  // 水行决
  water_breathing: {
    level: 2,
    tr: [2],
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
  // 凌波微步
  ice_step: {
    tr: [2],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "speed", level: 1 }], p: 60 },
      proficient: { effect: [{ id: "speed", level: 2 }], p: 400 },
      master: {
        effect: [
          { id: "speed", level: 3 },
          { id: "jump_boost", level: 1 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "speed", level: 4 },
          { id: "jump_boost", level: 2 },
        ],
        p: 9000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 寒冰护体
  frost_armor: {
    tr: [2],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "resistance", level: 1 }], p: 30 },
      proficient: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "water_breathing", level: 1 },
        ],
        p: 150,
      },
      master: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "water_breathing", level: 1 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "water_breathing", level: 2 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 春雨诀
  rain_heal: {
    tr: [2, 1],
    level: 3,
    proficiency: {
      beginner: { p: 30 },
      proficient: { p: 150 },
      master: { p: 500 },
      world: { p: 6000 },
    },
    use: {
      // 每 10 tick 持续生效：如春雨般缓慢滋养己身
      backend(event) {
        const lvl = event.proficiencyLevel;
        giveEffect(
          event.player,
          "regeneration",
          60,
          Math.max(0, lvl - 2),
        );
      },
      isActiveSkill: false,
    },
  },
  // 激流冲锋
  current_dash: {
    tr: [2],
    level: 3,
    proficiency: {
      beginner: { p: 30 },
      proficient: { p: 150 },
      master: { p: 500 },
      world: { p: 6000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const dist = 4 + event.proficiencyLevel * 2;
        event.player.teleport(forwardLocation(event.player, dist));
        event.player.playSound("mob.dolphin.splash");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 潮汐之力
  tide_power: {
    tr: [2],
    level: 4,
    proficiency: {
      beginner: { effect: [{ id: "strength", level: 1 }], p: 60 },
      proficient: {
        effect: [
          { id: "strength", level: 2 },
          { id: "water_breathing", level: 1 },
        ],
        p: 300,
      },
      master: {
        effect: [
          { id: "strength", level: 3 },
          { id: "water_breathing", level: 2 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "strength", level: 4 },
          { id: "water_breathing", level: 2 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 寒潭真气
  cold_blood: {
    tr: [2],
    level: 4,
    proficiency: {
      beginner: { effect: [{ id: "fire_resistance", level: 1 }], p: 60 },
      proficient: {
        effect: [
          { id: "fire_resistance", level: 1 },
          { id: "resistance", level: 1 },
        ],
        p: 300,
      },
      master: {
        effect: [
          { id: "fire_resistance", level: 2 },
          { id: "resistance", level: 2 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "fire_resistance", level: 2 },
          { id: "resistance", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 玄龟盾
  turtle_shell: {
    tr: [2, 4],
    level: 4,
    proficiency: {
      beginner: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "absorption", level: 1 },
        ],
        p: 60,
      },
      proficient: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 300,
      },
      master: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "absorption", level: 3 },
          { id: "water_breathing", level: 1 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "absorption", level: 4 },
          { id: "water_breathing", level: 1 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 雾隐术
  mist_hide: {
    tr: [2],
    level: 4,
    proficiency: {
      beginner: { p: 60 },
      proficient: { p: 300 },
      master: { p: 800 },
      world: { p: 8000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        giveEffect(event.player, "invisibility", 200 + lvl * 100, 0);
        giveEffect(event.player, "speed", 200 + lvl * 100, 1);
        event.player.playSound("mob.illusioner.mirror_move");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 霜爆术
  frost_nova: {
    tr: [2],
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
        const radius = 4 + lvl * 2;
        for (const target of getNearbyEnemies(event.player, radius)) {
          damageEntity(target, lvl * 2, event.player);
          giveEffect(target, "slowness", 100 + lvl * 20, lvl);
          giveEffect(target, "mining_fatigue", 100, Math.min(lvl, 2), true);
        }
        event.player.dimension.spawnParticle(
          "minecraft:snowball_poof_particle",
          event.player.location,
        );
        event.player.playSound("mob.elder_guardian.curse");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 深海封印
  deep_seal: {
    tr: [2],
    level: 6,
    proficiency: {
      beginner: { p: 300 },
      proficient: { p: 700 },
      master: { p: 1500 },
      world: { p: 9000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        for (const target of getNearbyEnemies(event.player, 6 + lvl)) {
          giveEffect(target, "slowness", 200, lvl, true);
          giveEffect(target, "weakness", 200, lvl);
          giveEffect(target, "blindness", 60, 0);
        }
        event.player.playSound("conduit.attack.target");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 水镜术
  water_mirror: {
    tr: [2],
    level: 6,
    proficiency: {
      beginner: { p: 300 },
      proficient: { p: 700 },
      master: { p: 1500 },
      world: { p: 9000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "playerHurt") return;
        const lvl = event.proficiencyLevel;
        // 受创如水面泛波，凝水为镜护体
        giveEffect(event.player, "absorption", 100, lvl, true);
        giveEffect(event.player, "resistance", 100, Math.min(lvl, 3));
      },
      exec_use_event: ["playerHurt"],
      isActiveSkill: true,
    },
  },
  // 玄冰牢
  frozen_prison: {
    tr: [2],
    level: 7,
    proficiency: {
      beginner: { p: 500 },
      proficient: { p: 1500 },
      master: { p: 4000 },
      world: { p: 20000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "hitEntity") return;
        const target = event.hitEntity?.hitEntity;
        if (!target) return;
        const lvl = event.proficiencyLevel;
        giveEffect(target, "slowness", 100 + lvl * 40, 4, true);
        giveEffect(target, "weakness", 100 + lvl * 40, 2);
        damageEntity(target, lvl + 1, event.player);
        target.dimension.spawnParticle(
          "minecraft:snowball_poof_particle",
          target.location,
        );
      },
      exec_use_event: ["hitEntity"],
      isActiveSkill: true,
    },
  },
  // 海啸诀
  tsunami: {
    tr: [2],
    level: 8,
    proficiency: {
      beginner: { p: 800 },
      proficient: { p: 2500 },
      master: { p: 6000 },
      world: { p: 30000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        const radius = 7 + lvl * 2;
        for (const target of getNearbyEnemies(event.player, radius)) {
          damageEntity(target, lvl * 3, event.player);
          giveEffect(target, "slowness", 200, 3, true);
        }
        event.player.dimension.spawnParticle(
          "minecraft:large_explosion",
          forwardLocation(event.player, 3),
        );
        event.player.playSound("mob.warden.sonic_boom");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
} satisfies Record<string, GongFaEnumType>;
