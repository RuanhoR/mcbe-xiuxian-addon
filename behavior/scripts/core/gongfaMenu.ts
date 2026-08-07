import { ItemStack, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import {
  AddonItem,
  GONGFA_MASTERY_KEYS,
  GONGFA_MAX_SLOTS,
} from "../config";
import { consumeMainhand, getMainhand, rawMessage, t } from "../utils";
import {
  cultivateGongFaItem,
  findIdentifiedGongfaInInventory,
  getCultivateCost,
  getGongFaDef,
  getGongFaItemState,
  GongFaItemState,
  GongFaLearn,
  GongFaMastery,
  parseIdentified,
} from "./gongfa";
import { PlayerLevel } from "./playerLevel";

/**
 * GongFa menus, opened from the meditation cushion (蒲团) menu.
 * - Learn an identified gongfa held in the main hand.
 * - Cultivate an identified gongfa found in the backpack.
 * - Cultivate / withdraw a learned (slot-bound) gongfa.
 */

/** Show a form and run `onSelect` only when the player picks a button. */
function open(
  player: Player,
  form: ActionFormData,
  onSelect: (index: number) => void,
): void {
  form
    .show(player)
    .then((res) => {
      if (res.canceled || res.selection === undefined) return;
      onSelect(res.selection);
    })
    .catch(() => {});
}

/** Menu for cultivating identified gongfa found in the player's backpack. */
export function showCultivateGongFaMenu(
  player: Player,
  onBack?: () => void,
): void {
  const items = findIdentifiedGongfaInInventory(player);
  if (items.length === 0) {
    player.sendMessage(t("sapi.message.gongfa.cultivate.empty"));
    onBack?.();
    return;
  }
  const form = new ActionFormData().title(
    t("sapi.message.gongfa.cultivate.title"),
  );
  const actions: Array<() => void> = [];
  for (const { index, item } of items) {
    const identified = parseIdentified(item);
    const def = identified ? getGongFaDef(identified.id) : undefined;
    if (!identified || !def) continue;
    const maxed = identified.mastery >= GongFaMastery.Grandmaster;
    const cost = maxed ? 0 : getCultivateCost(identified.levelRef, identified.mastery);
    form.button(
      rawMessage`§b${t(def.nameKey)}§r §7[${t(
        GONGFA_MASTERY_KEYS[identified.mastery],
      )}]§r${maxed ? "" : rawMessage` §7(${t("sapi.message.gongfa.detail.cost")} ${cost})§r`}`,
    );
    actions.push(() => doCultivateItem(player, index, onBack));
  }
  form.button(t("sapi.message.gongfa.menu.back"));
  actions.push(() => onBack?.());
  open(player, form, (selection) => actions[selection]?.());
}

/** Cultivate one identified gongfa item from the backpack. */
function doCultivateItem(player: Player, index: number, onBack?: () => void): void {
  const result = cultivateGongFaItem(player, index);
  switch (result.status) {
    case "success":
      player.sendMessage(
        rawMessage`${t("sapi.gongfa.cultivate.success")} ${result.def ? t(result.def.nameKey) : ""} ${t(
          GONGFA_MASTERY_KEYS[result.mastery!],
        )}`,
      );
      showCultivateGongFaMenu(player, onBack);
      break;
    case "maxed":
      player.sendMessage(t("sapi.gongfa.cultivate.maxed"));
      showCultivateGongFaMenu(player, onBack);
      break;
    case "notenough":
      player.sendMessage(
        rawMessage`${t("sapi.gongfa.cultivate.notenough")} (${t(
          "sapi.message.gongfa.detail.cost",
        )} ${result.cost})`,
      );
      showCultivateGongFaMenu(player, onBack);
      break;
    case "notfound":
      player.sendMessage(t("sapi.gongfa.learn.fail"));
      showCultivateGongFaMenu(player, onBack);
      break;
  }
}

/** Main gongfa management menu. */
export function showGongFaMenu(player: Player, onBack?: () => void): void {
  const learn = new GongFaLearn(player);
  const form = new ActionFormData().title(t("sapi.message.gongfa.menu.title"));
  const actions: Array<() => void> = [];

  // Learn the identified gongfa carried in the main hand.
  const mainhand = getMainhand(player);
  if (mainhand && getGongFaItemState(mainhand) === GongFaItemState.Identified) {
    form.button(t("sapi.message.gongfa.menu.learn"));
    actions.push(() => learnFromMainhand(player, onBack));
  }

  // Each learned gongfa (by skill slot) opens its detail menu.
  for (let slot = 0; slot < GONGFA_MAX_SLOTS; slot++) {
    const learned = learn.getBySlot(slot);
    if (!learned) continue;
    const def = getGongFaDef(learned.id);
    const name = def ? t(def.nameKey) : learned.id;
    form.button(
      rawMessage`§b${name}§r §7[${t(GONGFA_MASTERY_KEYS[learned.mastery])}]§r`,
    );
    actions.push(() => showGongFaDetailMenu(player, slot, onBack));
  }

  form.button(t("sapi.message.gongfa.menu.back"));
  actions.push(() => onBack?.());

  open(player, form, (index) => actions[index]?.());
}

/** Detail menu for a single learned gongfa (cultivate / withdraw). */
function showGongFaDetailMenu(
  player: Player,
  slot: number,
  onBack?: () => void,
): void {
  const learned = new GongFaLearn(player).getBySlot(slot);
  if (!learned) {
    player.sendMessage(t("sapi.gongfa.xidei.empty"));
    showGongFaMenu(player, onBack);
    return;
  }
  const def = getGongFaDef(learned.id);
  const name = def ? t(def.nameKey) : learned.id;
  const spirit = new PlayerLevel(player).getLevel().spirit;
  const maxed = learned.mastery >= GongFaMastery.Grandmaster;
  const cost = maxed ? 0 : getCultivateCost(learned.levelRef, learned.mastery);

  const form = new ActionFormData()
    .title(rawMessage`§b${name}§r`)
    .body(
      rawMessage`${t("sapi.message.gongfa.detail.mastery")} ${t(
        GONGFA_MASTERY_KEYS[learned.mastery],
      )}\n${t("sapi.message.gongfa.detail.spirit")} ${spirit}`,
    );
  const actions: Array<() => void> = [];

  if (!maxed) {
    form.button(
      rawMessage`${t("sapi.message.gongfa.detail.cultivate")} (${t(
        "sapi.message.gongfa.detail.cost",
      )} ${cost})`,
    );
    actions.push(() => cultivateGongFa(player, slot, onBack));
  } else {
    form.button(t("sapi.message.gongfa.detail.maxed"));
    actions.push(() => {});
  }

  form.button(t("sapi.message.gongfa.detail.withdraw"));
  actions.push(() => withdrawGongFa(player, slot, onBack));

  form.button(t("sapi.message.gongfa.menu.back"));
  actions.push(() => showGongFaMenu(player, onBack));

  open(player, form, (index) => actions[index]?.());
}

/** Learn the identified gongfa currently held in the main hand. */
function learnFromMainhand(player: Player, onBack?: () => void): void {
  const mainhand = getMainhand(player);
  if (!mainhand || mainhand.typeId !== AddonItem.GongFa) {
    player.sendMessage(t("sapi.gongfa.learn.fail"));
    showGongFaMenu(player, onBack);
    return;
  }
  const learn = new GongFaLearn(player);
  if (learn.isFull()) {
    player.sendMessage(t("sapi.gongfa.learn.full"));
    showGongFaMenu(player, onBack);
    return;
  }
  const learned = learn.learnFromItem(mainhand);
  if (!learned) {
    player.sendMessage(t("sapi.gongfa.learn.fail"));
    showGongFaMenu(player, onBack);
    return;
  }
  const def = getGongFaDef(learned.id);
  consumeMainhand(player);
  player.sendMessage(
    rawMessage`${t("sapi.gongfa.learn.success")} ${def ? t(def.nameKey) : ""}`,
  );
  showGongFaMenu(player, onBack);
}

/** Advance a learned gongfa's mastery by spending spirit. */
function cultivateGongFa(
  player: Player,
  slot: number,
  onBack?: () => void,
): void {
  const result = new GongFaLearn(player).cultivate(slot);
  const learned = result.learned;
  const name = learned ? getGongFaDef(learned.id)?.nameKey : undefined;
  switch (result.status) {
    case "success":
      player.sendMessage(
        rawMessage`${t("sapi.gongfa.cultivate.success")} ${name ? t(name) : ""} ${t(
          GONGFA_MASTERY_KEYS[learned!.mastery],
        )}`,
      );
      showGongFaDetailMenu(player, slot, onBack);
      break;
    case "maxed":
      player.sendMessage(t("sapi.gongfa.cultivate.maxed"));
      showGongFaDetailMenu(player, slot, onBack);
      break;
    case "notenough":
      player.sendMessage(
        rawMessage`${t("sapi.gongfa.cultivate.notenough")} (${t(
          "sapi.message.gongfa.detail.cost",
        )} ${result.cost})`,
      );
      showGongFaDetailMenu(player, slot, onBack);
      break;
    case "notfound":
      player.sendMessage(t("sapi.gongfa.xidei.empty"));
      showGongFaMenu(player, onBack);
      break;
  }
}

/** Withdraw a learned gongfa as a skill-slot item. */
function withdrawGongFa(
  player: Player,
  slot: number,
  onBack?: () => void,
): void {
  const item = new GongFaLearn(player).withdraw(slot);
  if (!item) {
    player.sendMessage(t("sapi.gongfa.xidei.empty"));
    showGongFaMenu(player, onBack);
    return;
  }
  const leftover = player.addItem(item);
  if (leftover) player.dimension.spawnItem(leftover, player.location);
  player.sendMessage(rawMessage`${t("sapi.gongfa.xidei.withdraw")} ${slot + 1}`);
  showGongFaDetailMenu(player, slot, onBack);
}

// Re-export for callers that need the item type.
export type { ItemStack };
