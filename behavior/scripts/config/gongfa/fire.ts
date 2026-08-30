import type { GongFaEnumType } from "./types";
import {
  damageEntity,
  forwardLocation,
  getNearbyEnemies,
  giveEffect,
} from "./utils";

export const FireGongFa = {
  // 避火诀
  fire_immune: {
    tr: [3],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "fire_resistance", level: 1 }], p: 10 },
      proficient: { effect: [{ id: "fire_resistance", level: 2 }], p: 60 },
      master: {
        effect: [
          { id: "fire_resistance", level: 2 },
          { id: "speed", level: 1 },
        ],
        p: 180,
      },
      world: {
        effect: [
          { id: "fire_resistance", level: 3 },
          { id: "speed", level: 1 },
        ],
        p: 4000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 火盾术
  fire_shield: {
    tr: [3],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "fire_resistance", level: 1 }], p: 30 },
      proficient: {
        effect: [
          { id: "fire_resistance", level: 1 },
          { id: "resistance", level: 1 },
        ],
        p: 150,
      },
      master: {
        effect: [
          { id: "fire_resistance", level: 2 },
          { id: "resistance", level: 2 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "fire_resistance", level: 2 },
          { id: "resistance", level: 3 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 踏火行
  fire_step: {
    tr: [3],
    level: 3,
    proficiency: {
      beginner: {
        effect: [
          { id: "speed", level: 1 },
          { id: "fire_resistance", level: 1 },
        ],
        p: 30,
      },
      proficient: {
        effect: [
          { id: "speed", level: 2 },
          { id: "fire_resistance", level: 1 },
        ],
        p: 150,
      },
      master: {
        effect: [
          { id: "speed", level: 3 },
          { id: "fire_resistance", level: 2 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "speed", level: 4 },
          { id: "fire_resistance", level: 2 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 炽炎怒火
  burning_rage: {
    tr: [3],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "strength", level: 1 }], p: 30 },
      proficient: { effect: [{ id: "strength", level: 2 }], p: 150 },
      master: {
        effect: [
          { id: "strength", level: 3 },
          { id: "haste", level: 1 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "strength", level: 4 },
          { id: "haste", level: 1 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 火球术
  fireball_art: {
    tr: [3],
    level: 3,
    proficiency: {
      beginner: { p: 30 },
      proficient: { p: 150 },
      master: { p: 500 },
      world: { p: 6000 },
    },
    use: {
      spiritCost: 50,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        try {
          event.player.dimension.createExplosion(
            forwardLocation(event.player, 5),
            1 + Math.min(lvl, 3),
            {
              breaksBlocks: false,
              causesFire: lvl >= 3,
              source: event.player,
            },
          );
        } catch (error) {
          console.error(error);
        }
        event.player.playSound("mob.blaze.shoot");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 火体诀
  flame_body: {
    tr: [3],
    level: 4,
    proficiency: {
      beginner: {
        effect: [
          { id: "fire_resistance", level: 1 },
          { id: "strength", level: 1 },
        ],
        p: 60,
      },
      proficient: {
        effect: [
          { id: "fire_resistance", level: 2 },
          { id: "strength", level: 2 },
        ],
        p: 300,
      },
      master: {
        effect: [
          { id: "fire_resistance", level: 2 },
          { id: "strength", level: 3 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "fire_resistance", level: 3 },
          { id: "strength", level: 4 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 灼烧之手
  burn_touch: {
    tr: [3],
    level: 4,
    proficiency: {
      beginner: { p: 60 },
      proficient: { p: 300 },
      master: { p: 800 },
      world: { p: 8000 },
    },
    use: {
      spiritCost: 80,
      onUse(event) {
        if (event.type !== "hitEntity") return;
        const target = event.hitEntity?.hitEntity;
        if (!target) return;
        try {
          target.setOnFire(3 + event.proficiencyLevel * 2, true);
        } catch (error) {
          console.error(error);
        }
      },
      exec_use_event: ["hitEntity"],
      isActiveSkill: true,
    },
  },
  // 烈焰疾行
  flame_dash: {
    tr: [3],
    level: 4,
    proficiency: {
      beginner: { p: 60 },
      proficient: { p: 300 },
      master: { p: 800 },
      world: { p: 8000 },
    },
    use: {
      spiritCost: 100,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        giveEffect(event.player, "speed", 200, lvl, true);
        giveEffect(event.player, "fire_resistance", 200, 1);
        event.player.playSound("mob.ghast.fireball");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 熔岩皮肤
  magma_skin: {
    tr: [3, 4],
    level: 5,
    proficiency: {
      beginner: {
        effect: [
          { id: "fire_resistance", level: 1 },
          { id: "resistance", level: 2 },
        ],
        p: 150,
      },
      proficient: {
        effect: [
          { id: "fire_resistance", level: 2 },
          { id: "resistance", level: 2 },
        ],
        p: 500,
      },
      master: {
        effect: [
          { id: "fire_resistance", level: 2 },
          { id: "resistance", level: 3 },
          { id: "strength", level: 1 },
        ],
        p: 1200,
      },
      world: {
        effect: [
          { id: "fire_resistance", level: 3 },
          { id: "resistance", level: 4 },
          { id: "strength", level: 1 },
        ],
        p: 10000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 灼热领域
  heat_aura: {
    tr: [3],
    level: 6,
    proficiency: {
      beginner: { p: 300 },
      proficient: { p: 700 },
      master: { p: 1500 },
      world: { p: 9000 },
    },
    use: {
      spiritCost: 30,
      // 每 10 tick 生效：周身热浪灼烧近敌
      backend(event) {
        const lvl = event.proficiencyLevel;
        if (lvl < 2) return;
        for (const target of getNearbyEnemies(event.player, 3 + lvl)) {
          damageEntity(target, 1, event.player);
          try {
            target.setOnFire(2, false);
          } catch (error) {
            console.error(error);
          }
        }
      },
      isActiveSkill: false,
    },
  },
  // 爆裂术
  explosion_art: {
    tr: [3],
    level: 6,
    proficiency: {
      beginner: { p: 300 },
      proficient: { p: 700 },
      master: { p: 1500 },
      world: { p: 9000 },
    },
    use: {
      spiritCost: 600,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        try {
          event.player.dimension.createExplosion(
            forwardLocation(event.player, 6),
            2 + Math.min(lvl, 4),
            {
              breaksBlocks: false,
              causesFire: true,
              source: event.player,
            },
          );
        } catch (error) {
          console.error(error);
        }
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 烈阳真火
  sun_flame: {
    tr: [3],
    level: 7,
    proficiency: {
      beginner: {
        effect: [
          { id: "strength", level: 2 },
          { id: "fire_resistance", level: 2 },
        ],
        p: 500,
      },
      proficient: {
        effect: [
          { id: "strength", level: 3 },
          { id: "fire_resistance", level: 2 },
        ],
        p: 1500,
      },
      master: {
        effect: [
          { id: "strength", level: 4 },
          { id: "fire_resistance", level: 3 },
          { id: "haste", level: 2 },
        ],
        p: 4000,
      },
      world: {
        effect: [
          { id: "strength", level: 5 },
          { id: "fire_resistance", level: 3 },
          { id: "haste", level: 3 },
        ],
        p: 20000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 凤凰涅槃
  phoenix_rebirth: {
    tr: [3],
    level: 8,
    proficiency: {
      beginner: {
        effect: [
          { id: "regeneration", level: 2 },
          { id: "fire_resistance", level: 2 },
        ],
        p: 800,
      },
      proficient: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "fire_resistance", level: 2 },
          { id: "absorption", level: 2 },
        ],
        p: 2500,
      },
      master: {
        effect: [
          { id: "regeneration", level: 4 },
          { id: "fire_resistance", level: 3 },
          { id: "absorption", level: 3 },
        ],
        p: 6000,
      },
      world: {
        effect: [
          { id: "regeneration", level: 5 },
          { id: "fire_resistance", level: 3 },
          { id: "absorption", level: 4 },
          { id: "resistance", level: 2 },
        ],
        p: 30000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 炎狱柱
  inferno_pillar: {
    tr: [3],
    level: 9,
    proficiency: {
      beginner: { p: 1000 },
      proficient: { p: 3000 },
      master: { p: 8000 },
      world: { p: 40000 },
    },
    use: {
      spiritCost: 25000,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        const center = forwardLocation(event.player, 6);
        for (const target of getNearbyEnemies(event.player, 6 + lvl)) {
          damageEntity(target, lvl * 3, event.player);
          try {
            target.setOnFire(5 + lvl, true);
          } catch (error) {
            console.error(error);
          }
        }
        try {
          event.player.dimension.createExplosion(center, 3, {
            breaksBlocks: false,
            causesFire: true,
            source: event.player,
          });
        } catch (error) {
          console.error(error);
        }
        event.player.dimension.spawnParticle(
          "minecraft:huge_explosion_emitter",
          center,
        );
        event.player.playSound("mob.blaze.breath");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
} satisfies Record<string, GongFaEnumType>;
