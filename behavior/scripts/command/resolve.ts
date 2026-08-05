import { Command } from "@mbler/mcx";
import { CustomCommandStatus, Player } from "@minecraft/server";

export const resolveCommand = new Command(
  "xian:resolveplayerstatusputuanpoooooooooooooooooo",
);
const task: Parameters<typeof onPlayerStatusChange>[0][] = [];
export function onPlayerStatusChange(
  callback: (status: string, player: Player) => void,
) {
  task.push(callback);
}
resolveCommand.addMandatoryParameter("status", "string");

resolveCommand.action((origin, ...args) => {
  if (
    origin.sourceType !== "Entity" ||
    origin.sourceEntity?.typeId !== "minecraft:player"
  ) {
    return {
      message: "Must Player",
      status: CustomCommandStatus.Failure,
    };
  }
  if (typeof args[0] !== "string") {
    return {
      message: "Must include string",
      status: CustomCommandStatus.Failure,
    };
  }

  const player = origin.sourceEntity as Player;
  player.setDynamicProperty("_bstatus", args[0] as string);
  task.forEach((r) => r(args[0] as string, player));
  return {
    message: "",
    status: CustomCommandStatus.Success,
  };
});
