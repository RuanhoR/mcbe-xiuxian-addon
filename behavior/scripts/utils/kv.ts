import type { ItemStack, Player, World } from "@minecraft/server";
export type Value = number | string | boolean | object;
export class KV {
  constructor(private _kvSource: World | Player | ItemStack) {}
  /**
   * 仅在键不存在（undefined）时写入默认值并返回之；
   * 存储值为 falsy（0/false/""）不会触发回写，对象默认值也不会覆写已存数据。
   */
  public get<T extends Value>(key: string, defaultValue: Value): T {
    const old = this._kvSource.getDynamicProperty(key);
    if (old === undefined) {
      const initial =
        typeof defaultValue === "object"
          ? JSON.stringify(defaultValue)
          : defaultValue;
      this._kvSource.setDynamicProperty(key, initial);
      return defaultValue as T;
    }
    if (typeof defaultValue === "object") {
      if (typeof old !== "string") return defaultValue as T;
      return JSON.parse(old) as T;
    }
    return old as T;
  }
  public set(key: string, value: Value): void {
    this._kvSource.setDynamicProperty(
      key,
      typeof value == "object" ? JSON.stringify(value) : value,
    );
  }
  public totalByte(): number {
    return this._kvSource.getDynamicPropertyTotalByteCount();
  }
  public idList(): string[] {
    return this._kvSource.getDynamicPropertyIds();
  }
}
