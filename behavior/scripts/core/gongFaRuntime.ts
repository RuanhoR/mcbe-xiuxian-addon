import {
  EntityHitEntityAfterEvent,
  EntityHurtAfterEvent,
  ItemUseAfterEvent,
  Player,
  PlayerInteractWithBlockAfterEvent,
  system,
} from "@minecraft/server";
import { GongFaEnumType, GongFaExecUseEvent } from "../config/gongfa";
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
  public runUseEvent(vanillaEvent: {
    hitBlock?: PlayerInteractWithBlockAfterEvent;
    hitEntity?: EntityHitEntityAfterEvent;
    itemUse?: ItemUseAfterEvent;
    playerHurt?: EntityHurtAfterEvent;
    type: GongFaExecUseEvent;
  }) {}
}
