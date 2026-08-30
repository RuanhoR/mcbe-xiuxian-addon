import { Player, system } from "@minecraft/server";
import { DanYaoEnum, DanYaoType } from "../config/danyao";
import type { DanYaoBackendEvent, DanYaoUseData, DanYaoUseEvent } from "../config/danyao/types";
import { LevelCore } from "./levelCore";
import { getDanYaoIdFromItem } from "../utils/danyao";
import { rawMessage } from "../utils/message";

/**
 * 品阶容差：玩家境界 lr <= 丹药品阶 + 容差 时丹药有效。
 * 例：2 品丹在 元婴(4) 及以下有效，练虚(6) 起无效。
 */
export const DANYAO_LEVEL_TOLERANCE = 2;

/** `${playerId}|${id}` → 冷却结束 tick（会话级：重进世界后冷却重置） */
const cooldowns = new Map<string, number>();

function actionBar(player: Player, text: ReturnType<typeof rawMessage>) {
  try {
    player.onScreenDisplay.setActionBar(text);
  } catch (error) {
    console.error(error);
  }
}

/**
 * 尝试服用丹药（itemCompleteUse 时调用，吃完才触发）。
 * 返回 true 表示该物品按丹药逻辑处理（无论是否生效）。
 */
export function useDanYao(player: Player, item: Parameters<typeof getDanYaoIdFromItem>[0]): boolean {
  const id = getDanYaoIdFromItem(item);
  if (!id) return false;
  const def = DanYaoEnum[id];
  if (!def) return false;

  const now = system.currentTick;
  const cooldownKey = `${player.id}|${id}`;
  const cooldownEnd = cooldowns.get(cooldownKey);
  if (cooldownEnd !== undefined && cooldownEnd > now) {
    actionBar(player, rawMessage`§7${def.name} 尚在药力压制中（${Math.ceil((cooldownEnd - now) / 20)}s）`);
    return true;
  }

  // 品阶门槛：境界超出药力范围则无效
  const lr = LevelCore.getRawData(player).lr;
  if (lr > def.level + DANYAO_LEVEL_TOLERANCE) {
    actionBar(player, rawMessage`§c${def.name}药力驳杂，对你当前的境界已无效果`);
    return true;
  }

  const use = def.use as DanYaoUseData;
  // 灵气消耗：不足则不生效也不消耗
  if (use.spiritCost && !LevelCore.useSpirit(player, use.spiritCost)) {
    actionBar(player, rawMessage`§c灵气不足，无法激发药力`);
    return true;
  }

  if (use.onUse) {
    use.onUse({ player, id, def, type: "ItemUse" } as DanYaoUseEvent);
  }

  // 只有带持续 backend 的丹药才需要记录 buff 状态（持久化在玩家数据里）
  if (use.backend && use.buffDuration) {
    const buffs = LevelCore.getBuffs(player);
    buffs[id] = now + use.buffDuration;
    LevelCore.setBuffs(player, buffs);
  }

  if (def.cooldown) cooldowns.set(cooldownKey, now + def.cooldown);
  // 注意：itemCompleteUse 触发时丹药已被游戏按食物逻辑消耗，这里不再手动扣减
  return true;
}

/** 每 RUN_TICK 调用：推进持久化 buff 的 backend，到期清理并写回 */
export function processDanYaoInTick(player: Player) {
  const buffs = LevelCore.getBuffs(player);
  const ids = Object.keys(buffs);
  if (ids.length === 0) return;
  const now = system.currentTick;
  let changed = false;
  for (const id of ids) {
    if (buffs[id] <= now) {
      delete buffs[id];
      changed = true;
      continue;
    }
    const def = DanYaoEnum[id as DanYaoType];
    if (!def) {
      delete buffs[id];
      changed = true;
      continue;
    }
    const use = def.use as DanYaoUseData;
    if (!use.backend) continue;
    const event: DanYaoBackendEvent = { player, id, def };
    try {
      use.backend(event);
    } catch (error) {
      console.error(error);
    }
  }
  if (changed) LevelCore.setBuffs(player, buffs);
}
