import type { RawMessage } from "@minecraft/server";
export function rawMessage(...args: unknown[]): { rawtext: RawMessage[] } {
  const convert = (arg: unknown): RawMessage => {
    if (typeof arg === "string") return { text: arg };
    if (typeof arg === "number" || typeof arg === "boolean")
      return { text: String(arg) };
    if (arg === null || arg === undefined) return { text: "" };
    if (
      (typeof arg === "object" && (arg as RawMessage).text !== undefined) ||
      (arg as RawMessage).translate !== undefined ||
      (arg as RawMessage).rawtext !== undefined
    ) {
      return { ...arg } as RawMessage;
    }
    if (Array.isArray(arg)) {
      return { rawtext: arg.map((item) => convert(item)) };
    }
    try {
      return { text: JSON.stringify(arg) };
    } catch {
      return { text: "[Object]" };
    }
  };
  const firstArg = args[0];
  if (Array.isArray(firstArg) && "raw" in firstArg) {
    const strings = firstArg as TemplateStringsArray;
    const substitutions = args.slice(1);
    const result: RawMessage[] = [];

    for (let i = 0; i < strings.length; i++) {
      result.push({ text: strings[i] });
      if (i < substitutions.length) {
        result.push(convert(substitutions[i]));
      }
    }
    return { rawtext: result };
  }
  return {
    rawtext: args.map(convert),
  };
}
export function t(t: string): RawMessage {
  return {
    translate: t,
  };
}
/**
 * RawMessage → 纯文本（递归展开 rawtext）。
 * 用于只接受 string 的 API（如 ItemStack.nameTag、button 快捷拼接）。
 */
export function rawToText(msg: RawMessage): string {
  if (typeof msg === "string") return msg;
  if (msg.text !== undefined) return msg.text;
  if (msg.translate !== undefined) return msg.translate;
  if (msg.rawtext) return msg.rawtext.map(rawToText).join("");
  return "";
}
