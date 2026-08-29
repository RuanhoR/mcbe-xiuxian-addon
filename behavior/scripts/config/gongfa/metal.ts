import type { GongFaEnumType } from "./types";
import {
  damageEntity,
  forwardLocation,
  getNearbyEnemies,
  giveEffect,
} from "./utils";

export const MetalGongFa = {
  // 锐金锋芒
  sharp_edge: {
    tr: [0],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "strength", level: 1 }], p: 10 },
      proficient: { effect: [{ id: "strength", level: 2 }], p: 60 },
      master: { effect: [{ id: "strength", level: 3 }], p: 180 },
      world: { effect: [{ id: "strength", level: 4 }], p: 4000 },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 金瞳术
  pierce_sight: {
    tr: [0],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "night_vision", level: 1 }], p: 10 },
      proficient: {
        effect: [
          { id: "night_vision", level: 1 },
          { id: "haste", level: 1 },
        ],
        p: 60,
      },
      master: {
        effect: [
          { id: "night_vision", level: 1 },
          { id: "haste", level: 2 },
        ],
        p: 180,
      },
      world: {
        effect: [
          { id: "night_vision", level: 1 },
          { id: "haste", level: 3 },
        ],
        p: 4000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 炼金诀
  refine_gold: {
    tr: [0],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "haste", level: 1 }], p: 30 },
      proficient: { effect: [{ id: "haste", level: 2 }], p: 150 },
      master: {
        effect: [
          { id: "haste", level: 3 },
          { id: "strength", level: 1 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "haste", level: 4 },
          { id: "strength", level: 2 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 金钟罩
  golden_bell: {
    tr: [0],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "resistance", level: 1 }], p: 30 },
      proficient: { effect: [{ id: "resistance", level: 2 }], p: 150 },
      master: { effect: [{ id: "resistance", level: 3 }], p: 500 },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "absorption", level: 2 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 剑气纵横
  sword_qi: {
    tr: [0],
    level: 3,
    proficiency: {
      beginner: { p: 30 },
      proficient: { p: 150 },
      master: { p: 500 },
      world: { p: 6000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "hitEntity") return;
        const target = event.hitEntity?.hitEntity;
        if (!target) return;
        // 剑气随击而出，伤敌于无形
        damageEntity(target, event.proficiencyLevel * 2, event.player);
        event.player.dimension.spawnParticle(
          "minecraft:critical_hit_emitter",
          target.location,
        );
      },
      exec_use_event: ["hitEntity"],
      isActiveSkill: true,
    },
  },
  // 金石之击
  metal_pierce: {
    tr: [0, 4],
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
        damageEntity(target, lvl * 3, event.player);
        giveEffect(target, "weakness", 80, lvl, true);
      },
      exec_use_event: ["hitEntity"],
      isActiveSkill: true,
    },
  },
  // 金身诀
  metallic_body: {
    tr: [0],
    level: 5,
    proficiency: {
      beginner: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "absorption", level: 1 },
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
          { id: "absorption", level: 4 },
          { id: "strength", level: 2 },
        ],
        p: 10000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 庚金诀
  geng_metal: {
    tr: [0],
    level: 5,
    proficiency: {
      beginner: {
        effect: [
          { id: "strength", level: 2 },
          { id: "haste", level: 2 },
        ],
        p: 150,
      },
      proficient: {
        effect: [
          { id: "strength", level: 3 },
          { id: "haste", level: 2 },
        ],
        p: 500,
      },
      master: {
        effect: [
          { id: "strength", level: 4 },
          { id: "haste", level: 3 },
        ],
        p: 1200,
      },
      world: {
        effect: [
          { id: "strength", level: 5 },
          { id: "haste", level: 4 },
        ],
        p: 10000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 金鸣震魂
  metal_echo: {
    tr: [0],
    level: 5,
    proficiency: {
      beginner: { p: 150 },
      proficient: { p: 500 },
      master: { p: 1200 },
      world: { p: 10000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "playerHurt") return;
        const attacker = event.playerHurt?.damgingEntity;
        if (!attacker || attacker.id === event.player.id) return;
        // 金鸣震荡，反震来敌
        damageEntity(attacker, event.proficiencyLevel + 1, event.player);
        giveEffect(attacker, "slowness", 60, 1, true);
      },
      exec_use_event: ["playerHurt"],
      isActiveSkill: true,
    },
  },
  // 千刃诀
  thousand_blade: {
    tr: [0],
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
          damageEntity(target, lvl * 2, event.player);
        }
        event.player.playSound("mob.trident.throw");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 御剑术
  flying_sword: {
    tr: [0],
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
        giveEffect(event.player, "speed", 200, lvl, true);
        giveEffect(event.player, "jump_boost", 200, Math.min(lvl, 3));
        event.player.playSound("mob.enderdragon.flap");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 刃暴术
  blade_storm: {
    tr: [0],
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
        try {
          event.player.dimension.createExplosion(
            forwardLocation(event.player, 4),
            2 + Math.min(lvl, 3),
            {
              breaksBlocks: false,
              causesFire: false,
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
  // 枪意诀
  spear_intent: {
    tr: [0],
    level: 7,
    proficiency: {
      beginner: {
        effect: [
          { id: "strength", level: 3 },
          { id: "resistance", level: 1 },
        ],
        p: 500,
      },
      proficient: {
        effect: [
          { id: "strength", level: 4 },
          { id: "haste", level: 2 },
        ],
        p: 1500,
      },
      master: {
        effect: [
          { id: "strength", level: 5 },
          { id: "haste", level: 3 },
          { id: "resistance", level: 2 },
        ],
        p: 4000,
      },
      world: {
        effect: [
          { id: "strength", level: 5 },
          { id: "haste", level: 4 },
          { id: "resistance", level: 3 },
        ],
        p: 20000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 万剑归宗
  ten_thousand_sword: {
    tr: [0],
    level: 9,
    proficiency: {
      beginner: { p: 1000 },
      proficient: { p: 3000 },
      master: { p: 8000 },
      world: { p: 40000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        for (const target of getNearbyEnemies(event.player, 8 + lvl * 2)) {
          damageEntity(target, lvl * 4, event.player);
          giveEffect(target, "weakness", 200, 2, true);
        }
        try {
          event.player.dimension.spawnEntity(
            "minecraft:lightning_bolt",
            forwardLocation(event.player, 5),
          );
        } catch (error) {
          console.error(error);
        }
        event.player.playSound("mob.enderdragon.growl");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
} satisfies Record<string, GongFaEnumType>;
