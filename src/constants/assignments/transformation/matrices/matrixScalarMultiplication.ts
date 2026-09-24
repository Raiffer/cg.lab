import {
  Matrix,
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import {
  Option,
  useFillInMatrixWithOptionsStore,
} from "@/store/fillInMatrixWithOptions";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { shuffleArray } from "@/utils";

/**
 * "Multiplicação por escalar" — 6 exercícios, k · A (multiplicar todo
 * elemento de A pelo mesmo número k). Sem plano cartesiano (`hideCanvas:
 * true`): escalar-vezes-matriz já tem sua versão geométrica no módulo
 * "Matriz de Escala" (aplicar a matriz numa forma na cena). Aqui o foco é a
 * mecânica abstrata — A é uma matriz numérica qualquer, não necessariamente
 * uma matriz de transformação — então usamos o mesmo cartão branco
 * centralizado da Identificação de Posição / Soma e Subtração.
 *
 * Progressão de dificuldade:
 *   1  2x2, lacuna única, k inteiro positivo
 *   2  2x3 retangular, lacuna única, k negativo (introduz troca de sinal)
 *   3  3x3, TODAS as células
 *   4  3x3, múltipla escolha com distratores "armadilha" (esqueceu o sinal,
 *      somou k em vez de multiplicar)
 *   5  ao contrário: mostra A e k·A, pergunta qual foi o valor de k
 *   6  a mais difícil: 3x4 com decimais, preencher 3 posições calculadas em
 *      ordem (igual à Soma de matrizes nível 4)
 */

type Grid = number[][];
type Position = [number, number];

const SUBSCRIPT_DIGITS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

function toSubscript(n: number): string {
  return String(n)
    .split("")
    .map(digit => SUBSCRIPT_DIGITS[Number(digit)])
    .join("");
}

/** Notação a_ij com linha/coluna 1-indexadas, ex.: notation(3, 2) => "a₃₂". */
function notation(row: number, col: number): string {
  return `a${toSubscript(row)}${toSubscript(col)}`;
}

/** Avoids "-0" ever reaching a cell — cosmetic only, doesn't change value. */
function cleanZero(value: number): number {
  return value === 0 ? 0 : value;
}

function scalarMultiply(matrixA: Grid, scalar: number): Grid {
  return matrixA.map(row => row.map(value => cleanZero(scalar * value)));
}

function readonlyDisplayMatrix(id: string, label: string, values: Grid): Matrix {
  return {
    id,
    label,
    type: MatrixType.IDENTITY,
    dimention: "2D",
    matrixValue: values.map(row =>
      row.map(value => ({ value, editable: false }))
    ),
  };
}

const baseAssignment = (order: number) => ({
  id: `matrix-scalar-multiplication-${order}`,
  order,
  title: "Multiplicação por escalar",
  assisted: false,
  hideCanvas: true,
  subjectCategory: "multiplication" as const,
});

/** Reads the selected multiple-choice option and trusts its `.correct` flag. */
function validateOptions(): boolean {
  const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
  const answer = selectedOptions["resposta"];
  return answer ? answer.correct : false;
}

// ---------------------------------------------------------------------------
// Kind 1 — uma lacuna só; o aluno digita o valor que falta em k · A.
// ---------------------------------------------------------------------------
function createSingleGapAssignment(
  order: number,
  matrixA: Grid,
  scalar: number,
  gapRow: number,
  gapCol: number
): Assignment {
  const r = gapRow - 1;
  const c = gapCol - 1;
  const matrixKA = scalarMultiply(matrixA, scalar);
  const targetValue = matrixKA[r][c];

  return {
    ...baseAssignment(order),
    instructions: `Complete o elemento que falta em ${scalar} · A.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        {
          id: "matrix-ka",
          label: `${scalar} · A`,
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: matrixKA.map((row, i) =>
            row.map((value, j) => ({
              value: i === r && j === c ? "" : value,
              editable: i === r && j === c,
            }))
          ),
        },
      ]);
    },
    validate() {
      const matrix = useFillBlankMatrixInputStore
        .getState()
        .getMatrixById("matrix-ka");
      if (!matrix) return false;
      const raw = matrix.matrixValue[r][c].value;
      if (raw === "" || Number.isNaN(Number(raw))) return false;
      return Number(raw) === targetValue;
    },
  };
}

// ---------------------------------------------------------------------------
// Kind 2 — a matriz k·A inteira fica vazia; o aluno calcula e digita todas
// as células.
// ---------------------------------------------------------------------------
function createFullResultAssignment(
  order: number,
  matrixA: Grid,
  scalar: number
): Assignment {
  const matrixKA = scalarMultiply(matrixA, scalar);

  return {
    ...baseAssignment(order),
    instructions: `Calcule ${scalar} · A e preencha todas as células.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        {
          id: "matrix-ka",
          label: `${scalar} · A`,
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: matrixKA.map(row =>
            row.map(() => ({ value: "", editable: true }))
          ),
        },
      ]);
    },
    validate() {
      const matrix = useFillBlankMatrixInputStore
        .getState()
        .getMatrixById("matrix-ka");
      if (!matrix) return false;
      return matrixKA.every((row, i) =>
        row.every((expected, j) => {
          const raw = matrix.matrixValue[i][j].value;
          if (raw === "" || Number.isNaN(Number(raw))) return false;
          return Number(raw) === expected;
        })
      );
    },
  };
}

// ---------------------------------------------------------------------------
// Kind 3 — múltipla escolha para 1 célula de k·A, com distratores que
// reproduzem erros comuns (esqueceu o sinal, somou k em vez de multiplicar).
// ---------------------------------------------------------------------------
function createSingleCellChoiceAssignment(
  order: number,
  matrixA: Grid,
  scalar: number,
  targetRow: number,
  targetCol: number,
  distractorValues: number[]
): Assignment {
  const r = targetRow - 1;
  const c = targetCol - 1;
  const matrixKA = scalarMultiply(matrixA, scalar);
  const targetValue = matrixKA[r][c];
  const el = notation(targetRow, targetCol);

  const options: TOption[] = shuffleArray([
    { id: "correct", value: String(targetValue), correct: true },
    ...distractorValues.map((value, index) => ({
      id: `distractor-${index}`,
      value: String(value),
      correct: false,
    })),
  ]);

  return {
    ...baseAssignment(order),
    instructions: `Observe A. Qual é o valor do elemento ${el} de ${scalar} · A?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore
        .getState()
        .setMatrices([readonlyDisplayMatrix("matrix-a", "A", matrixA)]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor de ${el} em ${scalar} · A é {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 4 — ao contrário: mostra A e B = k·A (já calculada), pergunta qual
// foi o valor de k.
// ---------------------------------------------------------------------------
function createFindScalarAssignment(
  order: number,
  matrixA: Grid,
  scalar: number,
  distractorScalars: number[]
): Assignment {
  const matrixKA = scalarMultiply(matrixA, scalar);

  const options: TOption[] = shuffleArray([
    { id: "correct", value: String(scalar), correct: true },
    ...distractorScalars.map((value, index) => ({
      id: `distractor-${index}`,
      value: String(value),
      correct: false,
    })),
  ]);

  return {
    ...baseAssignment(order),
    instructions: `B foi obtida multiplicando todo elemento de A por um número k (B = k · A). Qual é o valor de k?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-ka", "B = k · A", matrixKA),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor de k é {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 5 — o aluno LEVA valores calculados para VÁRIAS células ao mesmo
// tempo. Clicar numa opção sempre preenche a primeira lacuna encontrada ao
// varrer a matriz (topo→baixo, esquerda→direita), então acertar exige
// calcular cada posição E clicar na ordem certa.
// ---------------------------------------------------------------------------
function createComputedMultiCellAssignment(
  order: number,
  matrixA: Grid,
  scalar: number,
  targets: Position[],
  distractorValues: number[]
): Assignment {
  const matrixKA = scalarMultiply(matrixA, scalar);
  const scanOrder = [...targets].sort(([r1, c1], [r2, c2]) =>
    r1 !== r2 ? r1 - r2 : c1 - c2
  );
  const targetKeys = new Set(scanOrder.map(([r, c]) => `${r}-${c}`));
  const targetValues = scanOrder.map(([r, c]) => matrixKA[r - 1][c - 1]);
  const notations = scanOrder.map(([r, c]) => notation(r, c)).join(", ");

  const options: Option[] = shuffleArray([
    ...targetValues.map((value, index) => ({
      id: `correct-${index}`,
      displayValue: String(value),
      value,
    })),
    ...distractorValues.map((value, index) => ({
      id: `distractor-${index}`,
      displayValue: String(value),
      value,
    })),
  ]);

  return {
    ...baseAssignment(order),
    instructions: `Calcule ${scalar} · A e preencha as posições ${notations}, na ordem em que aparecem (de cima para baixo, esquerda para direita).`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore
        .getState()
        .setMatrices([readonlyDisplayMatrix("matrix-a", "A", matrixA)]);
      const { setMatrix, setOptions } =
        useFillInMatrixWithOptionsStore.getState();
      setMatrix({
        id: "answer-grid",
        type: MatrixType.IDENTITY,
        dimention: "2D",
        matrixValue: matrixA.map((row, i) =>
          row.map((_, j) =>
            targetKeys.has(`${i + 1}-${j + 1}`)
              ? { value: "", editable: true }
              : { value: "·", editable: false }
          )
        ),
      });
      setOptions(options);
    },
    validate() {
      const { matrix, selectedOptions } =
        useFillInMatrixWithOptionsStore.getState();
      if (!matrix || selectedOptions.length < scanOrder.length) return false;
      return scanOrder.every(([row, col], index) => {
        const cell = matrix.matrixValue[row - 1][col - 1];
        return Number(cell.value) === targetValues[index];
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Multiplicação por escalar — 6 exercícios, progressão de dificuldade.
// ---------------------------------------------------------------------------
export const matrixScalarMultiplicationAssignmentList: Assignment[] = [
  createSingleGapAssignment(
    1,
    [
      [2, 3],
      [4, 1],
    ],
    3,
    1,
    2
  ),
  createSingleGapAssignment(
    2,
    [
      [5, 1, 3],
      [2, 4, 6],
    ],
    -2,
    1,
    3
  ),
  createFullResultAssignment(
    3,
    [
      [1, 2, 3],
      [4, 0, 5],
      [6, 1, 2],
    ],
    4
  ),
  createSingleCellChoiceAssignment(
    4,
    [
      [3, -2, 5],
      [0, 4, -1],
      [2, -3, 6],
    ],
    -3,
    1,
    3,
    [15, 2, 6]
  ),
  createFindScalarAssignment(
    5,
    [
      [2, -1],
      [3, 4],
      [0, 5],
    ],
    -3,
    [3, -2, 2]
  ),
  createComputedMultiCellAssignment(
    6,
    [
      [3, 1.5, -2, 4],
      [0, 2, 5, -1],
      [6, -3, 1, 2],
    ],
    -1.5,
    [
      [1, 4],
      [2, 2],
      [3, 1],
    ],
    [3, 1.5]
  ),
];
