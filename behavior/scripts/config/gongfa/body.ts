import type { GongFaEnumType } from "./types";
import { damageEntity, giveEffect } from "./utils";

export const BodyGongFa = {
  // 强身健体决 · 练气卷
  greatbody_v1: {
    tr: [5],
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
    tr: [5],
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
  // 铁皮功
  iron_skin: {
    tr: [5],
    level: 2,
    proficiency: {
      beginner: { effect: [{ id: "resistance", level: 1 }], p: 10 },
      proficient: { effect: [{ id: "resistance", level: 2 }], p: 60 },
      master: { effect: [{ id: "resistance", level: 3 }], p: 180 },
      world: { effect: [{ id: "resistance", level: 4 }], p: 4000 },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 蛮牛之力
  bull_power: {
    tr: [5],
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
  // 石化皮肤
  stone_form: {
    tr: [4, 5],
    level: 3,
    proficiency: {
      beginner: { effect: [{ id: "resistance", level: 2 }], p: 30 },
      proficient: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "absorption", level: 1 },
        ],
        p: 150,
      },
      master: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "absorption", level: 2 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "absorption", level: 3 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 锻骨诀
  bone_forging: {
    tr: [5],
    level: 3,
    proficiency: {
      beginner: {
        effect: [
          { id: "resistance", level: 1 },
          { id: "health_boost", level: 1 },
        ],
        p: 30,
      },
      proficient: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "health_boost", level: 2 },
        ],
        p: 150,
      },
      master: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "health_boost", level: 2 },
        ],
        p: 500,
      },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "health_boost", level: 3 },
        ],
        p: 6000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 巨力诀
  giant_strength: {
    tr: [5],
    level: 4,
    proficiency: {
      beginner: {
        effect: [
          { id: "strength", level: 2 },
          { id: "haste", level: 1 },
        ],
        p: 60,
      },
      proficient: {
        effect: [
          { id: "strength", level: 3 },
          { id: "haste", level: 2 },
        ],
        p: 300,
      },
      master: {
        effect: [
          { id: "strength", level: 4 },
          { id: "haste", level: 2 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "strength", level: 5 },
          { id: "haste", level: 3 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 玉骨诀
  jade_bone: {
    tr: [5],
    level: 4,
    proficiency: {
      beginner: { effect: [{ id: "absorption", level: 2 }], p: 60 },
      proficient: {
        effect: [
          { id: "absorption", level: 3 },
          { id: "resistance", level: 1 },
        ],
        p: 300,
      },
      master: {
        effect: [
          { id: "absorption", level: 4 },
          { id: "resistance", level: 2 },
        ],
        p: 800,
      },
      world: {
        effect: [
          { id: "absorption", level: 5 },
          { id: "resistance", level: 2 },
        ],
        p: 8000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 岩甲诀
  rock_body: {
    tr: [4],
    level: 5,
    proficiency: {
      beginner: {
        effect: [
          { id: "resistance", level: 2 },
          { id: "fire_resistance", level: 1 },
        ],
        p: 150,
      },
      proficient: {
        effect: [
          { id: "resistance", level: 3 },
          { id: "fire_resistance", level: 1 },
        ],
        p: 500,
      },
      master: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "fire_resistance", level: 2 },
        ],
        p: 1200,
      },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "fire_resistance", level: 2 },
          { id: "absorption", level: 3 },
        ],
        p: 10000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 不动明王体
  mountain_body: {
    tr: [4, 5],
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
          { id: "health_boost", level: 3 },
        ],
        p: 500,
      },
      master: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "health_boost", level: 3 },
        ],
        p: 1200,
      },
      world: {
        effect: [
          { id: "resistance", level: 4 },
          { id: "health_boost", level: 4 },
          { id: "absorption", level: 3 },
        ],
        p: 10000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 荆棘反甲
  thorns_reflect: {
    tr: [5],
    level: 4,
    proficiency: {
      beginner: { p: 60 },
      proficient: { p: 300 },
      master: { p: 800 },
      world: { p: 8000 },
    },
    use: {
      spiritCost: 60,
      onUse(event) {
        if (event.type !== "playerHurt") return;
        const attacker = event.playerHurt?.damgingEntity;
        if (!attacker || attacker.id === event.player.id) return;
        // 受击时反噬攻击者，熟练度越高反噬越重
        damageEntity(
          attacker,
          event.proficiencyLevel * 2,
          event.player,
        );
        giveEffect(attacker, "weakness", 60, 0, true);
      },
      exec_use_event: ["playerHurt"],
      isActiveSkill: true,
    },
  },
  // 泰坦化
  titan_form: {
    tr: [5],
    level: 6,
    proficiency: {
      beginner: { p: 300 },
      proficient: { p: 700 },
      master: { p: 1500 },
      world: { p: 9000 },
    },
    use: {
      spiritCost: 500,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        giveEffect(event.player, "strength", 300, lvl);
        giveEffect(event.player, "resistance", 300, lvl);
        giveEffect(event.player, "slowness", 300, 0, true);
        event.player.playSound("mob.ravager.roar");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 血气重生
  blood_rebirth: {
    tr: [5],
    level: 7,
    proficiency: {
      beginner: {
        effect: [
          { id: "regeneration", level: 2 },
          { id: "absorption", level: 2 },
        ],
        p: 500,
      },
      proficient: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "absorption", level: 3 },
        ],
        p: 1500,
      },
      master: {
        effect: [
          { id: "regeneration", level: 4 },
          { id: "absorption", level: 4 },
        ],
        p: 4000,
      },
      world: {
        effect: [
          { id: "regeneration", level: 5 },
          { id: "absorption", level: 5 },
          { id: "resistance", level: 2 },
        ],
        p: 20000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
  // 不朽金身
  immortal_golden_body: {
    tr: [5],
    level: 9,
    proficiency: {
      beginner: {
        effect: [
          { id: "regeneration", level: 3 },
          { id: "resistance", level: 3 },
        ],
        p: 1000,
      },
      proficient: {
        effect: [
          { id: "regeneration", level: 4 },
          { id: "resistance", level: 4 },
          { id: "absorption", level: 3 },
        ],
        p: 3000,
      },
      master: {
        effect: [
          { id: "regeneration", level: 5 },
          { id: "resistance", level: 4 },
          { id: "absorption", level: 4 },
          { id: "fire_resistance", level: 1 },
        ],
        p: 8000,
      },
      world: {
        effect: [
          { id: "regeneration", level: 5 },
          { id: "resistance", level: 5 },
          { id: "absorption", level: 5 },
          { id: "fire_resistance", level: 2 },
        ],
        p: 40000,
      },
    },
    use: {
      isActiveSkill: false,
    },
  },
} satisfies Record<string, GongFaEnumType>;
