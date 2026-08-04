import { Command } from "@mbler/mcx";
import { CustomCommandStatus, Player } from "@minecraft/server";

export const resolveCommand = new Command(
  "xian:resolveplayerstatusputuanpoooooooooooooooooo",
);
const task: Parameters<typeof onPlayerStatusChange>[0][] = [];
export function onPlayerStatusChange(
  callback: (status: string, player: Player) => {},
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
  const player = origin.sourceEntity as Player;
  player.setDynamicProperty("_resolvestatus", args[0] as string);
  console.log(args[0]);
  return {
    message: "",
    status: CustomCommandStatus.Success,
  };
});
