export enum TetrisPiece3Type {
  I = "I",
  O = "O",
  T = "T",
  S = "S",
  Z = "Z",
  J = "J",
  L = "L",
}

export type PieceOffset3 = [number, number, number];

export const TETRIS_PIECE_3_OFFSETS: Record<TetrisPiece3Type, PieceOffset3[]> =
  {
    [TetrisPiece3Type.I]: [
      [-1.5, 0, 0],
      [-0.5, 0, 0],
      [0.5, 0, 0],
      [1.5, 0, 0],
    ],
    [TetrisPiece3Type.O]: [
      [-0.5, 0, 0.5],
      [0.5, 0, 0.5],
      [-0.5, 0, -0.5],
      [0.5, 0, -0.5],
    ],
    [TetrisPiece3Type.T]: [
      [-1, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, -1],
    ],
    [TetrisPiece3Type.S]: [
      [-0.5, 0, 0],
      [0.5, 0, -1],
      [0.5, 0, 0],
      [-0.5, 0, 1],
    ],
    [TetrisPiece3Type.Z]: [
      [-0.5, 0, 0],
      [-0.5, 0, -1],
      [0.5, 0, 0],
      [0.5, 0, 1],
    ],
    [TetrisPiece3Type.J]: [
      [-1, 0, 1],
      [-1, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
    ],
    [TetrisPiece3Type.L]: [
      [1, 0, 1],
      [-1, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
    ],
  };

export const TETRIS_PIECE_3_CENTRAL_INDEX: Record<TetrisPiece3Type, number> = {
  [TetrisPiece3Type.I]: 1,
  [TetrisPiece3Type.O]: 0,
  [TetrisPiece3Type.T]: 1,
  [TetrisPiece3Type.S]: 2,
  [TetrisPiece3Type.Z]: 2,
  [TetrisPiece3Type.J]: 2,
  [TetrisPiece3Type.L]: 2,
};
