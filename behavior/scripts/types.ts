import type { RawMessage } from "@minecraft/server";
import { MortalPlayerLevel } from "./config";
type RangeFrom0To<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Acc[number]
  : RangeFrom0To<N, [...Acc, Acc["length"]]>;
export type Range<
  N extends number,
  Min extends number = 0,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Exclude<Acc[number], RangeFrom0To<Min>>
  : Range<N, Min, [...Acc, Acc["length"]]>;
export type PlayerLevelRefList = RangeAdd1Max<
  (typeof MortalPlayerLevel)["length"],
  1
>;
export type RangeAdd1Max<
  N extends number,
  Min extends number = 0,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Exclude<Acc[number] | N, RangeFrom0To<Min>>
  : RangeAdd1Max<N, Min, [...Acc, Acc["length"]]>;
/*
 * 0 = 金 1 = 木 2 = 水 3 = 火 4= 土 5 = 无，可混合
 */
export const SpiritualRoot = [1, 2, 3, 4, 5, 0] as const;
export type SpiritualRootType = (typeof SpiritualRoot)[number];
