import type { RawMessage } from "@minecraft/server";
import { PlayerLevelPhase } from "../config/player";
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
const SPIRIT_BASE = 20;
const SPIRIT_LAYER_STEP = 10;
/**
 * Spirit capacity of the current realm + layer. Spirit resets to 0 after
 * each breakthrough, so the cap is the amount that must be filled to advance.
 */
export function getSpiritMax(levelRef: number, layer: number) {
  if (levelRef === 0) return SPIRIT_BASE;
  return SPIRIT_LAYER_STEP * 2 ** levelRef * (layer + 1);
}
