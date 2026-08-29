import { BodyGongFa } from "./gongfa/body";
import { EarthGongFa } from "./gongfa/earth";
import { FireGongFa } from "./gongfa/fire";
import { MetalGongFa } from "./gongfa/metal";
import { NeutralGongFa } from "./gongfa/neutral";
import { WaterGongFa } from "./gongfa/water";
import { WoodGongFa } from "./gongfa/wood";
import type {
  GongFaBackendEvent,
  GongFaEnumType,
  GongFaEvent,
  GongFaExecUseEvent,
  GongFaProficiencyData,
  GongFaUseEvent,
} from "./gongfa/types";

export const GongFaEnum = {
  ...MetalGongFa,
  ...WoodGongFa,
  ...WaterGongFa,
  ...FireGongFa,
  ...EarthGongFa,
  ...BodyGongFa,
  ...NeutralGongFa,
} satisfies {
  [key: string]: GongFaEnumType;
};
export { GongFaProficiency } from "./gongfa/types";
export type {
  GongFaBackendEvent,
  GongFaEvent,
  GongFaExecUseEvent,
  GongFaProficiencyData,
  GongFaUseEvent,
} from "./gongfa/types";
export type { GongFaEnumType } from "./gongfa/types";
export type GongFaType = keyof typeof GongFaEnum;
