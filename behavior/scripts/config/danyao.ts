/** Item dynamic property keys for danyao data. */
export const DanYaoDpKeys = {
  id: "_dy_id",
  level: "_dy_level",
} as const;

/** Static definition of one danyao (pill). */
export interface DanYaoDef {
  /** Unique internal identifier, e.g. "xian:danyao_l1_0". */
  id: string;
  /** Localization key of the pill name. */
  nameKey: string;
  /** Realm level (0-9), matching {@link MortalPlayerLevel} indexes. */
  levelRef: number;
  /** Spirit gained when the pill is eaten. */
  spirit: number;
}

function dy(
  levelRef: number,
  index: number,
  spirit: number,
): DanYaoDef {
  return {
    id: `xian:danyao_l${levelRef}_${index}`,
    nameKey: `sapi.danyao.l${levelRef}.${index}`,
    levelRef,
    spirit,
  };
}

/**
 * All danyao in the game, grouped by realm level. Display names live in the
 * language files (`sapi.danyao.l<level>.<index>`), never in this source.
 */
export const DANYAO_DEFS: DanYaoDef[] = [
  // Level 0 - Mortal
  dy(0, 0, 10),
  dy(0, 1, 15),
  dy(0, 2, 20),
  dy(0, 3, 25),
  // Level 1 - Qi Refining
  dy(1, 0, 40),
  dy(1, 1, 50),
  dy(1, 2, 60),
  dy(1, 3, 70),
  // Level 2 - Foundation Establishment
  dy(2, 0, 120),
  dy(2, 1, 150),
  dy(2, 2, 180),
  dy(2, 3, 220),
  // Level 3 - Golden Core
  dy(3, 0, 350),
  dy(3, 1, 420),
  dy(3, 2, 500),
  dy(3, 3, 600),
  // Level 4 - Nascent Soul
  dy(4, 0, 900),
  dy(4, 1, 1100),
  dy(4, 2, 1300),
  dy(4, 3, 1600),
  // Level 5 - Spirit Transformation
  dy(5, 0, 2500),
  dy(5, 1, 3000),
  dy(5, 2, 3600),
  dy(5, 3, 4300),
  // Level 6 - Void Refinement
  dy(6, 0, 6500),
  dy(6, 1, 7800),
  dy(6, 2, 9400),
  dy(6, 3, 11500),
  // Level 7 - Body Integration
  dy(7, 0, 16000),
  dy(7, 1, 19500),
  dy(7, 2, 23500),
  dy(7, 3, 28500),
  // Level 8 - Mahayana
  dy(8, 0, 40000),
  dy(8, 1, 49000),
  dy(8, 2, 59000),
  dy(8, 3, 71000),
  // Level 9 - Tribulation Transcendence
  dy(9, 0, 100000),
  dy(9, 1, 122000),
  dy(9, 2, 148000),
  dy(9, 3, 180000),
];