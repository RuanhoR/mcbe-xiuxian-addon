import type {
  EntityHitEntityAfterEvent,
  EntityHurtAfterEvent,
  ItemUseAfterEvent,
  Player,
  PlayerInteractWithBlockAfterEvent,
} from "@minecraft/server";
import { GongFaEnum, GongFaType, GongFaEnumType } from "../config/gongfa";
import { LevelCore } from "./levelCore";
import { GongFaRuntime } from "./gongFaRuntime";

export type GongFaDispatchType = "ItemUse" | "hitEntity" | "interactBlock" | "playerHurt";

/**
 * 将一个原版事件分发给玩家已学的所有功法（按 exec_use_event 过滤）。
 * @param event 原版事件对象；ItemUse 传 null
 */
export function dispatchGongFaUseEvent(
  player: Player,
  type: GongFaDispatchType,
  event:
    | ItemUseAfterEvent
    | EntityHitEntityAfterEvent
    | PlayerInteractWithBlockAfterEvent
    | EntityHurtAfterEvent
    | null,
) {
  const rawData = LevelCore.getRawData(player);
  for (const [id, p] of Object.entries(rawData.g) as [GongFaType, number][]) {
    const gongFaData = GongFaEnum[id];
    if (!gongFaData) continue;
    const use = gongFaData.use as GongFaEnumType["use"];
    if (!use.onUse) continue;
    try {
      new GongFaRuntime(gongFaData, player, rawData, p).runUseEvent({
        type: type as never,
        event: event as never,
      } as never);
    } catch (error) {
      console.error(error);
    }
  }
}
