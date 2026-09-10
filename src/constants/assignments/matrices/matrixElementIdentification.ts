import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { shuffleArray } from "@/utils";

const SUBSCRIPT_DIGITS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

function toSubscript(n: number): string {
  return String(n)
    .split("")
    .map(digit => SUBSCRIPT_DIGITS[Number(digit)])
    .join("");
}

/** Picks 3 wrong-answer candidates from the SAME row and column as the
 * target cell, so a wrong guess actually reveals which index the student
 * missed (right row/wrong column, or right column/wrong row) instead of
 * a random unrelated number. */
function pickDistractors(
  matrixValues: number[][],
  rowIndex: number,
  colIndex: number,
  target: number
): number[] {
  const rowOthers = matrixValues[rowIndex].filter((_, c) => c !== colIndex);
  const colOthers = matrixValues
    .map(row => row[colIndex])
    .filter((_, r) => r !== rowIndex);

  const candidates = [...rowOthers.slice(0, 2), ...colOthers.slice(0, 1)];

  const distractors: number[] = [];
  for (const value of candidates) {
    if (value !== target && !distractors.includes(value)) {
      distractors.push(value);
    }
  }

  // Fallback in the unlikely case duplicate values collided above.
  if (distractors.length < 3) {
    for (const value of matrixValues.flat()) {
      if (distractors.length >= 3) break;
      if (value !== target && !distractors.includes(value)) {
        distractors.push(value);
      }
    }
  }

  return distractors.slice(0, 3);
}

interface MatrixElementIdentificationAssignmentProps {
  order: number;
  title?: string;
  matrixValues: number[][];
  /** 1-indexed row/column, matching the a_ij notation shown to the student. */
  targetRow: number;
  targetCol: number;
}

function createMatrixElementIdentificationAssignment({
  order,
  title,
  matrixValues,
  targetRow,
  targetCol,
}: MatrixElementIdentificationAssignmentProps): Assignment {
  const rowIndex = targetRow - 1;
  const colIndex = targetCol - 1;
  const targetValue = matrixValues[rowIndex][colIndex];
  const elementNotation = `a${toSubscript(targetRow)}${toSubscript(targetCol)}`;

  const options: TOption[] = shuffleArray([
    { id: "correct", value: String(targetValue), correct: true },
    ...pickDistractors(matrixValues, rowIndex, colIndex, targetValue).map(
      (value, index) => ({
        id: `distractor-${index}`,
        value: String(value),
        correct: false,
      })
    ),
  ]);

  return {
    id: `matrix-element-identification-${order}`,
    order,
    title: title || "Identificação de Posição",
    instructions: `Qual é o valor do elemento ${elementNotation} (linha ${targetRow}, coluna ${targetCol}) de A?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "matrix-fundamentals",
    setup() {
      // The full matrix stays visible — this exercise tests reading the
      // right row/column, not calculating anything, so nothing is hidden.
      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: matrixValues.map(row =>
            row.map(value => ({ value, editable: false }))
          ),
        },
      ]);

      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor de ${elementNotation} é {resposta}`);
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      if (!answer) return false;
      return answer.correct;
    },
  };
}

const matrixElementIdentificationProps: Omit<
  MatrixElementIdentificationAssignmentProps,
  "order"
>[] = [
  // Nível 1: matriz simples, posição no início da matriz
  {
    matrixValues: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
    targetRow: 1,
    targetCol: 1,
  },
  // Nível 1: posição no meio da matriz
  {
    matrixValues: [
      [2, 4, 6],
      [1, 3, 5],
      [8, 7, 9],
    ],
    targetRow: 2,
    targetCol: 3,
  },
  // Nível 2: exatamente o exemplo clássico a₃₂
  {
    matrixValues: [
      [5, 1, 0],
      [2, 8, 4],
      [9, 6, 3],
    ],
    targetRow: 3,
    targetCol: 2,
  },
  // Nível 2: valores negativos
  {
    matrixValues: [
      [-3, 7, 2],
      [4, -1, 9],
      [0, 5, -6],
    ],
    targetRow: 1,
    targetCol: 3,
  },
  // Nível 3: valores decimais, posição menos óbvia
  {
    matrixValues: [
      [1.5, -2, 4],
      [3, 0.5, -7],
      [-4.5, 6, 2],
    ],
    targetRow: 3,
    targetCol: 3,
  },
];

export const matrixElementIdentificationAssignmentList =
  matrixElementIdentificationProps.map((props, index) =>
    createMatrixElementIdentificationAssignment({
      ...props,
      order: index + 1,
    })
  );
