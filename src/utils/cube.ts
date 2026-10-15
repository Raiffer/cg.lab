import { TCube } from "@/store/scene3DStore";
import {
  TETRIS_PIECE_3_CENTRAL_INDEX,
  TETRIS_PIECE_3_OFFSETS,
  TetrisPiece3Type,
} from "@/types/TetrisPiece3d";
import { Vector3 } from "three";

export function createTetrisPiece3(
  id: string,
  color: string,
  position: Vector3,
  pieceType: TetrisPiece3Type,
  size: Vector3,
  movable = false
): TCube[] {
  const centralIndex = TETRIS_PIECE_3_CENTRAL_INDEX[pieceType];

  return TETRIS_PIECE_3_OFFSETS[pieceType].map(
    ([offsetX, offsetY, offsetZ], index) => ({
      id: `${id}-${index + 1}`,
      groupId: id,
      isCentral: index === centralIndex,
      position: position
        .clone()
        .add(new Vector3(offsetX * size.x, offsetY * size.y, offsetZ * size.z)),
      size: size.clone(),
      scale: new Vector3(1, 1, 1),
      rotation: new Vector3(0, 0, 0),
      translation: new Vector3(0, 0, 0),
      color,
      interaction: movable
        ? { mode: "move", allowModeSwitch: false }
        : { mode: "none", allowModeSwitch: false },
    })
  );
}
