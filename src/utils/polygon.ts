import { TPolygon } from "@/types/Scene2DConfig";
import { TETRIS_PIECE_OFFSETS, TetrisPieceType } from "@/types/TetrisPiece";

export function createSquare(
  id: string,
  color: string,
  position: [number, number],
  size: [number, number],
  movable = false,
  fullMovable = false
): TPolygon {
  return {
    id,
    color,
    fullMovable,
    points: generateSquarePoints(position, size).map((point, index) => ({
      id: `${id}-${String.fromCharCode(65 + index)}`,
      position: point,
      movable: fullMovable ? false : movable,
    })),
  };
}

export function createTetrisPiece(
  id: string,
  color: string,
  position: [number, number],
  pieceType: TetrisPieceType,
  size: [number, number]
): TPolygon[] {
  const [a, b] = position;
  const [width, height] = size;

  return TETRIS_PIECE_OFFSETS[pieceType].map(([offsetX, offsetY], index) =>
    createSquare(
      `${id}-${index + 1}`,
      color,
      [a + offsetX * width, b + offsetY * height],
      size
    )
  );
}

function generateSquarePoints(
  center: [number, number],
  size: [number, number]
): [number, number][] {
  const [cx, cy] = center;
  const [width, height] = size;
  const halfW = width / 2;
  const halfH = height / 2;

  const points: [number, number][] = [
    [cx - halfW, cy - halfH], // Bottom-left
    [cx + halfW, cy - halfH], // Bottom-right
    [cx + halfW, cy + halfH], // Top-right
    [cx - halfW, cy + halfH], // Top-left
  ];

  return points.map(([x, y]) => [roundToHalf(x), roundToHalf(y)]);
}

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
