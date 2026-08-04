import { createApp, registryCommand } from "@mbler/mcx";
import "./Items.mcx";
import App from "./app.mcx";
import { world } from "@minecraft/server";
import { resolveCommand } from "./command/resolve";
createApp(App).mount(world);
registryCommand(resolveCommand);
