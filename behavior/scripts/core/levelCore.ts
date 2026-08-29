import type { Player, RawMessage } from "@minecraft/server";
import { PlayerLevelDataType, verifyPlayerLevelData } from "../schemas";
import { cloneDeep } from "lodash";
import {
  getMaxLayer,
  getPhase,
  getSpiritMax,
  layerNumber,
  randomPlayerSpiritualRoot,
} from "../utils";
import { MortalPlayerLevel } from "../config";
import { GongFaEnum, GongFaEnumType, GongFaType } from "../config/gongfa";
const cacheMap = new Map<string, PlayerLevelDataType>();
export class LevelCore {
  public static PlayerDyPropUseKey = "xian:playerleveldata";
  private static _DefaultPlayerLevelData = {
    p: 0,
    lr: 1,
    g: {} as PlayerLevelDataType["g"],
    spirit: 0,
    tr: {
      arr: [],
    },
  } as PlayerLevelDataType;
  private static _getRawData(player: Player) {
    const rawData = verifyPlayerLevelData(
      player.getDynamicProperty(this.PlayerDyPropUseKey),
    );
    if (!rawData.success) {
      const playerSpiritualRoot = randomPlayerSpiritualRoot();
      const initalLevelData = {
        ...this._DefaultPlayerLevelData,
      };
      initalLevelData.tr.arr = playerSpiritualRoot;
      player.setDynamicProperty(
        this.PlayerDyPropUseKey,
        JSON.stringify(initalLevelData),
      );
      return initalLevelData;
    } else {
      return rawData.data;
    }
  }
  private static _updateWithRawData(
    player: Player,
    newData: PlayerLevelDataType,
  ) {
    const data = verifyPlayerLevelData(newData);
    if (!data.success)
      throw new TypeError(`[${this.name}]: Invaild Update Input`);
    player.setDynamicProperty(
      this.PlayerDyPropUseKey,
      JSON.stringify(data.data),
    );
    cacheMap.delete(player.id);
    this.getRawData(player);
  }
  public static getRawSpiritualRoot(player: Player) {
    const rawData = this.getRawData(player);
  }
  public static getRawData(player: Player) {
    if (cacheMap.has(player.id)) {
      return cloneDeep(cacheMap.get(player.id)) as PlayerLevelDataType;
    } else {
      const raw = this._getRawData(player);
      cacheMap.set(player.id, raw);
      return raw;
    }
  }
  public static formatPlayerLevel(levelRef: number) {
    return MortalPlayerLevel[levelRef - 1];
  }
  public static formatPlayerPhase(layer: number, maxLayer: number) {
    return getPhase(layer, maxLayer);
  }
  public static formatPlayerLayer(layer: number) {
    return layerNumber(layer);
  }
  public static formatPlayerSpirit(spirit: number, maxSpirit: number) {
    return { text: `${spirit}/${maxSpirit}` } as RawMessage;
  }
  public static addGongFaProficiency(
    player: Player,
    GongFaType: GongFaType,
    value: number,
  ) {
    const rawData = this.getRawData(player);
    const returnValue = (rawData.g[GongFaType] += value);
    this._updateWithRawData(player, rawData);
    return returnValue;
  }
  public static addLevel(player: Player, value: number) {
    const rawData = this.getRawData(player);
    const returnValue = (rawData.lr += value);
    if (returnValue > 10 || returnValue < 1)
      throw new TypeError(`[${this.name}]: Inavila level input`);
    this._updateWithRawData(player, rawData);
    return returnValue;
  }
  public static addLayer(player: Player, value: number) {
    const rawData = this.getRawData(player);
    const levelMaxLayer = getMaxLayer(rawData.lr);
    const returnValue = (rawData.p += value);
    if (returnValue > levelMaxLayer || returnValue < 1)
      throw new TypeError(`[${this.name}]: Inavila layer input`);
    this._updateWithRawData(player, rawData);
    return returnValue;
  }

  public static getPhase(player: Player) {
    const rawData = this.getRawData(player);
    return getPhase(rawData.p, getMaxLayer(rawData.lr));
  }
  public static addNewGongFa(player: Player, id: GongFaType) {
    const rawData = this.getRawData(player);
    rawData.g[id] = GongFaEnum[id].proficiency.beginner.p;
    return true;
  }
  public static listAllGongFa(player: Player) {
    const rawData = this.getRawData(player);
    return Object.keys(rawData.g) as GongFaType[];
  }
  public static getAllGongFaData(player: Player) {
    const rawData = this.getRawData(player);
    return Object.fromEntries(
      this.listAllGongFa(player).map((r) => [
        r,
        { gongFaData: GongFaEnum[r], playerP: rawData.g[r] },
      ]),
    ) as {
      [key in GongFaType]: { gongFaData: GongFaEnumType; playerP: number };
    };
  }
  constructor(public player: Player) {
    const rawData = this.getRawData();
    this.layer = rawData.p;
    this.formatedLayer = LevelCore.formatPlayerLayer(rawData.p);
    this.phase = LevelCore.getPhase(player);
    this.gongFaList = LevelCore.getAllGongFaData(player);
    this.formatedLevel = LevelCore.formatPlayerLevel(rawData.lr);
    this.spirit = rawData.spirit;
    this.maxSpirit = getSpiritMax(rawData.lr, rawData.p);
    this.formatedSpirit = LevelCore.formatPlayerSpirit(
      this.spirit,
      this.maxSpirit,
    );
    this.fromatedPhase = LevelCore.getPhase(player);
  }
  layer: number;
  fromatedPhase: RawMessage;
  formatedSpirit: RawMessage;
  spirit: number;
  maxSpirit: number;
  formatedLayer: RawMessage;
  formatedLevel: RawMessage;
  phase: RawMessage;
  gongFaList: {
    [key in GongFaType]: { gongFaData: GongFaEnumType; playerP: number };
  };
  getRawData() {
    return LevelCore.getRawData(this.player);
  }
  listAllGongFa() {
    return LevelCore.listAllGongFa(this.player);
  }
  addNewGongFa(id: GongFaType) {
    return LevelCore.addNewGongFa(this.player, id);
  }
  getPhase() {
    return LevelCore.getPhase(this.player);
  }
}
