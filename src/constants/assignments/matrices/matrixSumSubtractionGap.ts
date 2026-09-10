import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

type Operation = "sum" | "subtraction";

interface MatrixSumSubtractionGapAssignmentProps {
  order: number;
  title?: string;
  matrixA: number[][];
  matrixB: number[][];
  operation: Operation;
  /** 1-indexed row/column of the single blank cell in the result matrix C. */
  gapRow: number;
  gapCol: number;
}

function elementWise(
  a: number[][],
  b: number[][],
  operation: Operation
): number[][] {
  return a.map((row, r) =>
    row.map((value, c) =>
      operation === "sum" ? value + b[r][c] : value - b[r][c]
    )
  );
}

function createMatrixSumSubtractionGapAssignment({
  order,
  title,
  matrixA,
  matrixB,
  operation,
  gapRow,
  gapCol,
}: MatrixSumSubtractionGapAssignmentProps): Assignment {
  const rowIndex = gapRow - 1;
  const colIndex = gapCol - 1;
  const matrixC = elementWise(matrixA, matrixB, operation);
  const targetValue = matrixC[rowIndex][colIndex];
  const operatorSymbol = operation === "sum" ? "+" : "−";

  return {
    id: `matrix-sum-subtraction-gap-${order}`,
    order,
    title: title || "Soma e Subtração com Lacuna",
    instructions: `Complete o elemento que falta em C = A ${operatorSymbol} B.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "matrix-fundamentals",
    setup() {
      const toReadonlyGrid = (values: number[][]) =>
        values.map(row => row.map(value => ({ value, editable: false })));

      const gridC = matrixC.map((row, r) =>
        row.map((value, c) => ({
          value: r === rowIndex && c === colIndex ? "" : value,
          editable: r === rowIndex && c === colIndex,
        }))
      );

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: toReadonlyGrid(matrixA),
        },
        {
          id: "matrix-b",
          label: "B",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: toReadonlyGrid(matrixB),
        },
        {
          id: "matrix-c",
          label: `C = A ${operatorSymbol} B`,
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: gridC,
        },
      ]);
    },
    validate() {
      const { getMatrixById } = useFillBlankMatrixInputStore.getState();
      const matrix = getMatrixById("matrix-c");
      if (!matrix) return false;

      const enteredValue = Number(matrix.matrixValue[rowIndex][colIndex].value);
      return enteredValue === targetValue;
    },
  };
}

const matrixSumSubtractionGapProps: Omit<
  MatrixSumSubtractionGapAssignmentProps,
  "order"
>[] = [
  // Nível 1: soma 2x2, lacuna no canto superior esquerdo
  {
    matrixA: [
      [2, 1],
      [3, 4],
    ],
    matrixB: [
      [1, 5],
      [2, 0],
    ],
    operation: "sum",
    gapRow: 1,
    gapCol: 1,
  },
  // Nível 1: soma 2x2, lacuna em outra posição
  {
    matrixA: [
      [5, 2],
      [1, 6],
    ],
    matrixB: [
      [3, 4],
      [7, 1],
    ],
    operation: "sum",
    gapRow: 2,
    gapCol: 2,
  },
  // Nível 2: subtração 2x2, resultado pode ser negativo
  {
    matrixA: [
      [3, 5],
      [8, 2],
    ],
    matrixB: [
      [6, 1],
      [4, 9],
    ],
    operation: "subtraction",
    gapRow: 2,
    gapCol: 2,
  },
  // Nível 2: soma 3x3
  {
    matrixA: [
      [1, 2, 3],
      [0, 4, 5],
      [6, 1, 2],
    ],
    matrixB: [
      [2, 0, 1],
      [3, 1, 2],
      [1, 4, 3],
    ],
    operation: "sum",
    gapRow: 2,
    gapCol: 3,
  },
  // Nível 3: subtração 3x3 com números negativos
  {
    matrixA: [
      [4, -2, 5],
      [-1, 3, 0],
      [2, -3, 6],
    ],
    matrixB: [
      [1, 3, -2],
      [4, -1, 5],
      [-3, 2, 1],
    ],
    operation: "subtraction",
    gapRow: 3,
    gapCol: 1,
  },
  // Nível 3: subtração 3x3 com decimais
  {
    matrixA: [
      [2.5, 1, -3],
      [0, 4.5, 2],
      [-1.5, 3, 0.5],
    ],
    matrixB: [
      [1, 2.5, -1],
      [3, 1, -0.5],
      [2, 0.5, 1.5],
    ],
    operation: "subtraction",
    gapRow: 1,
    gapCol: 3,
  },
];

export const matrixSumSubtractionGapAssignmentList =
  matrixSumSubtractionGapProps.map((props, index) =>
    createMatrixSumSubtractionGapAssignment({
      ...props,
      order: index + 1,
    })
  );
