import { Player, PlayerLeaveBeforeEventSignal, world } from "@minecraft/server";
import { getPhase, getSpiritMax, KV, layerNumber } from "../utils";
import { PlayerLevelData, PlayerLevelRefList } from "../types";
import { levelMaxLayer, MortalPlayerLevel } from "../config";

const watchers = new Map<string, Set<(data: PlayerLevelData) => void>>();

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
        rawtext: [
          MortalPlayerLevel[this._level],
          { text: " " },
          layerNumber(this._layer),
        ],
      },
      layer: this._layer,
      phase: getPhase(
        this._layer,
        levelMaxLayer[(this._level + 1) as PlayerLevelRefList],
      ),
      spirit: this._spirit,
      spiritMax: getSpiritMax(this._level, this._layer),
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
