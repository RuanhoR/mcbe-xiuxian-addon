import { Command } from "@mbler/mcx";
import {
  CommandPermissionLevel,
  CustomCommandOrigin,
  CustomCommandStatus,
  Player,
  world,
} from "@minecraft/server";
import { levelMaxLayer, MortalPlayerLevel } from "../config";
import { PlayerLevelRefList } from "../types";
import { PlayerLevel } from "../core/playerLevel";
import { layerNumber, rawMessage } from "../utils";

/**
 * /xian:playermanager <action> [value] [playerName]
 *
 * Admin-only helper to inspect / modify a player's cultivation data.
 * Defaults to the executing player; pass a playerName at the end to
 * target someone else.
 *   - get          show realm, layer, spirit
 *   - setlevel     set the realm (0-9), resets layer and spirit
 *   - setlayer     set the layer within the current realm (resets spirit)
 *   - setspirit    set the spirit amount directly
 *   - addspirit    grant spirit (may trigger breakthroughs)
 */
const command = new Command("xian:playermanager");
command.setDescription("Manage player cultivation data (Admin only)");
command.addMandatoryParameter("action", "string");
command.addOptionalParameter("value", "integer");
command.addOptionalParameter("playerName", "string");
command.setPermissionLevel(CommandPermissionLevel.Admin);
command.action((origin: CustomCommandOrigin, action, value, playerName) => {
  if (
    origin.sourceType !== "Entity" ||
    origin.sourceEntity?.typeId !== "minecraft:player"
  ) {
    return {
      message: "Must Player",
      status: CustomCommandStatus.Failure,
    };
  }
  const executor = origin.sourceEntity as Player;
  const target =
    typeof playerName === "string"
      ? world.getPlayers({ name: playerName })[0]
      : executor;
  if (!target) {
    return {
      message: "Player not found",
      status: CustomCommandStatus.Failure,
    };
  }

  const level = new PlayerLevel(target);
  const act = String(action);

  switch (act) {
    case "get": {
      const data = level.getLevel();
      executor.sendMessage(
        rawMessage`§a${target.name}§r §e${MortalPlayerLevel[data.levelRef]}§r §7${layerNumber(
          data.layer,
        )}§r ${data.phase} §f${data.spirit}§r/§f${data.spiritMax}§r`,
      );
      return {
        message: "",
        status: CustomCommandStatus.Success,
      };
    }
    case "setlevel": {
      const v = Number(value);
      if (!Number.isInteger(v) || v < 0 || v >= MortalPlayerLevel.length) {
        return {
          message: `Invalid realm: ${v}. Must be an integer in [0, ${
            MortalPlayerLevel.length - 1
          }]`,
          status: CustomCommandStatus.Failure,
        };
      }
      level.updateLevel(v, 0);
      level.updateSpirit(0);
      executor.sendMessage(
        rawMessage`§a${target.name}§r → §e${MortalPlayerLevel[v]}§r §7${layerNumber(0)}§r`,
      );
      return {
        message: "",
        status: CustomCommandStatus.Success,
      };
    }
    case "setlayer": {
      const v = Number(value);
      const data = level.getLevel();
      const maxLayer = levelMaxLayer[(data.levelRef + 1) as PlayerLevelRefList];
      if (!Number.isInteger(v) || v < 0 || v >= maxLayer) {
        return {
          message: `Invalid layer: ${v}. Must be an integer in [0, ${
            maxLayer - 1
          }] for realm ${data.levelRef}`,
          status: CustomCommandStatus.Failure,
        };
      }
      level.updateLevel(data.levelRef, v);
      level.updateSpirit(0);
      executor.sendMessage(
        rawMessage`§a${target.name}§r → §e${MortalPlayerLevel[data.levelRef]}§r §7${layerNumber(v)}§r`,
      );
      return {
        message: "",
        status: CustomCommandStatus.Success,
      };
    }
    case "setspirit": {
      const v = Number(value);
      if (!Number.isInteger(v) || v < 0) {
        return {
          message: `Invalid spirit: ${v}. Must be a non-negative integer`,
          status: CustomCommandStatus.Failure,
        };
      }
      level.updateSpirit(v);
      executor.sendMessage(
        rawMessage`§a${target.name}§r §f${v}§r/§f${level.getLevel().spiritMax}§r`,
      );
      return {
        message: "",
        status: CustomCommandStatus.Success,
      };
    }
    case "addspirit": {
      const v = Number(value);
      if (!Number.isInteger(v) || v < 0) {
        return {
          message: `Invalid spirit: ${v}. Must be a non-negative integer`,
          status: CustomCommandStatus.Failure,
        };
      }
      const breakthroughs = level.addSpirit(v);
      for (const b of breakthroughs) {
        executor.sendMessage(
          rawMessage`§e${target.name}§r 突破 → §e${MortalPlayerLevel[b.levelRef]}§r §7${layerNumber(b.layer)}§r`,
        );
      }
      const data = level.getLevel();
      executor.sendMessage(
        rawMessage`§a${target.name}§r §e${MortalPlayerLevel[data.levelRef]}§r §7${layerNumber(data.layer)}§r §f${data.spirit}§r/§f${data.spiritMax}§r`,
      );
      return {
        message: "",
        status: CustomCommandStatus.Success,
      };
    }
    default:
      return {
        message:
          "Invalid action. Use: get, setlevel, setlayer, setspirit, addspirit",
        status: CustomCommandStatus.Failure,
      };
  }
});
export default command;
