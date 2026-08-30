import { Dimension, world } from "@minecraft/server";

/**
 * 灵气场（环境灵气）：
 *   灵气(loc) = 全局基础值 + 群系基底 + 灵脉场贡献(算法分布, seed=world seed) + 人工建筑贡献(接口)
 *               − 距离衰减(已折入灵脉贡献的距离 falloff) − 消耗损耗(局部, 随时间恢复)
 *
 * 缓存策略：按 cell（CELL_SIZE×CELL_SIZE 方块网格）缓存到 world dynamic property，
 * 每格一条 `{xian:field:<dim>:<cx>:<cz>}`，保存的是该格的"基底值 + 损耗状态"，
 * 而不是逐 loc 的完整计算结果；同一格内共享基底，损耗随时间自然恢复。
 */

const CELL_SIZE = 128;
const FIELD_KEY = (dim: string, cx: number, cz: number) => `xian:field:${dim}:${cx}:${cz}`;
const SEED_KEY = "xian:field:seed";

/** 全局基础灵气 */
const GLOBAL_BASE = 10;
/** 灵脉影响半径（格），超出衰减为 0 */
const VEIN_RADIUS = 160;
/** 每分钟自然恢复的损耗 */
const DEPLETION_REGEN_PER_MIN = 20;
/** 单格损耗上限（灵气被抽干的下限由 clamp 保证） */
const MAX_DEPLETION = 200;

/** 群系基底表（未列出的用默认值） */
const BIOME_BASE: Record<string, number> = {
  "minecraft:jungle": 14,
  "minecraft:bamboo_jungle": 14,
  "minecraft:flower_forest": 12,
  "minecraft:forest": 10,
  "minecraft:birch_forest": 10,
  "minecraft:old_growth_pine_taiga": 12,
  "minecraft:cherry_grove": 13,
  "minecraft:swamp": 8,
  "minecraft:mangrove_swamp": 10,
  "minecraft:plains": 6,
  "minecraft:sunflower_plains": 7,
  "minecraft:meadow": 9,
  "minecraft:savanna": 4,
  "minecraft:desert": 2,
  "minecraft:badlands": 2,
  "minecraft:beach": 3,
  "minecraft:stony_shore": 3,
  "minecraft:ocean": 4,
  "minecraft:frozen_ocean": 2,
  "minecraft:river": 5,
  "minecraft:snowy_plains": 3,
  "minecraft:ice_spikes": 4,
  "minecraft:taiga": 8,
  "minecraft:windswept_hills": 7,
  "minecraft:jagged_peaks": 9,
  "minecraft:stony_peak": 5,
  "minecraft:cave": 3,
  "minecraft:deep_dark": 6,
  "minecraft:the_nether": 1,
  "minecraft:the_end": 2,
};
const DEFAULT_BIOME_BASE = 5;

interface FieldCell {
  /** 基底值 = 全局 + 群系 + 灵脉场 + 建筑（不含损耗），同格内恒定 */
  base: number;
  /** 当前损耗 */
  depl: number;
  /** 上次更新时间（游戏 tick） */
  t: number;
}

// ---- 伪随机（以 seed 派生确定性 hash） ----
function hash2(seed: number, x: number, z: number): number {
  let h = (seed ^ Math.imul(x, 0x9e3779b1) ^ Math.imul(z, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
function hashUnit(seed: number, x: number, z: number, salt: number): number {
  return hash2(seed ^ salt, x, z) / 4294967296;
}

/** 世界种子：SAPI 无直接 seed API，首次生成并持久化，之后恒定 */
function getSeed(): number {
  const existing = world.getDynamicProperty(SEED_KEY);
  if (typeof existing === "number") return existing;
  const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
  world.setDynamicProperty(SEED_KEY, seed);
  return seed;
}

/** 灵脉分布：每 cell 以 seed 确定灵脉条数/位置/强度（稀疏：强脉罕见） */
interface Vein {
  /** cell 内相对位置（格） */
  x: number;
  z: number;
  /** 灵脉强度 0..1 */
  strength: number;
}
function getVeins(cx: number, cz: number): Vein[] {
  const seed = getSeed();
  const veins: Vein[] = [];
  const roll = hashUnit(seed, cx, cz, 0x51ed);
  // 60% 无灵脉，30% 弱脉，9% 中脉，1% 强脉
  if (roll < 0.6) return veins;
  const count = roll < 0.9 ? 1 : 2;
  for (let i = 0; i < count; i++) {
    const jx = hashUnit(seed, cx, cz, 0xa11c + i * 7) * CELL_SIZE;
    const jz = hashUnit(seed, cx, cz, 0xb22d + i * 13) * CELL_SIZE;
    const s = roll >= 0.99 ? 0.9 + hashUnit(seed, cx, cz, 0xc33e) * 0.1 : 0.15 + hashUnit(seed, cx, cz, 0xd44f) * 0.5;
    veins.push({ x: jx, z: jz, strength: s });
  }
  return veins;
}

/** 灵脉场贡献：遍历相邻 3×3 cell 的灵脉，按距离衰减累加 */
function veinFieldAt(dimId: string, wx: number, wz: number): number {
  const seed = getSeed();
  const cx = Math.floor(wx / CELL_SIZE);
  const cz = Math.floor(wz / CELL_SIZE);
  let total = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const cellX = cx + dx;
      const cellZ = cz + dz;
      for (const vein of getVeins(cellX, cellZ)) {
        const vx = cellX * CELL_SIZE + vein.x;
        const vz = cellZ * CELL_SIZE + vein.z;
        const dist = Math.hypot(wx - vx, wz - vz);
        // 距离衰减：线性 falloff
        const falloff = Math.max(0, 1 - dist / VEIN_RADIUS);
        if (falloff <= 0) continue;
        total += vein.strength * 40 * falloff * falloff;
      }
    }
  }
  void dimId;
  void seed;
  return total;
}

/** 群系基底 */
function biomeBaseAt(dimension: Dimension, x: number, y: number, z: number): number {
  try {
    const biome = dimension.getBiome({ x, y, z });
    return BIOME_BASE[biome.id] ?? DEFAULT_BIOME_BASE;
  } catch {
    return DEFAULT_BIOME_BASE;
  }
}

/**
 * 人工建筑贡献接口（秘境/宗门灵阵等）。
 * 预留：实现方按 location 返回额外灵气加成，当前恒为 0。
 */
const structureContributors: Array<(dimId: string, x: number, y: number, z: number) => number> = [];
export function registerStructureContributor(fn: (dimId: string, x: number, y: number, z: number) => number) {
  structureContributors.push(fn);
}
function structureAt(dimId: string, x: number, y: number, z: number): number {
  let total = 0;
  for (const fn of structureContributors) {
    try {
      total += fn(dimId, x, y, z);
    } catch (error) {
      console.error(error);
    }
  }
  return total;
}

function loadCell(dimId: string, cx: number, cz: number): FieldCell | null {
  const raw = world.getDynamicProperty(FIELD_KEY(dimId, cx, cz));
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as FieldCell;
  } catch {
    return null;
  }
}
function saveCell(dimId: string, cx: number, cz: number, cell: FieldCell) {
  try {
    world.setDynamicProperty(FIELD_KEY(dimId, cx, cz), JSON.stringify(cell));
  } catch (error) {
    console.error(error);
  }
}

/** 损耗随时间恢复（惰性结算：读取时按流逝时间回补） */
function decayDepletion(cell: FieldCell): void {
  if (cell.depl <= 0) return;
  const now = Date.now();
  const minutes = Math.max(0, (now - cell.t) / 60000);
  cell.depl = Math.max(0, cell.depl - minutes * DEPLETION_REGEN_PER_MIN);
}

/** 读取某位置的环境灵气（命中格缓存则直接用） */
export function getAmbientSpirit(dimension: Dimension, loc: { x: number; y: number; z: number }): number {
  const dimId = dimension.id;
  const cx = Math.floor(loc.x / CELL_SIZE);
  const cz = Math.floor(loc.z / CELL_SIZE);
  let cell = loadCell(dimId, cx, cz);
  if (!cell) {
    cell = {
      base:
        GLOBAL_BASE +
        biomeBaseAt(dimension, loc.x, loc.y, loc.z) +
        veinFieldAt(dimId, loc.x, loc.z) +
        structureAt(dimId, loc.x, loc.y, loc.z),
      depl: 0,
      t: Date.now(),
    };
    saveCell(dimId, cx, cz, cell);
  } else {
    decayDepletion(cell);
    cell.t = Date.now();
    saveCell(dimId, cx, cz, cell);
  }
  return Math.max(0, cell.base - cell.depl);
}

/**
 * 消耗环境灵气（修炼/布阵抽灵）：写入格缓存损耗。
 * @returns 实际消耗量（环境不足则只消耗现存部分）
 */
export function consumeAmbient(
  dimension: Dimension,
  loc: { x: number; y: number; z: number },
  amount: number,
): number {
  if (amount <= 0) return 0;
  const dimId = dimension.id;
  const cx = Math.floor(loc.x / CELL_SIZE);
  const cz = Math.floor(loc.z / CELL_SIZE);
  let cell = loadCell(dimId, cx, cz);
  if (!cell) {
    cell = { base: 0, depl: 0, t: Date.now() };
  }
  decayDepletion(cell);
  cell.t = Date.now();
  const ambient = Math.max(0, cell.base - cell.depl);
  const taken = Math.min(ambient, amount);
  cell.depl = Math.min(MAX_DEPLETION, cell.depl + taken);
  saveCell(dimId, cx, cz, cell);
  return taken;
}

/** 查询某 cell 的缓存状态（调试/展示用） */
export function inspectCell(
  dimension: Dimension,
  loc: { x: number; z: number },
): { cx: number; cz: number; cell: FieldCell | null } {
  const dimId = dimension.id;
  const cx = Math.floor(loc.x / CELL_SIZE);
  const cz = Math.floor(loc.z / CELL_SIZE);
  return { cx, cz, cell: loadCell(dimId, cx, cz) };
}
