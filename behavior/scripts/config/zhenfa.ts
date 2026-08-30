import type { ZhenFaEnumType, ZhenFaBackendEvent, ZhenFaPlaceEvent } from "./zhenfa/types";
import { rawMessage } from "../utils/message";
import { giveEffect, damageEntity as _damageEntity } from "./gongfa/utils";
import { EntityDamageCause } from "@minecraft/server";
import type { Entity, Player } from "@minecraft/server";

function damageEntity(entity: Entity, amount: number, owner: Player | undefined, cause?: EntityDamageCause) {
  if (owner) _damageEntity(entity, amount, owner, cause);
  else try { entity.applyDamage(amount, { cause: cause ?? EntityDamageCause.magic }); } catch { /* 无主阵法伤害 */ }
}

/**
 * 阵法注册表：10 个阵法原型 × 10 重品阶 = 100 种。
 * key 即阵法 id（写入阵盘 lore `zhenfa:<id>`）。
 * 品阶 lv：布阵需求境界 lr >= lv；数值随 lv 线性成长。
 */

const TIAN_GAN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"] as const;
const MAX_LEVEL = 10;

interface Archetype {
  key: string;
  name: string;
  /** 每重品阶的灵气消耗基数 */
  spiritBase: number;
  /** 存续时长基数（tick） */
  durationBase: number;
  /** 影响半径基数 */
  radiusBase: number;
  onPlace?: (event: ZhenFaPlaceEvent, lv: number) => void;
  backend?: (event: ZhenFaBackendEvent, lv: number) => void;
}

const archetypes: Archetype[] = [
  {
    // 聚灵阵：为周围修士持续灌注灵气（从阵法自身灵机中转）
    key: "juhun",
    name: "聚灵阵",
    spiritBase: 40,
    durationBase: 1200,
    radiusBase: 6,
    backend(event, lv) {
      const { entity, def } = event;
      for (const ally of getNearbyAlliesFrom(entity, def.radius)) {
        if (ally.typeId !== "minecraft:player") continue;
        LevelCoreBridge.addSpirit(ally as never, lv);
      }
      entity.dimension.spawnParticle("minecraft:endrod", entity.location);
    },
  },
  {
    // 焰火阵：灼烧入阵之敌
    key: "yanhuo",
    name: "焰火阵",
    spiritBase: 60,
    durationBase: 900,
    radiusBase: 5,
    backend(event, lv) {
      const { entity, def } = event;
      for (const foe of getNearbyEnemiesFrom(entity, def.radius)) {
        damageEntity(foe, lv, event.owner, EntityDamageCause.entityAttack);;
        try {
          foe.setOnFire(2 + lv, false);
        } catch (error) {
          console.error(error);
        }
      }
      entity.dimension.spawnParticle("minecraft:basic_flame_particle", entity.location);
    },
  },
  {
    // 冰霜阵：迟滞入阵之敌
    key: "hanshuang",
    name: "冰霜阵",
    spiritBase: 50,
    durationBase: 900,
    radiusBase: 6,
    backend(event, lv) {
      const { entity, def } = event;
      for (const foe of getNearbyEnemiesFrom(entity, def.radius)) {
        giveEffect(foe, "slowness", 60, Math.min(3, Math.ceil(lv / 3)), true);
        giveEffect(foe, "mining_fatigue", 60, Math.min(2, Math.ceil(lv / 5)), true);
      }
      entity.dimension.spawnParticle("minecraft:snowball_poof_particle", entity.location);
    },
  },
  {
    // 守御阵：护佑入阵修士
    key: "shouyu",
    name: "守御阵",
    spiritBase: 45,
    durationBase: 1800,
    radiusBase: 6,
    backend(event, lv) {
      const { entity, def } = event;
      const amp = Math.min(4, Math.ceil(lv / 2));
      for (const ally of getNearbyAlliesFrom(entity, def.radius)) {
        giveEffect(ally, "resistance", 80, amp);
        if (lv >= 5) giveEffect(ally, "absorption", 80, Math.min(3, lv - 4));
      }
      entity.dimension.spawnParticle("minecraft:villager_angry", entity.location);
    },
  },
  {
    // 回春阵：持续治愈入阵修士
    key: "huichun",
    name: "回春阵",
    spiritBase: 40,
    durationBase: 1500,
    radiusBase: 6,
    backend(event, lv) {
      const { entity, def } = event;
      const amp = Math.min(4, Math.ceil(lv / 2));
      for (const ally of getNearbyAlliesFrom(entity, def.radius)) {
        giveEffect(ally, "regeneration", 80, amp);
      }
      entity.dimension.spawnParticle("minecraft:heart_particle", entity.location);
    },
  },
  {
    // 迅雷阵：引雷诛敌
    key: "xunlei",
    name: "迅雷阵",
    spiritBase: 90,
    durationBase: 900,
    radiusBase: 7,
    backend(event, lv) {
      const { entity, def } = event;
      const foes = getNearbyEnemiesFrom(entity, def.radius);
      if (foes.length === 0) return;
      const target = foes[Math.floor(Math.random() * foes.length)];
      try {
        entity.dimension.spawnEntity("minecraft:lightning_bolt", target.location);
      } catch (error) {
        console.error(error);
      }
      for (const foe of foes) giveEffect(foe, "weakness", 100, Math.min(3, Math.ceil(lv / 4)), true);
    },
  },
  {
    // 困锁阵：禁锢入阵之敌
    key: "kunsuo",
    name: "困锁阵",
    spiritBase: 55,
    durationBase: 1200,
    radiusBase: 5,
    backend(event, lv) {
      const { entity, def } = event;
      for (const foe of getNearbyEnemiesFrom(entity, def.radius)) {
        giveEffect(foe, "slowness", 80, 4, true);
        giveEffect(foe, "weakness", 80, Math.min(4, Math.ceil(lv / 2)), true);
        giveEffect(foe, "darkness", 80, 0, true);
      }
      entity.dimension.spawnParticle("minecraft:dragon_breath_trail", entity.location);
    },
  },
  {
    // 隐匿阵：庇护入阵修士隐去身形
    key: "yinni",
    name: "隐匿阵",
    spiritBase: 70,
    durationBase: 1200,
    radiusBase: 5,
    backend(event, lv) {
      const { entity, def } = event;
      for (const ally of getNearbyAlliesFrom(entity, def.radius)) {
        giveEffect(ally, "invisibility", 80, 0);
        if (lv >= 3) giveEffect(ally, "speed", 80, Math.min(2, Math.ceil(lv / 4)));
      }
      entity.dimension.spawnParticle("minecraft:camera_shoot_explosion", entity.location);
    },
  },
  {
    // 猎杀阵：锋锐杀阵，直接诛敌
    key: "liesha",
    name: "猎杀阵",
    spiritBase: 80,
    durationBase: 900,
    radiusBase: 6,
    backend(event, lv) {
      const { entity, def } = event;
      for (const foe of getNearbyEnemiesFrom(entity, def.radius)) {
        damageEntity(foe, Math.ceil(lv * 1.5), event.owner, EntityDamageCause.magic);
      }
      entity.dimension.spawnParticle("minecraft:critical_hit_emitter", entity.location);
    },
  },
  {
    // 青木阵：生发木灵，滋养修士并涤荡火毒
    key: "qingmu",
    name: "青木阵",
    spiritBase: 50,
    durationBase: 1500,
    radiusBase: 7,
    onPlace(event, lv) {
      event.player.addEffect("regeneration", 100 + lv * 40, {
        amplifier: Math.min(2, Math.ceil(lv / 4)),
        showParticles: false,
      });
    },
    backend(event, lv) {
      const { entity, def } = event;
      for (const ally of getNearbyAlliesFrom(entity, def.radius)) {
        giveEffect(ally, "regeneration", 80, Math.min(2, Math.ceil(lv / 3)));
        if (lv >= 6) giveEffect(ally, "saturation", 20, 0);
      }
      entity.dimension.spawnParticle("minecraft:villager_happy", entity.location);
    },
  },
];

function getNearbyEnemiesFrom(entity: import("@minecraft/server").Entity, radius: number) {
  try {
    return entity.dimension.getEntities({
      location: entity.location,
      maxDistance: radius,
      excludeFamilies: ["inanimate"],
      excludeTypes: ["minecraft:player", "xian:zhenfa"],
    });
  } catch {
    return [];
  }
}

function getNearbyAlliesFrom(entity: import("@minecraft/server").Entity, radius: number) {
  try {
    return entity.dimension.getEntities({
      location: entity.location,
      maxDistance: radius,
      excludeFamilies: ["monster", "inanimate"],
    });
  } catch {
    return [];
  }
}

// LevelCore 延迟桥接（避免 config → core 循环导入在构建期执行顺序问题）
import { LevelCore } from "../core/levelCore";
const LevelCoreBridge = { addSpirit: (p: import("@minecraft/server").Player, v: number) => LevelCore.addSpirit(p, v) };

function buildZhenFaEnum(): Record<string, ZhenFaEnumType> {
  const out: Record<string, ZhenFaEnumType> = {};
  for (const arch of archetypes) {
    for (let lv = 1; lv <= MAX_LEVEL; lv++) {
      out[`${arch.key}_${lv}`] = {
        name: rawMessage`${arch.name}·${TIAN_GAN[lv - 1]}重`,
        level: lv,
        duration: arch.durationBase + lv * 300,
        radius: arch.radiusBase + Math.floor(lv / 3),
        use: {
          spiritCost: arch.spiritBase * lv,
          onPlace: arch.onPlace ? e => arch.onPlace!(e, lv) : undefined,
          backend: arch.backend ? e => arch.backend!(e, lv) : undefined,
        },
      };
    }
  }
  return out;
}

export const ZhenFaEnum = buildZhenFaEnum();

export type ZhenFaType = keyof typeof ZhenFaEnum;
export const ZHENFA_TOTAL = Object.keys(ZhenFaEnum).length;
