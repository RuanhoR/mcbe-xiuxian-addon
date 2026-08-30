import {
  Block,
  Entity,
  EquipmentSlot,
  Player,
  system,
  world,
} from "@minecraft/server";
import { ZhenFaEnum, ZhenFaType } from "../config/zhenfa";
import type { ZhenFaBackendEvent } from "../config/zhenfa/types";
import { LevelCore } from "./levelCore";
import { getZhenFaIdFromItem } from "../utils/zhenfa";
import { rawMessage, rawToText } from "../utils/message";

/** 阵法实体上保存的数据（dyprop 继承自阵盘物品） */
interface ZhenFaEntityData {
  /** 阵法 id（继承自阵盘 lore） */
  id: ZhenFaType;
  /** 布阵者名字（可能离线） */
  ownerName: string;
  /** 到期 tick */
  expireTick: number;
}
const DATA_KEY = "xian:zhenfa_data";

function actionBar(player: Player, text: ReturnType<typeof rawMessage>) {
  try {
    player.onScreenDisplay.setActionBar(text);
  } catch (error) {
    console.error(error);
  }
}

/**
 * 轻触方块布阵：玩家手持已铭刻阵法的阵盘轻触方块表面时触发。
 * @returns true = 本次交互按阵法逻辑处理（无论是否成功布阵）
 */
export function placeZhenFa(
  player: Player,
  item: Parameters<typeof getZhenFaIdFromItem>[0],
  block: Block,
  face: unknown,
): boolean {
  void face;
  const id = getZhenFaIdFromItem(item);
  if (!id) return false;
  const def = ZhenFaEnum[id];
  if (!def) return false;

  // 品阶门槛：境界不足无法布阵
  const lr = LevelCore.getRawData(player).lr;
  if (lr < def.level) {
    actionBar(player, rawMessage`§c${def.name}需 ${def.level} 重境界方可布阵`);
    return true;
  }

  // 灵气消耗：不足则布阵失败，阵盘保留
  if (def.use.spiritCost && !LevelCore.useSpirit(player, def.use.spiritCost)) {
    actionBar(player, rawMessage`§c灵气不足，无法布下${def.name}`);
    return true;
  }

  // 阵法中心：轻触的方块上表面中心
  const loc = {
    x: block.location.x + 0.5,
    y: block.location.y + 1,
    z: block.location.z + 0.5,
  };
  let entity: Entity;
  try {
    entity = player.dimension.spawnEntity("xian:zhenfa" as never, loc);
  } catch (error) {
    console.error(error);
    actionBar(player, rawMessage`§c此处无法布阵`);
    return true;
  }

  // dyprop 继承自物品：阵盘 lore 中的阵法数据写入实体
  const data: ZhenFaEntityData = {
    id,
    ownerName: player.name,
    expireTick: system.currentTick + def.duration,
  };
  try {
    entity.nameTag = `§d${rawToText(def.name)}`;
    entity.setDynamicProperty(DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }

  if (def.use.onPlace) {
    try {
      def.use.onPlace({
        entity,
        id,
        def,
        owner: player,
        player,
        location: loc,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // 阵盘为一次性消耗
  consumeZhenPan(player, item);
  actionBar(player, rawMessage`§d已布下${def.name}`);
  player.playSound("mob.enderdragon.growl");
  return true;
}

/** 通过名字找布阵者（可能离线） */
function findOwner(name: string): Player | undefined {
  try {
    return world.getPlayers({ name })[0];
  } catch {
    return undefined;
  }
}

/** 消耗手中的阵盘（仅布阵成功时） */
function consumeZhenPan(player: Player, item: { amount: number; typeId: string }) {
  try {
    const equippable = player.getComponent("minecraft:equippable");
    const mainhand = equippable?.getEquipment(EquipmentSlot.Mainhand);
    if (!mainhand || mainhand.typeId !== item.typeId) return;
    if (mainhand.amount <= 1) equippable?.setEquipment(EquipmentSlot.Mainhand, undefined);
    else {
      mainhand.amount -= 1;
      equippable?.setEquipment(EquipmentSlot.Mainhand, mainhand);
    }
  } catch (error) {
    console.error(error);
  }
}

/** 每 RUN_TICK：推进所有已加载阵法的 backend，到期拆除 */
export function processZhenFaInTick() {
  const now = system.currentTick;
  const dimensions = [
    world.getDimension("overworld"),
    world.getDimension("nether"),
    world.getDimension("the_end"),
  ];
  for (const dimension of dimensions) {
    let entities: Entity[];
    try {
      entities = dimension.getEntities({ type: "xian:zhenfa" });
    } catch {
      continue;
    }
    for (const entity of entities) {
      const raw = entity.getDynamicProperty(DATA_KEY);
      if (typeof raw !== "string") {
        try {
          entity.remove();
        } catch (error) {
          console.error(error);
        }
        continue;
      }
      let data: ZhenFaEntityData;
      try {
        data = JSON.parse(raw) as ZhenFaEntityData;
      } catch {
        try {
          entity.remove();
        } catch (error) {
          console.error(error);
        }
        continue;
      }
      if (data.expireTick <= now) {
        try {
          entity.dimension.spawnParticle("minecraft:large_explosion", entity.location);
          entity.dimension.playSound("beacon.deactivate", entity.location);
          entity.remove();
        } catch (error) {
          console.error(error);
        }
        continue;
      }
      const def = ZhenFaEnum[data.id];
      if (!def?.use.backend) continue;
      const event: ZhenFaBackendEvent = {
        entity,
        id: data.id,
        def,
        owner: findOwner(data.ownerName),
      };
      try {
        def.use.backend(event);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
