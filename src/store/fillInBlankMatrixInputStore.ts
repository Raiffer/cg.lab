import { create } from "zustand";

export enum MatrixType {
  IDENTITY = "identity",
  TRANSLATION = "translation",
  SCALING = "scaling",
  ROTATION_X = "rotation_x",
  ROTATION_Y = "rotation_y",
  ROTATION_Z = "rotation_z",
}

export interface MatrixValue {
  value: number | string;
  editable: boolean;
}

export interface Matrix {
  id: string;
  type: MatrixType;
  dimention: "2D" | "3D";
  matrixValue: MatrixValue[][];
  pointRefId?: string;
  polygonRefId?: string;
  polygonRefIds?: string[];
  objectRefId?: string;
}

interface FillBlankMatrixInputStore {
  matrices: Matrix[];
  addMatrix: (matrix: Matrix) => void;
  setMatrices: (matrices: Matrix[]) => void;
  changeMatrixValue: (
    id: string,
    row: number,
    col: number,
    value: number | string
  ) => void;
  getMatrixById: (id: string) => Matrix | undefined;
  reset: () => void;
}

const initialState = {
  matrices: [],
};

export const useFillBlankMatrixInputStore = create<FillBlankMatrixInputStore>(
  (set, get) => ({
    ...initialState,
    addMatrix: (matrix: Matrix) => {
      set(state => ({
        matrices: [...state.matrices, matrix],
      }));
    },
    setMatrices: (matrices: Matrix[]) => {
      set({ matrices });
    },
    changeMatrixValue: (
      id: string,
      row: number,
      col: number,
      value: number | string
    ) => {
      set(state => {
        const matrix = state.matrices.find(matrix => matrix.id === id);
        if (!matrix) return state;
        const newMatrix = matrix.matrixValue.map((r, i) =>
          r.map((cell, j) =>
            i === row && j === col ? { ...cell, value } : cell
          )
        );
        return {
          matrices: state.matrices.map(matrix =>
            matrix.id === id ? { ...matrix, matrixValue: newMatrix } : matrix
          ),
        };
      });
    },
    getMatrixById: (id: string) => {
      return get().matrices.find(matrix => matrix.id === id);
    },
    reset: () => {
      set({ ...initialState });
    },
  })
);
