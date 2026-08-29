import type { GongFaEnumType } from "./types";
import {
  damageEntity,
  getNearbyEnemies,
  giveEffect,
} from "./utils";

export const EarthGongFa = {
  // 大地之盾
  earth_shield: {
    tr: [4],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "resistance", level: 1 }], p: 10 },
      proficient: { effect: [{ id: "resistance", level: 2 }], p: 60 },
      master: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "absorption", level: 1 },
        ],
        p: 180,
      },
      world: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 4000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 厚重体魄
  heavy_body: {
    tr: [4],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "resistance", level: 1 }], p: 30 },
      proficient: { effect: [{ id: "resistance", level: 2 }], p: 150 },
      master: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "health_boost", level: 1 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "health_boost", level: 2 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 厚土回元
  terra_heal: {
    tr: [4],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "regeneration", level: 1 }], p: 30 },
      proficient: {
        effect: [
          { id: "regeneration", level: 2 },
          { id: "resistance", level: 1 },
        ],
        p: 150,
      },
      master: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "resistance", level: 1 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "resistance", level: 2 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 震地步
  quake_step: {
    tr: [4],
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
        for (const target of getNearbyEnemies(event.player, 4 + lvl)) {
          damageEntity(target, lvl * 2, event.player);
          giveEffect(target, "slowness", 80, lvl, true);
        }
        event.player.dimension.spawnParticle(
          "minecraft:camera_shoot_explosion",
          event.player.location,
        );
        event.player.playSound("random.explode");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 地刺术
  earth_spike: {
    tr: [4],
    level: 4,
    proficiency: {
      beginner: { p: 60 },
      proficient: { p: 300 },
      master: { p: 800 },
      world: { p: 8000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "hitEntity") return;
        const target = event.hitEntity?.hitEntity;
        if (!target) return;
        const lvl = event.proficiencyLevel;
        damageEntity(target, lvl * 2, event.player);
        giveEffect(target, "mining_fatigue", 80, Math.min(lvl, 2), true);
      },
      exec_use_event: ["hitEntity"],
      isActiveSkill: true,
    },
  },
  // 流沙障
  sand_veil: {
    tr: [4],
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
        for (const target of getNearbyEnemies(event.player, 5 + lvl)) {
          giveEffect(target, "blindness", 80 + lvl * 20, 0, true);
        }
        event.player.playSound("dig.sand");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 尘沙护体
  dust_ward: {
    tr: [4],
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
          { id: "resistance", level: 2 },
          { id: "absorption", level: 2 },
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
          { id: "absorption", level: 3 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 地牢术
  earth_prison: {
    tr: [4],
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
        for (const target of getNearbyEnemies(event.player, 5 + lvl)) {
          giveEffect(target, "slowness", 200, 3, true);
          giveEffect(target, "weakness", 200, lvl);
        }
        event.player.playSound("dig.stone");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 山岳之魂
  mountain_soul: {
    tr: [4],
    level: 5,
    proficiency: {
      beginner: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "health_boost", level: 2 },
        ],
        p: 150,
      },
      proficient: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "health_boost", level: 2 },
        ],
        p: 500,
      },
      master: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "health_boost", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 1200,
      },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "health_boost", level: 4 },
          { id: "absorption", level: 2 },
        ],
        p: 10000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 震脉波
  tremor_pulse: {
    tr: [4],
    level: 5,
    proficiency: {
      beginner: { p: 150 },
      proficient: { p: 500 },
      master: { p: 1200 },
      world: { p: 10000 },
    },
    use: {
      // 每 10 tick 生效：大地脉动削弱周身之敌
      backend(event) {
        const lvl = event.proficiencyLevel;
        if (lvl < 2) return;
        for (const target of getNearbyEnemies(event.player, 3 + lvl)) {
          giveEffect(target, "weakness", 60, Math.min(lvl, 2));
        }
      },
      isActiveSkill: false,
    },
  },
  // 负山诀
  mountain_carry: {
    tr: [4],
    level: 6,
    proficiency: {
      beginner: {
        effect: [
          { id: "strength", level: 2 },
          { id: "resistance", level: 2 },
        ],
        p: 300,
      },
      proficient: {
        effect: [
          { id: "strength", level: 3 },
          { id: "resistance", level: 3 },
        ],
        p: 700,
      },
      master: {
        effect: [
          { id: "strength", level: 4 },
          { id: "resistance", level: 3 },
          { id: "haste", level: 1 },
        ],
        p: 1500,
      },
      world: {
        effect: [
          { id: "strength", level: 4 },
          { id: "resistance", level: 4 },
          { id: "haste", level: 2 },
        ],
        p: 9000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 风沙术
  sandstorm: {
    tr: [4],
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
        const radius = 6 + lvl;
        for (const target of getNearbyEnemies(event.player, radius)) {
          damageEntity(target, lvl, event.player);
          giveEffect(target, "blindness", 100, 0, true);
          giveEffect(target, "slowness", 100, 2);
        }
        event.player.playSound("mob.phantom.flap");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 大地巨人
  giant_form: {
    tr: [4],
    level: 7,
    proficiency: {
      beginner: {
        effect: [
          { id: "health_boost", level: 3 },
          { id: "strength", level: 2 },
        ],
        p: 500,
      },
      proficient: {
        effect: [
          { id: "health_boost", level: 4 },
          { id: "strength", level: 3 },
        ],
        p: 1500,
      },
      master: {
        effect: [
          { id: "health_boost", level: 4 },
          { id: "strength", level: 4 },
          { id: "resistance", level: 2 },
        ],
        p: 4000,
      },
      world: {
        effect: [
          { id: "health_boost", level: 5 },
          { id: "strength", level: 5 },
          { id: "resistance", level: 3 },
        ],
        p: 20000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 地心之力
  core_earth: {
    tr: [4],
    level: 8,
    proficiency: {
      beginner: {
        effect: [
          { id: "strength", level: 3 },
          { id: "resistance", level: 3 },
        ],
        p: 800,
      },
      proficient: {
        effect: [
          { id: "strength", level: 4 },
          { id: "resistance", level: 3 },
          { id: "health_boost", level: 2 },
        ],
        p: 2500,
      },
      master: {
        effect: [
          { id: "strength", level: 4 },
          { id: "resistance", level: 4 },
          { id: "health_boost", level: 3 },
        ],
        p: 6000,
      },
      world: {
        effect: [
          { id: "strength", level: 5 },
          { id: "resistance", level: 4 },
          { id: "health_boost", level: 4 },
          { id: "absorption", level: 3 },
        ],
        p: 30000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
} satisfies Record<string, GongFaEnumType>;
