import {
  EntityHitEntityAfterEvent,
  EntityHurtAfterEvent,
  Player,
  PlayerInteractWithBlockAfterEvent,
  system,
} from "@minecraft/server";
import { GongFaEnumType, GongFaUseEvent } from "../config/gongfa";
import { PlayerLevelDataType } from "../schemas";
import { calcGongFaProficiencyLevel } from "../utils";

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
  public runBackend() {
    if (this.gongFaData.use.backend)
      system.run(
        () =>
          this.gongFaData.use.backend &&
          this.gongFaData.use.backend(this._buildBaseGongFaEvent()),
      );
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
    this.gongFaData.use.onUse(baseEvent);
  }
}
