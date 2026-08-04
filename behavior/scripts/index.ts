import { createApp } from "@mbler/mcx";
import "./Items.mcx";
import App from "./app.mcx";
import { startLoop } from "./core/loop";
import { world } from "@minecraft/server";
startLoop();
createApp(App).mount(world);
