import { Entity, EntityDamageCause, Player } from "@minecraft/server";

/**
 * 取玩家视线方向延伸 dist 格后的头部坐标（用于火球/冲锋/瞬移类技能落点）
 */
export function forwardLocation(player: Player, dist: number) {
  const dir = player.getViewDirection();
  const head = player.getHeadLocation();
  return {
    x: head.x + dir.x * dist,
    y: head.y + dir.y * dist,
    z: head.z + dir.z * dist,
  };
}

/**
 * 获取玩家周围的敌对目标（排除玩家自身与无生命单位）
 */
export function getNearbyEnemies(player: Player, radius: number): Entity[] {
  return player.dimension.getEntities({
    location: player.location,
    maxDistance: radius,
    excludeFamilies: ["inanimate"],
    excludeTypes: ["minecraft:player"],
  });
}

/**
 * 获取玩家周围的友方单位（排除怪物与无生命单位）
 */
export function getNearbyAllies(player: Player, radius: number): Entity[] {
  return player.dimension.getEntities({
    location: player.location,
    maxDistance: radius,
    excludeFamilies: ["monster", "inanimate"],
  });
}

export function damageEntity(
  entity: Entity,
  amount: number,
  player: Player,
  cause: EntityDamageCause = EntityDamageCause.entityAttack,
) {
  try {
    entity.applyDamage(amount, { cause, damagingEntity: player });
  } catch (error) {
    console.error(error);
  }
}

export function giveEffect(
  entity: Entity,
  id: string,
  ticks: number,
  amplifier: number,
  showParticles = false,
) {
  try {
    entity.addEffect(id, ticks, { amplifier, showParticles });
  } catch (error) {
    console.error(error);
  }
}
