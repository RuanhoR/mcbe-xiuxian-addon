import {
  Player,
  PlayerLeaveBeforeEventSignal,
  RawMessage,
  world,
} from "@minecraft/server";
import { getPhase, getSpiritMax, KV, layerNumber } from "../utils";
import { PlayerLevelData, PlayerLevelRefList } from "../types";
import { levelMaxLayer, MortalPlayerLevel } from "../config";

const watchers = new Map<string, Set<(data: PlayerLevelData) => void>>();

/** A single breakthrough (layer or realm advancement). */
export interface Breakthrough {
  levelRef: number;
  layer: number;
  /** Display name of the newly reached realm + layer. */
  name: RawMessage;
}

/** Max layer index (0-based) of a realm. `levelRef` 0..9 maps to keys 1..10. */
function realmMaxLayer(levelRef: number): number {
  return levelMaxLayer[(levelRef + 1) as PlayerLevelRefList];
}

export class PlayerLevel {
  private _kv: KV;
  private _level: number;
  private _spirit: number;
  private _layer: number;
  constructor(public player: Player) {
    this._kv = new KV(player);
    this._level = this._kv.get("_level", 0);
    this._spirit = this._kv.get("_spirit", 0);
    this._layer = this._kv.get("_layer", 0);
  }
  public getLevel(): PlayerLevelData {
    return {
      levelRef: this._level,
      name: {
        rawtext: [MortalPlayerLevel[this._level], layerNumber(this._layer)],
      },
      layer: this._layer,
      phase: getPhase(this._layer, realmMaxLayer(this._level)),
      spirit: this._spirit,
      spiritMax: getSpiritMax(this._level, this._layer),
    };
  }
  /** Whether the player is at the highest realm and its final layer. */
  private isPeak(): boolean {
    return (
      this._level >= MortalPlayerLevel.length - 1 &&
      this._layer >= realmMaxLayer(this._level) - 1
    );
  }
  /** The display name of a given realm + layer. */
  private realmName(levelRef: number, layer: number): RawMessage {
    return {
      rawtext: [MortalPlayerLevel[levelRef], layerNumber(layer)],
    };
  }
  /**
   * Whether the player is stuck at a realm's bottleneck: the final layer of
   * a realm, with a full spirit bar. Only eating a pill of the next realm
   * can break through from here.
   */
  public isRealmBottleneck(): boolean {
    if (this.isPeak()) return false;
    return (
      this._layer >= realmMaxLayer(this._level) - 1 &&
      this._spirit >= getSpiritMax(this._level, this._layer)
    );
  }
  /**
   * Grant spirit, then automatically advance layers as long as spirit fills
   * the current layer's spiritMax. Realm crossing is NOT automatic here; it
   * only happens through {@link breakthroughRealm} (e.g. by eating a pill).
   * Overflow beyond the absolute peak is capped. Returns every layer-up.
   */
  public addSpirit(amount: number): Breakthrough[] {
    this._spirit += amount;
    const breakthroughs = this.breakthroughIfReady();
    if (breakthroughs.length === 0) {
      this._kv.set("_spirit", this._spirit);
      this.notify();
    }
    return breakthroughs;
  }
  /**
   * While spirit reaches the current layer's spiritMax, advance one layer.
   * At a realm's final layer the bar caps and the player stays (bottleneck),
   * never advancing to the next realm automatically. Returns every layer-up.
   */
  public breakthroughIfReady(): Breakthrough[] {
    const breakthroughs: Breakthrough[] = [];
    while (true) {
      const max = getSpiritMax(this._level, this._layer);
      if (this._spirit < max) break;
      if (this._layer + 1 < realmMaxLayer(this._level)) {
        this._spirit -= max;
        this._layer += 1;
        breakthroughs.push({
          levelRef: this._level,
          layer: this._layer,
          name: this.realmName(this._level, this._layer),
        });
      } else {
        // Final layer of the realm: cap the bar, wait for a pill.
        this._spirit = max;
        break;
      }
    }
    this._kv.set("_level", this._level);
    this._kv.set("_layer", this._layer);
    this._kv.set("_spirit", this._spirit);
    this.notify();
    return breakthroughs;
  }
  /**
   * Break through to the next realm (used when eating a pill of the target
   * realm at the bottleneck). Layer and spirit reset to 0. Returns the new
   * realm, or undefined if already at the peak.
   */
  public breakthroughRealm(): Breakthrough | undefined {
    if (this.isPeak() || this._level >= MortalPlayerLevel.length - 1) {
      return undefined;
    }
    this._level += 1;
    this._layer = 0;
    this._spirit = 0;
    this._kv.set("_level", this._level);
    this._kv.set("_layer", this._layer);
    this._kv.set("_spirit", this._spirit);
    this.notify();
    return {
      levelRef: this._level,
      layer: this._layer,
      name: this.realmName(this._level, this._layer),
    };
  }
  public updateLevel(levelRef: number, layer: number) {
    this._level = levelRef;
    this._layer = layer;
    this._kv.set("_level", levelRef);
    this._kv.set("_layer", layer);
    this.notify();
  }
  public updateSpirit(spirit: number) {
    this._spirit = spirit;
    this._kv.set("_spirit", spirit);
    this.notify();
  }
  private notify() {
    const set = watchers.get(this.player.id);
    if (set) {
      const data = this.getLevel();
      for (const callback of set) callback(data);
    }
  }
  public static watch(
    player: Player,
    callback: (data: PlayerLevelData) => void,
  ) {
    const set =
      watchers.get(player.id) ?? new Set<(data: PlayerLevelData) => void>();
    set.add(callback);
    watchers.set(player.id, set);
    const leaveSignal: PlayerLeaveBeforeEventSignal =
      world.beforeEvents.playerLeave;
    const unsubscribeLeave = leaveSignal.subscribe((event) => {
      if (event.player.id !== player.id) return;
      watchers.delete(player.id);
      leaveSignal.unsubscribe(unsubscribeLeave);
    });
    callback(new PlayerLevel(player).getLevel());
    return () => {
      set.delete(callback);
      if (set.size === 0) {
        watchers.delete(player.id);
        leaveSignal.unsubscribe(unsubscribeLeave);
      }
    };
  }
}
