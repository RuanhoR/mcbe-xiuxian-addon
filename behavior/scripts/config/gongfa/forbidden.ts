import { EntityDamageCause } from "@minecraft/server";
import type { GongFaEnumType } from "./types";
import {
  damageEntity,
  forwardLocation,
  getNearbyEnemies,
  giveEffect,
} from "./utils";

/**
 * 天阶禁术：威力巨大、消耗惊人的高阶功法
 */
export const ForbiddenGongFa = {
  // 雷霆万钧
  thunder_fall: {
    tr: [0],
    level: 7,
    proficiency: {
      beginner: { p: 500 },
      proficient: { p: 1500 },
      master: { p: 4000 },
      world: { p: 20000 },
    },
    use: {
      spiritCost: 2000,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        const center = forwardLocation(event.player, 8);
        for (const target of getNearbyEnemies(event.player, 8 + lvl)) {
          damageEntity(target, 8 + lvl * 2, event.player);
          giveEffect(target, "weakness", 100, 1, true);
        }
        try {
          event.player.dimension.spawnEntity(
            "minecraft:lightning_bolt",
            center,
          );
        } catch (error) {
          console.error(error);
        }
        event.player.playSound("ambient.weather.thunder");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 燃血诀
  blood_burn: {
    tr: [5],
    level: 7,
    proficiency: {
      beginner: { p: 500 },
      proficient: { p: 1500 },
      master: { p: 4000 },
      world: { p: 20000 },
    },
    use: {
      spiritCost: 1500,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        // 燃自身精血，换一时无上战力
        damageEntity(event.player, 4, event.player, EntityDamageCause.magic);
        giveEffect(event.player, "strength", 600, 4, true);
        giveEffect(event.player, "speed", 600, 3);
        giveEffect(event.player, "resistance", 600, Math.min(2 + lvl, 4));
        event.player.playSound("mob.warden.heartbeat");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 山岳镇魂
  mountain_crush: {
    tr: [4],
    level: 8,
    proficiency: {
      beginner: { p: 800 },
      proficient: { p: 2500 },
      master: { p: 6000 },
      world: { p: 30000 },
    },
    use: {
      spiritCost: 6000,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        const center = forwardLocation(event.player, 6);
        for (const target of getNearbyEnemies(event.player, 6 + lvl * 2)) {
          giveEffect(target, "slowness", 200, 4, true);
          giveEffect(target, "mining_fatigue", 200, 3);
        }
        try {
          event.player.dimension.createExplosion(center, 6, {
            breaksBlocks: false,
            causesFire: false,
            source: event.player,
          });
        } catch (error) {
          console.error(error);
        }
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 炼狱火海
  flame_purgatory: {
    tr: [3],
    level: 8,
    proficiency: {
      beginner: { p: 800 },
      proficient: { p: 2500 },
      master: { p: 6000 },
      world: { p: 30000 },
    },
    use: {
      spiritCost: 8000,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        giveEffect(event.player, "fire_resistance", 400, 1);
        for (const target of getNearbyEnemies(event.player, 10 + lvl)) {
          damageEntity(target, 15, event.player);
          try {
            target.setOnFire(10 + lvl * 2, true);
          } catch (error) {
            console.error(error);
          }
        }
        event.player.dimension.spawnParticle(
          "minecraft:lava_particle",
          event.player.location,
        );
        event.player.playSound("mob.blaze.breath");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 雷罚领域
  thunder_domain: {
    tr: [0],
    level: 8,
    proficiency: {
      beginner: { p: 800 },
      proficient: { p: 2500 },
      master: { p: 6000 },
      world: { p: 30000 },
    },
    use: {
      spiritCost: 8000,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        for (const target of getNearbyEnemies(event.player, 10 + lvl)) {
          try {
            target.dimension.spawnEntity(
              "minecraft:lightning_bolt",
              target.location,
            );
          } catch (error) {
            console.error(error);
          }
          damageEntity(target, 10 + lvl * 2, event.player);
        }
        event.player.playSound("ambient.weather.thunder");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 灵噬诀
  spirit_devour: {
    tr: [5],
    level: 8,
    proficiency: {
      beginner: { p: 800 },
      proficient: { p: 2500 },
      master: { p: 6000 },
      world: { p: 30000 },
    },
    use: {
      // 每次生效（10 tick）持续吞噬灵气化为杀伐之力
      spiritCost: 50,
      backend(event) {
        const lvl = event.proficiencyLevel;
        for (const target of getNearbyEnemies(event.player, 4 + lvl)) {
          damageEntity(target, 1 + lvl, event.player);
          giveEffect(target, "weakness", 60, 1);
        }
        event.player.dimension.spawnParticle(
          "minecraft:soul_particle",
          event.player.location,
        );
      },
      isActiveSkill: false,
    },
  },
  // 虚空坍缩
  void_collapse: {
    tr: [2, 5],
    level: 9,
    proficiency: {
      beginner: { p: 1000 },
      proficient: { p: 3000 },
      master: { p: 8000 },
      world: { p: 40000 },
    },
    use: {
      spiritCost: 30000,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        // 坍缩虚空，将周身之敌尽数拽至身前绞杀
        for (const target of getNearbyEnemies(event.player, 12 + lvl)) {
          try {
            target.teleport(event.player.location);
          } catch (error) {
            console.error(error);
          }
          damageEntity(target, 20, event.player);
          giveEffect(target, "slowness", 100, 3, true);
        }
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
  // 碎星诀
  star_destroyer: {
    tr: [0, 4],
    level: 9,
    proficiency: {
      beginner: { p: 1000 },
      proficient: { p: 3000 },
      master: { p: 8000 },
      world: { p: 40000 },
    },
    use: {
      spiritCost: 40000,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        const center = forwardLocation(event.player, 10);
        for (const target of getNearbyEnemies(event.player, 16 + lvl)) {
          damageEntity(target, 40, event.player);
        }
        try {
          event.player.dimension.createExplosion(center, 15, {
            breaksBlocks: true,
            causesFire: false,
            source: event.player,
          });
        } catch (error) {
          console.error(error);
        }
        event.player.playSound("random.explode");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 自爆
  self_destruct: {
    tr: [5],
    level: 9,
    proficiency: {
      beginner: { p: 1000 },
      proficient: { p: 3000 },
      master: { p: 8000 },
      world: { p: 40000 },
    },
    use: {
      // 以身为引，与敌偕亡：爆炸半径随修为境界（lr）提升
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lr = event.playerLevel.lr;
        const radius = Math.max(4, lr * 4);
        event.player.kill();
        try {
          event.player.dimension.createExplosion(
            event.player.location,
            radius,
            {
              breaksBlocks: true,
              causesFire: lr >= 6,
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
  // 吞天诀
  heaven_devour: {
    tr: [5],
    level: 10,
    proficiency: {
      beginner: { p: 2000 },
      proficient: { p: 6000 },
      master: { p: 15000 },
      world: { p: 60000 },
    },
    use: {
      spiritCost: 80000,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const lvl = event.proficiencyLevel;
        for (const target of getNearbyEnemies(event.player, 24)) {
          damageEntity(target, 50, event.player);
          giveEffect(target, "weakness", 200, 3, true);
          giveEffect(target, "slowness", 200, 3);
        }
        // 吞噬万灵精气反哺己身
        giveEffect(event.player, "regeneration", 600, 4, true);
        giveEffect(event.player, "absorption", 600, 4);
        event.player.playSound("mob.warden.sonic_boom");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
  // 核爆术
  nuclear_blast: {
    tr: [3, 4],
    level: 10,
    proficiency: {
      beginner: { p: 2000 },
      proficient: { p: 6000 },
      master: { p: 15000 },
      world: { p: 60000 },
    },
    use: {
      spiritCost: 120000,
      onUse(event) {
        if (event.type !== "ItemUse") return;
        const center = forwardLocation(event.player, 32);
        // 半径 64 格的毁灭一击，注意：破坏范围很大，慎用
        try {
          event.player.dimension.createExplosion(center, 64, {
            breaksBlocks: true,
            causesFire: true,
            source: event.player,
          });
        } catch (error) {
          console.error(error);
        }
        // 蘑菇云
        for (const h of [0, 8, 16, 24, 32]) {
          event.player.dimension.spawnParticle(
            "minecraft:huge_explosion_emitter",
            { x: center.x, y: center.y + h, z: center.z },
          );
        }
        event.player.playSound("random.explode");
      },
      exec_use_event: ["ItemUse"],
      isActiveSkill: true,
    },
  },
} satisfies Record<string, GongFaEnumType>;
