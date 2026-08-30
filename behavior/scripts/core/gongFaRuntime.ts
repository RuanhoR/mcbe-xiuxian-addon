import {
  EntityHitEntityAfterEvent,
  EntityHurtAfterEvent,
  Player,
  PlayerInteractWithBlockAfterEvent,
  system,
} from "@minecraft/server";
import { GongFaEnumType, GongFaUseEvent } from "../config/gongfa";
import { PlayerLevelDataType } from "../schemas";
import { LevelCore } from "./levelCore";
import { calcGongFaProficiencyLevel, t } from "../utils";
import type { GongFaBackendEvent } from "../config/gongfa/types";

export class GongFaRuntime {
  constructor(
    public gongFaData: GongFaEnumType,
    public target: Player,
    public playerLevelData: PlayerLevelDataType,
    public proficiency: number,
  ) {
    this.proficiencyData = calcGongFaProficiencyLevel(gongFaData, proficiency);
  }
  proficiencyData: ReturnType<typeof calcGongFaProficiencyLevel>;
  private _buildBaseGongFaEvent() {
    return {
      player: this.target,
      playerLevel: this.playerLevelData,
      proficiency: this.proficiency,
      proficiencyLevel: this.proficiencyData.level,
      proficiencyLevelName: this.proficiencyData.name,
    };
  }
  /**
   * 解析本次生效的灵气消耗
   */
  private _resolveSpiritCost(event: GongFaBackendEvent) {
    const cost = this.gongFaData.use.spiritCost;
    if (cost == null) return 0;
    return typeof cost == "function" ? cost(event) : cost;
  }
  /**
   * 尝试扣除灵气；不足时不消耗并返回 false
   */
  private _tryConsumeSpirit(event: GongFaBackendEvent) {
    return LevelCore.useSpirit(this.target, this._resolveSpiritCost(event));
  }
  public runBackend() {
    if (!this.gongFaData.use.backend) return;
    system.run(() => {
      if (!this.gongFaData.use.backend) return;
      const baseEvent = this._buildBaseGongFaEvent();
      // 灵气不足时后台功法静默跳过本次生效
      if (!this._tryConsumeSpirit(baseEvent)) return;
      this.gongFaData.use.backend(baseEvent);
    });
  }
  public runUseEvent({
    type,
    event,
  }:
    | { type: "ItemUse"; event: null }
    | { type: "interactBlock"; event: PlayerInteractWithBlockAfterEvent }
    | { type: "hitEntity"; event: EntityHitEntityAfterEvent }
    | { type: "playerHurt"; event: EntityHurtAfterEvent }) {
    // Need Exec
    if (
      !this.gongFaData.use.exec_use_event ||
      !this.gongFaData.use.onUse ||
      !this.gongFaData.use.exec_use_event.includes(type)
    ) {
      return;
    }
    // Build Event Object
    const baseEvent: GongFaUseEvent = { ...this._buildBaseGongFaEvent(), type };
    if (type == "interactBlock") {
      baseEvent.interactBlock = {
        block: event.block,
        face: event.blockFace,
      };
    }
    if (type == "hitEntity") {
      baseEvent.hitEntity = {
        hitEntity: event.hitEntity,
      };
    }
    if (type == "playerHurt") {
      baseEvent.playerHurt = {
        hurtCause: event.damageSource.cause,
        damgingEntity: event.damageSource.damagingEntity,
        damagingProjectile: event.damageSource.damagingProjectile,
        damage: event.damage,
      };
    }
    if (!this._tryConsumeSpirit(baseEvent)) {
      try {
        this.target.onScreenDisplay.setActionBar(
          t("sapi.message.gongfa.spirit_lack"),
        );
      } catch (error) {
        console.error(error);
      }
      return;
    }
    this.gongFaData.use.onUse(baseEvent);
  }
}
