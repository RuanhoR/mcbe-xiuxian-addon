import {
  EntityComponentTypes,
  EquipmentSlot,
  ItemStack,
  Player,
} from "@minecraft/server";
export function getMainhand(player: Player) {
  return player
    .getComponent(EntityComponentTypes.Equippable)
    ?.getEquipment(EquipmentSlot.Mainhand);
}
export function setMainhand(player: Player, item: ItemStack | undefined) {
  player
    .getComponent(EntityComponentTypes.Equippable)
    ?.setEquipment(EquipmentSlot.Mainhand, item);
}
export function consumeMainhand(player: Player, count = 1) {
  const current = getMainhand(player);
  if (!current) return;
  const remaining = current.amount - count;
  if (remaining <= 0) {
    setMainhand(player, undefined);
  } else {
    current.amount = remaining;
    setMainhand(player, current);
  }
}
