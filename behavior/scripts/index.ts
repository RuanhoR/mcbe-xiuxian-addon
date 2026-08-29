import { createApp, registryCommand } from "@mbler/mcx";
import "./components/generate";
import App from "./app.mcx";
import { world } from "@minecraft/server";
import { resolveCommand } from "./command/resolve";
// @ts-ignore
createApp(App).mount(world);
registryCommand(resolveCommand);
