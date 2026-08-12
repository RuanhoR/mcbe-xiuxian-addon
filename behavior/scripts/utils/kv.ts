import type { ItemStack, Player, World } from "@minecraft/server";
export type Value = number | string | boolean | object;
export class KV {
  constructor(private _kvSource: World | Player | ItemStack) {}
  public get<T extends Value>(key: string, defaultValue: Value): T {
    let parsed = defaultValue as string | number | boolean;
    let isJSON: boolean = false;
    let needWrite: boolean = false;
    const old = this._kvSource.getDynamicProperty(key);
    if (!old || typeof old !== typeof defaultValue) needWrite = true;
    if (typeof defaultValue == "object") {
      isJSON = true;
      parsed = JSON.stringify(parsed);
    }
    if (needWrite) {
      this._kvSource.setDynamicProperty(key, parsed);
    }
    let current = this._kvSource.getDynamicProperty(key);
    if (isJSON && typeof current == "string") current = JSON.parse(current);
    return current as T;
  }
  public set(key: string, value: Value) {
    this._kvSource.setDynamicProperty(
      key,
      typeof value == "object" ? JSON.stringify(value) : value,
    );
  }
  public totalByte() {
    return this._kvSource.getDynamicPropertyTotalByteCount;
  }
  public idList() {
    return this._kvSource.getDynamicPropertyIds;
  }
}
