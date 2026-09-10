export enum TetrisPieceType {
  I = "I",
  O = "O",
  T = "T",
  S = "S",
  Z = "Z",
  J = "J",
  L = "L",
}

export type PieceOffset = [number, number];

export const TETRIS_PIECE_OFFSETS: Record<TetrisPieceType, PieceOffset[]> = {
  [TetrisPieceType.I]: [
    [-1.5, 0],
    [-0.5, 0],
    [0.5, 0],
    [1.5, 0],
  ],
  [TetrisPieceType.O]: [
    [-0.5, 0.5],
    [0.5, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ],
  [TetrisPieceType.T]: [
    [-1, 0],
    [0, 0],
    [1, 0],
    [0, -1],
  ],
  [TetrisPieceType.S]: [
    [-0.5, 0],
    [0.5, -1],
    [0.5, 0],
    [-0.5, 1],
  ],
  [TetrisPieceType.Z]: [
    [-0.5, 0],
    [-0.5, -1],
    [0.5, 0],
    [0.5, 1],
  ],
  [TetrisPieceType.J]: [
    [-1, 1],
    [-1, 0],
    [0, 0],
    [1, 0],
  ],
  [TetrisPieceType.L]: [
    [1, 1],
    [-1, 0],
    [0, 0],
    [1, 0],
  ],
};
