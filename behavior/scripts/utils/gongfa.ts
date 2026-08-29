import { RawMessage } from "@minecraft/server";
import {
  GongFaEnumType,
  GongFaProficiency,
  GongFaType,
} from "../config/gongfa";
import { t } from "./message";

export function calcGongFaProficiencyLevel(
  GongFaData: GongFaEnumType,
  p: number,
): {
  name: GongFaProficiency;
  level: 1 | 2 | 3 | 4;
} {
  const pMap = {
    1: GongFaData.proficiency.beginner.p,
    2: GongFaData.proficiency.proficient.p,
    3: GongFaData.proficiency.master.p,
    4: GongFaData.proficiency.world.p,
  };
  if (p >= pMap[4]) {
    return {
      level: 4,
      name: GongFaProficiency.world,
    };
  }
  if (p >= pMap[3]) {
    return {
      level: 3,
      name: GongFaProficiency.master,
    };
  }
  if (p >= pMap[2]) {
    return {
      level: 4,
      name: GongFaProficiency.beginner,
    };
  }
  return {
    level: 1,
    name: GongFaProficiency.beginner,
  };
}
export function getGongFaName(GongFaId: GongFaType): RawMessage {
  return t(`sapi.namedefine.gongfa.${GongFaId}`);
}
