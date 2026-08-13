import { Player, system, world } from "@minecraft/server";
import { onPlayerStatusChange } from "../command/resolve";
import { ActionFormData } from "@minecraft/server-ui";
import { rawMessage, t } from "../utils";
import { autoIdentifyFirstGongFa } from "./gongfa";
import { autoIdentifyFirstDanYao } from "./danyao";
import { showCultivateGongFaMenu, showGongFaMenu } from "./gongfaMenu";
import { startCultivation, stopCultivation } from "./cultivate";
import { PlayerLevel } from "./playerLevel";

/** How often (in ticks) the loop scans players' inventories for unidentified gongfa. */
const AUTO_IDENTIFY_INTERVAL = 40;

export function startLoop() {
  onPlayerStatusChange((status, player) => {
    if (status == "inPuTuan") {
      stopCultivation(player);
      showPutuanMenu(player);
    } else {
      stopCultivation(player);
    }
  });

  // Main loop: show the player's realm / layer / phase / spirit on the
  // action bar, and automatically identify unidentified gongfa.
  system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
      const level = new PlayerLevel(player);
      if (level.getLevel().levelRef > 2) {
        player.addEffect("health_boost", 200, {
          amplifier: level.getLevel().levelRef * 4,
        });
      }
      const breakthroughs = level.breakthroughIfReady();
      for (const b of breakthroughs) {
        player.sendMessage(
          rawMessage`§e${t("sapi.playerlevel.breakthrough")}§r ${b.name}`,
        );
      }
      const data = level.getLevel();
      player.onScreenDisplay.setActionBar(
        rawMessage`${data.name} ${data.phase} ${data.spirit}/${data.spiritMax}`,
      );
      const result = autoIdentifyFirstGongFa(player);
      if (result.found) {
        player.sendMessage(
          result.def
            ? rawMessage`${t("sapi.gongfa.identify.step2")} ${t(result.def.nameKey)}`
            : t("sapi.gongfa.identify.done"),
        );
      }
      const pillResult = autoIdentifyFirstDanYao(player);
      if (pillResult.found) {
        player.sendMessage(
          pillResult.def
            ? rawMessage`${t("sapi.danyao.identify.done")} ${t(pillResult.def.nameKey)}`
            : t("sapi.danyao.identify.step1"),
        );
      }
    }
  }, AUTO_IDENTIFY_INTERVAL);
}

function showPutuanMenu(player: Player) {
  const form = new ActionFormData()
    .title(t("sapi.message.intoputuan.formtitle"))
    .button(t("sapi.message.intoputuan.startxiulian"))
    .button(t("sapi.message.intoputuan.gongfa"))
    .button(t("sapi.message.intoputuan.cultivategongfa"));
  form
    .show(player)
    .then((res) => {
      if (res.canceled || res.selection === undefined) return;
      if (res.selection === 0) {
        startCultivation(player);
      } else if (res.selection === 1) {
        showGongFaMenu(player, () => showPutuanMenu(player));
      } else if (res.selection === 2) {
        showCultivateGongFaMenu(player, () => showPutuanMenu(player));
      }
    })
    .catch(() => {});
}
