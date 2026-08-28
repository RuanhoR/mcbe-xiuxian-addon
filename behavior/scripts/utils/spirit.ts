import type { RawMessage } from "@minecraft/server";
import {
  levelMaxLayer,
  PlayerLevelPhase,
  PlayerSpiritMap,
} from "../config/player";
import { PlayerLevelRefList } from "../types";
export function layerNumber(layer: number): RawMessage {
  return {
    translate: `sapi.playerlevel.layer.n${layer + 1}`,
  };
}
export function getPhase(layer: number, maxLayer: number): RawMessage {
  const ratio = layer / maxLayer;
  const index = Math.floor(ratio * 4); // 0 ~ 3
  return PlayerLevelPhase[Math.min(index, PlayerLevelPhase.length - 1)];
}
/**
 * Spirit capacity of the current realm + layer. Spirit resets to 0 after
 * each breakthrough, so the cap is the amount that must be filled to advance.
 */
export function getSpiritMax(levelRef: number, layer: number) {
  const d = PlayerSpiritMap[levelRef as keyof typeof PlayerSpiritMap];
  return d.base + d.layer * layer;
}
export function randomArray(n: number): (0 | 1 | 2 | 3 | 4)[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 5)) as (
    | 0
    | 1
    | 2
    | 3
    | 4
  )[];
}
export function randomPlayerSpiritualRoot(): (0 | 4 | 2 | 1 | 3 | 5)[] {
  const rn = Math.floor(Math.random() * 1) + 0.1;
  if (rn > 9) {
    // 无属性
    return [5];
  } else {
    // 属性数量
    let cout = Math.floor(rn / 2);
    if (cout == 5) cout = 1;
    return randomArray(cout);
  }
}
export function getMaxLayer(level: PlayerLevelRefList) {
  return levelMaxLayer[level];
}
