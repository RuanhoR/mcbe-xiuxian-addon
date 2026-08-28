import z from "zod";
import { GongFaEnum, GongFaType } from "./config/gongfa";
import { levelMaxLayer } from "./config";

export const schemas = [
  z.object({
    // 等级层数
    p: z.number(),
    // 等级
    lr: z.union(
      (Object.keys(levelMaxLayer) as `${keyof typeof levelMaxLayer}`[]).map(
        (r) => z.literal(Number(r)),
      ) as z.ZodLiteral<keyof typeof levelMaxLayer>[],
    ),
    // 现存灵力
    spirit: z.number(),

    // 功法
    g: z.record(
      // 功法id
      z.enum(Object.keys(GongFaEnum) as GongFaType[]),
      // 熟练度
      z.number(),
    ),

    // 灵根
    tr: z.object({
      // 灵根属性，0 = 金 1 = 木 2 = 水 3 = 火 4= 土 5 = 无
      arr: z.array(
        z.union([
          z.literal(0),
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.literal(4),
          z.literal(5),
        ]),
      ),
    }),
  }),
];
function _verify<_, T extends z.ZodObject>(data: unknown, schema: T) {
  let d = data;
  if (typeof d == "string") {
    try {
      d = JSON.parse(d as string);
    } catch {
      d = {};
    }
  }
  return schema.safeParse(d);
}
export function verifyPlayerLevelData(data: unknown) {
  return _verify(data, schemas[0]);
}
export type PlayerLevelDataType = z.infer<(typeof schemas)[0]>;
