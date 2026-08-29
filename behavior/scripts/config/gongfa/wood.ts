import type { GongFaEnumType } from "./types";
import {
  getNearbyAllies,
  getNearbyEnemies,
  giveEffect,
} from "./utils";

export const WoodGongFa = {
  // 生机盎然
  life_bloom: {
    tr: [1],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "regeneration", level: 1 }], p: 10 },
      proficient: { effect: [{ id: "regeneration", level: 2 }], p: 60 },
      master: { effect: [{ id: "regeneration", level: 3 }], p: 180 },
      world: { effect: [{ id: "regeneration", level: 4 }], p: 4000 },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 百草诀
  herbal_knowledge: {
    tr: [1],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "regeneration", level: 1 }], p: 10 },
      proficient: {
        effect: [
          { id: "regeneration", level: 2 },
          { id: "absorption", level: 1 },
        ],
        p: 60,
      },
      master: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "absorption", level: 1 },
        ],
        p: 180,
      },
      world: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 4000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 回春术
  wood_heal: {
    tr: [1],
    level: 2,
    proficiency: {
      beginner: { p: 10 },
      proficient: { p: 60 },
      master: { p: 180 },
      world: { p: 4000 },
    },
    use: {
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        giveEffect(event.player, "regeneration", 100, lvl, true);
        giveEffect(event.player, "saturation", 1, 0);
        event.player.playSound("random.orb");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 光合作用
  photosynthesis: {
    tr: [1],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "regeneration", level: 1 }], p: 30 },
      proficient: {
        effect: [
          { id: "regeneration", level: 2 },
          { id: "speed", level: 1 },
        ],
        p: 150,
      },
      master: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "speed", level: 1 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "regeneration", level: 4 },
          { id: "speed", level: 2 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 藤蔓缠身
  vine_bind: {
    tr: [1],
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
        const lvl = event.proficiencyLevel;
        for (const target of getNearbyEnemies(event.player, 4 + lvl)) {
          giveEffect(target, "slowness", 100, lvl, true);
        }
        event.player.playSound("dig.grass");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 腐毒掌
  poison_palm: {
    tr: [1],
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
        giveEffect(target, "poison", 60 + lvl * 40, Math.min(lvl, 2), true);
      },
      exec_use_event: ["hitEntity"],
      isActiveSkill: true,
    },
  },
  // 荆棘甲
  thorn_armor: {
    tr: [1],
    level: 4,
    proficiency: {
      beginner: { effect: [{ id: "resistance", level: 1 }], p: 60 },
      proficient: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "regeneration", level: 1 },
        ],
        p: 300,
      },
      master: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "regeneration", level: 2 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "regeneration", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 灵种诀
  seed_grow: {
    tr: [1],
    level: 5,
    proficiency: {
      beginner: { p: 150 },
      proficient: { p: 500 },
      master: { p: 1200 },
      world: { p: 10000 },
    },
    use: {
      // 每 10 tick 生效：灵种在体内生根发芽，缓慢积蓄护体真元
      backend(event) {
        giveEffect(event.player, "absorption", 60, Math.max(0, event.proficiencyLevel - 2));
      },
      isActiveSkill: false,
    },
  },
  // 盘根错节
  entangle_roots: {
    tr: [1],
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
        const lvl = event.proficiencyLevel;
        giveEffect(attacker, "slowness", 80 + lvl * 20, lvl, true);
      },
      exec_use_event: ["playerHurt"],
      isActiveSkill: true,
    },
  },
  // 春回大地
  spring_recovery: {
    tr: [1],
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
        for (const ally of getNearbyAllies(event.player, 6 + lvl * 2)) {
          giveEffect(ally, "regeneration", 100, lvl, true);
        }
        giveEffect(event.player, "regeneration", 100, lvl, true);
        event.player.playSound("random.levelup");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 木灵附体
  wood_spirit: {
    tr: [1],
    level: 6,
    proficiency: {
      beginner: {
        effect: [
          { id: "regeneration", level: 2 },
          { id: "speed", level: 2 },
        ],
        p: 300,
      },
      proficient: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "speed", level: 2 },
        ],
        p: 700,
      },
      master: {
        effect: [
          { id: "regeneration", level: 4 },
          { id: "speed", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 1500,
      },
      world: {
        effect: [
          { id: "regeneration", level: 4 },
          { id: "speed", level: 3 },
          { id: "absorption", level: 3 },
        ],
        p: 9000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 树界降临
  tree_domain: {
    tr: [1],
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
        const lvl = event.proficiencyLevel;
        const radius = 8 + lvl * 2;
        for (const target of getNearbyEnemies(event.player, radius)) {
          giveEffect(target, "slowness", 200, 3, true);
          giveEffect(target, "poison", 200, Math.min(lvl, 2));
          giveEffect(target, "weakness", 200, 1);
        }
        event.player.playSound("dig.wood");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 长青功
  evergreen: {
    tr: [1],
    level: 8,
    proficiency: {
      beginner: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 800,
      },
      proficient: {
        effect: [
          { id: "regeneration", level: 4 },
          { id: "absorption", level: 3 },
        ],
        p: 2500,
      },
      master: {
        effect: [
          { id: "regeneration", level: 4 },
          { id: "absorption", level: 4 },
          { id: "resistance", level: 2 },
        ],
        p: 6000,
      },
      world: {
        effect: [
          { id: "regeneration", level: 5 },
          { id: "absorption", level: 5 },
          { id: "resistance", level: 3 },
        ],
        p: 30000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
} satisfies Record<string, GongFaEnumType>;
