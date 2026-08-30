import { Player } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { GongFaProficiency, GongFaType } from "../config/gongfa";
import { LevelCore } from "./levelCore";
import { getGongFaName } from "../utils/gongfa";
import { rawMessage } from "../utils/message";
import { giveUniqueGongFaItem, removeGongFaItems } from "./gongFaItem";
import { isMeditating, setMeditating } from "./meditation";

const ProficiencyStageName: Record<GongFaProficiency, string> = {
  beginner: "初入门径",
  proficient: "融会贯通",
  master: "炉火纯青",
  world: "返璞归真",
};

export function showPutuanMenu(player: Player) {
  const form = new ActionFormData();
  form.title(rawMessage`§l蒲团`);
  form.body(rawMessage`§7于蒲团之上静心调息`);
  form.button(isMeditating(player) ? rawMessage`收功\n§8（停止打坐修炼）` : rawMessage`打坐修炼\n§8（吸收周围环境灵气）`);
  form.button(rawMessage`我的功法`);
  form.button(rawMessage`关闭`);
  form.show(player).then((r) => {
    if (r.canceled) return;
    if (r.selection === 0) {
      setMeditating(player, !isMeditating(player));
      showPutuanMenu(player);
      return;
    }
    if (r.selection === 1) showGongFaList(player);
  });
}

function showGongFaList(player: Player) {
  const all = LevelCore.getAllGongFaData(player);
  const ids = Object.keys(all) as GongFaType[];
  if (ids.length === 0) {
    rawActionBar(player, rawMessage`§7尚未习得任何功法`);
    showPutuanMenu(player);
    return;
  }
  const form = new ActionFormData();
  form.title(rawMessage`§l我的功法`);
  for (const id of ids) {
    const { gongFaData, playerP } = all[id];
    const stage = gongFaData.proficiency;
    const stageName =
      playerP >= stage.world.p
        ? ProficiencyStageName[GongFaProficiency.world]
        : playerP >= stage.master.p
          ? ProficiencyStageName[GongFaProficiency.master]
          : playerP >= stage.proficient.p
            ? ProficiencyStageName[GongFaProficiency.proficient]
            : ProficiencyStageName[GongFaProficiency.beginner];
    form.button(rawMessage`${getGongFaName(id)} §7[${stageName} ${Math.floor(playerP)}]`);
  }
  form.button(rawMessage`§7返回`);
  form.show(player).then((r) => {
    if (r.canceled) return;
    if (r.selection === ids.length) {
      showPutuanMenu(player);
      return;
    }
    const id = ids[r.selection!];
    if (id) showGongFaManage(player, id);
  });
}

function showGongFaManage(player: Player, id: GongFaType) {
  const name = getGongFaName(id);
  const form = new ActionFormData();
  form.title(rawMessage`§l${name}`);
  form.body(rawMessage`§7管理这本功法`);
  form.button(rawMessage`获取功法物品\n§8（唯一，锁定在背包）`);
  form.button(rawMessage`§c弃功\n§8（删除功法与物品）`);
  form.button(rawMessage`§7返回`);
  form.show(player).then((r) => {
    if (r.canceled) return;
    switch (r.selection) {
      case 0: {
        const given = giveUniqueGongFaItem(player, id);
        rawActionBar(
          player,
          given ? rawMessage`§a已发放功法物品：${name}` : rawMessage`§7已持有「${name}」功法物品`,
        );
        showGongFaManage(player, id);
        break;
      }
      case 1: {
        confirmRemoveGongFa(player, id, name);
        break;
      }
      default:
        showGongFaList(player);
    }
  });
}

function confirmRemoveGongFa(player: Player, id: GongFaType, name: ReturnType<typeof getGongFaName>) {
  const form = new MessageFormData();
  form.title(rawMessage`§l弃功`);
  form.body(rawMessage`确定舍弃「${name}」？\n§c熟练度与功法物品将被删除，无法恢复`);
  form.button2(rawMessage`确定弃功`);
  form.button1(rawMessage`再想想`);
  form.show(player).then((r) => {
    if (r.canceled || r.selection !== 1) return;
    LevelCore.removeGongFa(player, id);
    removeGongFaItems(player, id);
    rawActionBar(player, rawMessage`§c已舍弃功法「${name}」`);
    showGongFaList(player);
  });
}

function rawActionBar(player: Player, text: ReturnType<typeof rawMessage>) {
  try {
    player.onScreenDisplay.setActionBar(text);
  } catch (error) {
    console.error(error);
  }
}
