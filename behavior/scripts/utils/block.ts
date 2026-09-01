import { Direction, Vector3 } from "@minecraft/server";

export function getPositionInDirection(pos: Vector3, face: Direction): Vector3 {
  const result: Vector3 = { ...pos };
  switch (face) {
    case Direction.Down:
      result.y -= 1;
      break;
    case Direction.Up:
      result.y += 1;
      break;
    case Direction.North:
      result.z -= 1;
      break;
    case Direction.South:
      result.z += 1;
      break;
    case Direction.West:
      result.x -= 1;
      break;
    case Direction.East:
      result.x += 1;
      break;
    default:
      return result;
  }

  return result;
}
