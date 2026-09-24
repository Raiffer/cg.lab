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
 * "Soma de matrizes" e "Subtração de matrizes" — duas famílias de 6
 * exercícios cada, element a element, sem plano cartesiano (`hideCanvas:
 * true`): somar/subtrair matrizes não corresponde a nenhuma transformação
 * geométrica que este app já sabe desenhar (translação/escala/rotação são
 * sobre UMA matriz estruturada aplicada a um ponto/polígono; aqui são DUAS
 * matrizes numéricas genéricas, elemento a elemento) — mostrar um plano vazio
 * ao fundo só distrairia, então usamos o mesmo cartão branco centralizado do
 * módulo de Identificação de Posição.
 *
 * Progressão de dificuldade (igual nas duas famílias):
 *   1  2x2, lacuna única — a mecânica básica
 *   2  2x2/2x3 retangular, lacuna única — outra forma de matriz
 *   3  3x3, TODAS as células — computar a matriz inteira, não só uma lacuna
 *   4  3x3 com zero/negativos, múltipla escolha com distratores "armadilha"
 *      (erro de sinal ou de ordem das parcelas)
 *   5  conceito: a soma comuta (A+B=B+A sempre); a subtração não (A-B=B-A só
 *      se A=B) — pergunta Sim/Não sem precisar calcular tudo
 *   6  a mais difícil, exclusiva de cada família: na soma, preencher várias
 *      posições calculadas em ordem de varredura; na subtração, achar o
 *      elemento errado numa conta já pronta
 *
 * Tipos de resposta usados: FILL_IN_THE_BLANK_MATRIX (digitar uma ou todas
 * as células), FILL_IN_THE_BLANK_WITH_OPTIONS (múltipla escolha) e
 * FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS (levar valores calculados para
 * células, na ordem em que aparecem na matriz).
 */

type Operation = "sum" | "subtraction";
type Grid = number[][];
type Position = [number, number];

const OPERATION_SYMBOL: Record<Operation, string> = {
  sum: "+",
  subtraction: "−",
};

const OPERATION_TITLE: Record<Operation, string> = {
  sum: "Soma de matrizes",
  subtraction: "Subtração de matrizes",
};

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

function elementWise(a: Grid, b: Grid, operation: Operation): Grid {
  return a.map((row, r) =>
    row.map((value, c) =>
      operation === "sum" ? value + b[r][c] : value - b[r][c]
    )
  );
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

const baseAssignment = (order: number, operation: Operation) => ({
  id: `matrix-${operation}-${order}`,
  order,
  title: OPERATION_TITLE[operation],
  assisted: false,
  hideCanvas: true,
  subjectCategory: "matrix-fundamentals" as const,
});

/** Reads the selected multiple-choice option and trusts its `.correct` flag. */
function validateOptions(): boolean {
  const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
  const answer = selectedOptions["resposta"];
  return answer ? answer.correct : false;
}

// ---------------------------------------------------------------------------
// Kind 1 — uma lacuna só; o aluno digita o valor que falta em C.
// ---------------------------------------------------------------------------
function createSingleGapAssignment(
  order: number,
  operation: Operation,
  matrixA: Grid,
  matrixB: Grid,
  gapRow: number,
  gapCol: number
): Assignment {
  const r = gapRow - 1;
  const c = gapCol - 1;
  const matrixC = elementWise(matrixA, matrixB, operation);
  const targetValue = matrixC[r][c];
  const symbol = OPERATION_SYMBOL[operation];

  return {
    ...baseAssignment(order, operation),
    instructions: `Complete o elemento que falta em C = A ${symbol} B.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
        {
          id: "matrix-c",
          label: `C = A ${symbol} B`,
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: matrixC.map((row, i) =>
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
        .getMatrixById("matrix-c");
      if (!matrix) return false;
      const raw = matrix.matrixValue[r][c].value;
      if (raw === "" || Number.isNaN(Number(raw))) return false;
      return Number(raw) === targetValue;
    },
  };
}

// ---------------------------------------------------------------------------
// Kind 2 — a matriz C inteira fica vazia; o aluno calcula e digita todas as
// células, em vez de só uma.
// ---------------------------------------------------------------------------
function createFullResultAssignment(
  order: number,
  operation: Operation,
  matrixA: Grid,
  matrixB: Grid
): Assignment {
  const matrixC = elementWise(matrixA, matrixB, operation);
  const symbol = OPERATION_SYMBOL[operation];

  return {
    ...baseAssignment(order, operation),
    instructions: `Calcule C = A ${symbol} B e preencha todas as células de C.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
        {
          id: "matrix-c",
          label: `C = A ${symbol} B`,
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: matrixC.map(row =>
            row.map(() => ({ value: "", editable: true }))
          ),
        },
      ]);
    },
    validate() {
      const matrix = useFillBlankMatrixInputStore
        .getState()
        .getMatrixById("matrix-c");
      if (!matrix) return false;
      return matrixC.every((row, i) =>
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
// Kind 3 — múltipla escolha para 1 célula de C, com distratores que
// reproduzem erros comuns (sinal trocado, ordem das parcelas invertida).
// ---------------------------------------------------------------------------
function createSingleCellChoiceAssignment(
  order: number,
  operation: Operation,
  matrixA: Grid,
  matrixB: Grid,
  targetRow: number,
  targetCol: number,
  distractorValues: number[]
): Assignment {
  const r = targetRow - 1;
  const c = targetCol - 1;
  const matrixC = elementWise(matrixA, matrixB, operation);
  const targetValue = matrixC[r][c];
  const symbol = OPERATION_SYMBOL[operation];
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
    ...baseAssignment(order, operation),
    instructions: `Observe A e B. Qual é o valor do elemento ${el} de C = A ${symbol} B?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor de ${el} em C é {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 4 — conceito, sem precisar calcular tudo: a soma comuta (A+B=B+A
// sempre); a subtração só comuta quando A = B.
// ---------------------------------------------------------------------------
function createCommutativityCheckAssignment(
  order: number,
  operation: Operation,
  matrixA: Grid,
  matrixB: Grid
): Assignment {
  const symbol = OPERATION_SYMBOL[operation];
  const commutes =
    operation === "sum" ||
    matrixA.every((row, i) => row.every((value, j) => value === matrixB[i][j]));

  const options: TOption[] = [
    { id: "sim", value: "Sim", correct: commutes },
    { id: "nao", value: "Não", correct: !commutes },
  ];

  const explanation =
    operation === "sum"
      ? "A soma element a elemento não depende da ordem das parcelas."
      : "Trocar a ordem numa subtração inverte o sinal de cada elemento.";

  return {
    ...baseAssignment(order, operation),
    instructions: `${explanation} Sem calcular tudo: A ${symbol} B é igual a B ${symbol} A?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`A ${symbol} B = B ${symbol} A? {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 5 (só soma) — o aluno LEVA valores calculados para VÁRIAS células ao
// mesmo tempo. Clicar numa opção sempre preenche a primeira lacuna
// encontrada ao varrer a matriz (topo→baixo, esquerda→direita), então
// acertar exige calcular cada posição E clicar na ordem certa.
// ---------------------------------------------------------------------------
function createComputedMultiCellAssignment(
  order: number,
  operation: Operation,
  matrixA: Grid,
  matrixB: Grid,
  targets: Position[],
  distractorValues: number[]
): Assignment {
  const matrixC = elementWise(matrixA, matrixB, operation);
  const symbol = OPERATION_SYMBOL[operation];
  const scanOrder = [...targets].sort(([r1, c1], [r2, c2]) =>
    r1 !== r2 ? r1 - r2 : c1 - c2
  );
  const targetKeys = new Set(scanOrder.map(([r, c]) => `${r}-${c}`));
  const targetValues = scanOrder.map(([r, c]) => matrixC[r - 1][c - 1]);
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
    ...baseAssignment(order, operation),
    instructions: `Calcule C = A ${symbol} B e preencha as posições ${notations}, na ordem em que aparecem (de cima para baixo, esquerda para direita).`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
      ]);
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
// Kind 6 (só subtração) — C já vem "pronta", mas com exatamente um elemento
// errado; o aluno precisa refazer a conta mentalmente para achar qual é.
// ---------------------------------------------------------------------------
function createErrorSpotAssignment(
  order: number,
  operation: Operation,
  matrixA: Grid,
  matrixB: Grid,
  wrongPosition: Position,
  wrongValue: number,
  distractorPositions: Position[]
): Assignment {
  const symbol = OPERATION_SYMBOL[operation];
  const matrixC = elementWise(matrixA, matrixB, operation);
  const [wr, wc] = [wrongPosition[0] - 1, wrongPosition[1] - 1];
  const displayedC = matrixC.map((row, i) =>
    row.map((value, j) => (i === wr && j === wc ? wrongValue : value))
  );
  const correctNotation = notation(wrongPosition[0], wrongPosition[1]);

  const options: TOption[] = shuffleArray([
    { id: "correct", value: correctNotation, correct: true },
    ...distractorPositions.map(([row, col], index) => ({
      id: `distractor-${index}`,
      value: notation(row, col),
      correct: false,
    })),
  ]);

  return {
    ...baseAssignment(order, operation),
    instructions: `A matriz C abaixo deveria ser C = A ${symbol} B, mas exatamente um elemento está incorreto. Qual é o elemento errado?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
        readonlyDisplayMatrix("matrix-c", `C = A ${symbol} B`, displayedC),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O elemento errado é {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Soma de matrizes — 6 exercícios, progressão de dificuldade.
// ---------------------------------------------------------------------------
export const matrixSumAssignmentList: Assignment[] = [
  createSingleGapAssignment(
    1,
    "sum",
    [
      [4, 1],
      [2, 6],
    ],
    [
      [3, 5],
      [1, 2],
    ],
    2,
    1
  ),
  createSingleGapAssignment(
    2,
    "sum",
    [
      [5, 2, 4],
      [1, 3, 6],
    ],
    [
      [2, 1, 3],
      [4, 0, 2],
    ],
    1,
    3
  ),
  createFullResultAssignment(
    3,
    "sum",
    [
      [2, 0, 3],
      [1, 5, 2],
      [4, 1, 3],
    ],
    [
      [1, 3, 2],
      [2, 1, 4],
      [0, 3, 1],
    ]
  ),
  createSingleCellChoiceAssignment(
    4,
    "sum",
    [
      [5, -2, 0],
      [3, 4, -1],
      [0, 2, 6],
    ],
    [
      [2, 3, -4],
      [-1, 0, 5],
      [3, -2, 1],
    ],
    1,
    3,
    [4, 1, 7]
  ),
  createCommutativityCheckAssignment(
    5,
    "sum",
    [
      [3, -1, 2],
      [0, 4, -2],
      [5, 1, 3],
    ],
    [
      [-2, 3, 1],
      [4, 0, -1],
      [1, -3, 2],
    ]
  ),
  createComputedMultiCellAssignment(
    6,
    "sum",
    [
      [3, 1.5, -2, 4],
      [0, 2, 5, -1],
      [6, -3, 1, 2],
    ],
    [
      [2, 0.5, 3, -1],
      [4, -2, 1, 3],
      [-1, 2, 0, 5],
    ],
    [
      [1, 4],
      [2, 2],
      [3, 1],
    ],
    [2, 1]
  ),
];

// ---------------------------------------------------------------------------
// Subtração de matrizes — 6 exercícios, progressão de dificuldade.
// ---------------------------------------------------------------------------
export const matrixSubtractionAssignmentList: Assignment[] = [
  createSingleGapAssignment(
    1,
    "subtraction",
    [
      [7, 5],
      [6, 9],
    ],
    [
      [2, 3],
      [4, 5],
    ],
    1,
    2
  ),
  createSingleGapAssignment(
    2,
    "subtraction",
    [
      [8, 6, 5],
      [9, 7, 4],
    ],
    [
      [3, 2, 1],
      [4, 3, 2],
    ],
    2,
    2
  ),
  createFullResultAssignment(
    3,
    "subtraction",
    [
      [5, 3, 8],
      [2, 7, 4],
      [9, 1, 6],
    ],
    [
      [2, 1, 3],
      [4, 2, 1],
      [3, 0, 2],
    ]
  ),
  createSingleCellChoiceAssignment(
    4,
    "subtraction",
    [
      [4, -1, 6],
      [3, 5, -2],
      [0, 2, 7],
    ],
    [
      [1, 3, 2],
      [-2, 4, 5],
      [3, -1, 1],
    ],
    1,
    2,
    [4, 3, 1]
  ),
  createCommutativityCheckAssignment(
    5,
    "subtraction",
    [
      [2, 5, -1],
      [3, -2, 4],
      [0, 1, 6],
    ],
    [
      [4, 1, 3],
      [-1, 2, 5],
      [2, -3, 0],
    ]
  ),
  createErrorSpotAssignment(
    6,
    "subtraction",
    [
      [5, -2, 3, 1],
      [4, 0, -3, 6],
      [-1, 2, 5, -4],
    ],
    [
      [2, 1, -1, 3],
      [3, -2, 4, 2],
      [1, 0, 2, -3],
    ],
    [2, 3],
    1,
    [
      [1, 2],
      [3, 4],
      [2, 4],
    ]
  ),
];

export const matrixSumSubtractionGapAssignmentList: Assignment[] = [
  ...matrixSumAssignmentList,
  ...matrixSubtractionAssignmentList,
];
