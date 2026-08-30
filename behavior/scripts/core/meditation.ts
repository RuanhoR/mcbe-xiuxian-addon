import { Player, system } from "@minecraft/server";
import { LevelCore } from "./levelCore";
import { consumeAmbient, getAmbientSpirit } from "./spiritField";
import { rawMessage } from "../utils/message";

/**
 * 打坐修炼：蒲团菜单开启后每 RUN_TICK 生效。
 * 灵气获取 = f(周围环境灵气)：修炼前先检查周围灵气，
 * 环境枯竭则无法获取；吸收多少就从环境抽走多少（写入灵气场损耗）。
 * 移动超过 2 格自动收功。
 */

const MEDITATE_KEY = "xian:meditating";
const LOC_KEY = "xian:meditate_loc";
/** 每次生效最多吸收的环境灵气比例 */
const AMBIENT_DRAIN_RATE = 0.05;
const MIN_GAIN = 1;
const MAX_GAIN = 50;

export function isMeditating(player: Player): boolean {
  return player.getDynamicProperty(MEDITATE_KEY) === true;
}

export function setMeditating(player: Player, on: boolean): void {
  player.setDynamicProperty(MEDITATE_KEY, on);
  if (on) {
    player.setDynamicProperty(
      LOC_KEY,
      JSON.stringify({ x: player.location.x, y: player.location.y, z: player.location.z }),
    );
  } else {
    player.setDynamicProperty(LOC_KEY, undefined);
  }
}

function actionBar(player: Player, text: ReturnType<typeof rawMessage>) {
  try {
    player.onScreenDisplay.setActionBar(text);
  } catch (error) {
    console.error(error);
  }
}

/** 每 RUN_TICK 调用（tick task 5） */
export function processMeditationInTick(player: Player): void {
  if (!isMeditating(player)) return;

  // 移动超过 2 格自动收功
  const rawLoc = player.getDynamicProperty(LOC_KEY);
  if (typeof rawLoc === "string") {
    try {
      const loc = JSON.parse(rawLoc) as { x: number; y: number; z: number };
      if (Math.hypot(player.location.x - loc.x, player.location.z - loc.z) > 2) {
        setMeditating(player, false);
        actionBar(player, rawMessage`§7身形已动，收功`);
        return;
      }
    } catch {
      setMeditating(player, false);
      return;
    }
  }

  // 修炼先检查周围灵气
  const ambient = getAmbientSpirit(player.dimension, player.location);
  if (ambient < MIN_GAIN) {
    actionBar(player, rawMessage`§7此地灵气枯竭（${ambient.toFixed(1)}），无法修炼`);
    return;
  }

  const want = Math.min(
    MAX_GAIN,
    Math.max(MIN_GAIN, ambient * AMBIENT_DRAIN_RATE),
  );
  // 从环境抽灵（写入灵气场损耗），抽走多少吸收多少
  const taken = consumeAmbient(player.dimension, player.location, want);
  if (taken < MIN_GAIN) {
    actionBar(player, rawMessage`§7灵气已被抽尽，无法修炼`);
    return;
  }
  LevelCore.addSpirit(player, taken);
  actionBar(
    player,
    rawMessage`§b吐纳 +${taken.toFixed(1)} §7(环境灵气 ${ambient.toFixed(1)})`,
  );
}
