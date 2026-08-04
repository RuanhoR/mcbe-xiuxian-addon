import { RawMessage } from "@minecraft/server";
import { MortalPlayerLevel } from "./config";

export type RangeFrom1<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Acc[number]
  : RangeFrom1<N, [...Acc, [...Acc, unknown]["length"]]>;
export type PlayerLevelRefList = RangeFrom1<typeof MortalPlayerLevel.length>;
export interface PlayerLevelData {
  levelRef: number;
  name: RawMessage;
  layer: number;
  phase: RawMessage;
  spirit: number;
  spiritMax: number;
}
