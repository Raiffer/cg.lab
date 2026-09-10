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
 * "Identificação de Posição" — 16 exercícios que treinam o aluno a localizar e
 * nomear elementos de uma matriz (notação a_ij, linhas, colunas, ordem,
 * diagonal principal, elemento simétrico).
 *
 * A dificuldade cresce ao longo do array (que é o que define a ordem de
 * navegação — ver docs/criando-exercicios.md, seção 4):
 *   1–4   fundamentos: matrizes 2x2 e retangulares pequenas, leitura direta
 *   5–8   matrizes 3x3, ida e volta entre valor <-> posição, ordem da matriz
 *   9–12  números negativos, diagonal principal, primeira manipulação da matriz
 *   13–16 matrizes 3x4/4x4, decimais, elemento simétrico e troca de posições
 *
 * Tipos de resposta usados (todos sem plano cartesiano, `hideCanvas: true`):
 *   FILL_IN_THE_BLANK_WITH_OPTIONS        — múltipla escolha sobre a matriz
 *   FILL_IN_THE_BLANK_MATRIX             — o aluno digita direto nas células
 *   FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS — o aluno leva uma opção para a célula
 */

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

type Grid = number[][];
type Position = [number, number];

/** Picks 3 wrong-answer candidates from the SAME row and column as the
 * target cell, so a wrong guess actually reveals which index the student
 * missed (right row/wrong column, or right column/wrong row) instead of
 * a random unrelated number. */
function pickDistractors(
  matrixValues: Grid,
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

/** Read-only grid used just to show a matrix "A" the student reasons about. */
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

const baseAssignment = (order: number, title: string) => ({
  id: `matrix-element-identification-${order}`,
  order,
  title,
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

function showMatrixA(values: Grid) {
  useFillBlankMatrixInputStore
    .getState()
    .setMatrices([readonlyDisplayMatrix("matrix-a", "A", values)]);
}

// ---------------------------------------------------------------------------
// Kind 1 — "Qual é o valor do elemento a_ij?" (multiple choice)
// ---------------------------------------------------------------------------
function createValueAtNotation(
  order: number,
  title: string,
  matrixA: Grid,
  targetRow: number,
  targetCol: number
): Assignment {
  const r = targetRow - 1;
  const c = targetCol - 1;
  const targetValue = matrixA[r][c];
  const el = notation(targetRow, targetCol);

  const options: TOption[] = shuffleArray([
    { id: "correct", value: String(targetValue), correct: true },
    ...pickDistractors(matrixA, r, c, targetValue).map((value, index) => ({
      id: `distractor-${index}`,
      value: String(value),
      correct: false,
    })),
  ]);

  return {
    ...baseAssignment(order, title),
    instructions: `Observe a matriz A. Qual é o valor do elemento ${el} (linha ${targetRow}, coluna ${targetCol})?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor de ${el} é {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 2 — "Em que linha está o valor V?" (multiple choice)
// ---------------------------------------------------------------------------
function createRowOfValue(
  order: number,
  title: string,
  matrixA: Grid,
  probeValue: number
): Assignment {
  // probeValue is chosen to appear exactly once in matrixA.
  let targetRow = 0;
  matrixA.forEach((row, i) => {
    if (row.includes(probeValue)) targetRow = i + 1;
  });

  const options: TOption[] = matrixA.map((_, i) => ({
    id: i + 1 === targetRow ? "correct" : `distractor-${i}`,
    value: String(i + 1),
    correct: i + 1 === targetRow,
  }));

  return {
    ...baseAssignment(order, title),
    instructions: `Na matriz A o valor ${probeValue} aparece uma única vez. Em que linha ele está?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor ${probeValue} está na linha {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 3 — "Em que coluna está o valor V?" (multiple choice)
// ---------------------------------------------------------------------------
function createColumnOfValue(
  order: number,
  title: string,
  matrixA: Grid,
  probeValue: number
): Assignment {
  let targetCol = 0;
  matrixA.forEach(row =>
    row.forEach((value, j) => {
      if (value === probeValue) targetCol = j + 1;
    })
  );

  const options: TOption[] = matrixA[0].map((_, j) => ({
    id: j + 1 === targetCol ? "correct" : `distractor-${j}`,
    value: String(j + 1),
    correct: j + 1 === targetCol,
  }));

  return {
    ...baseAssignment(order, title),
    instructions: `Na matriz A o valor ${probeValue} aparece uma única vez. Em que coluna ele está?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor ${probeValue} está na coluna {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 4 — "Qual notação a_ij indica a posição do valor V?" (multiple choice)
// ---------------------------------------------------------------------------
function createNotationOfValue(
  order: number,
  title: string,
  matrixA: Grid,
  probeValue: number,
  distractorPositions: Position[]
): Assignment {
  let pr = 0;
  let pc = 0;
  matrixA.forEach((row, i) =>
    row.forEach((value, j) => {
      if (value === probeValue) {
        pr = i + 1;
        pc = j + 1;
      }
    })
  );

  const options: TOption[] = shuffleArray([
    { id: "correct", value: notation(pr, pc), correct: true },
    ...distractorPositions.map(([row, col], index) => ({
      id: `distractor-${index}`,
      value: notation(row, col),
      correct: false,
    })),
  ]);

  return {
    ...baseAssignment(order, title),
    instructions: `Na matriz A o valor ${probeValue} aparece uma única vez. Qual notação aᵢⱼ representa a posição dele (linha i, coluna j)?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor ${probeValue} está na posição {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 5 — "Qual é a ordem (m x n) da matriz A?" (multiple choice)
// ---------------------------------------------------------------------------
function createMatrixOrder(
  order: number,
  title: string,
  matrixA: Grid
): Assignment {
  const rows = matrixA.length;
  const cols = matrixA[0].length;
  const correct = `${rows} × ${cols}`;

  const distractors = [
    `${cols} × ${rows}`,
    `${rows} × ${rows}`,
    `${cols} × ${cols}`,
  ].filter((value, index, all) => value !== correct && all.indexOf(value) === index);

  const options: TOption[] = shuffleArray([
    { id: "correct", value: correct, correct: true },
    ...distractors.map((value, index) => ({
      id: `distractor-${index}`,
      value,
      correct: false,
    })),
  ]);

  return {
    ...baseAssignment(order, title),
    instructions: `Uma matriz de ordem m × n tem m linhas e n colunas. Qual é a ordem da matriz A?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`A matriz A é de ordem {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 6 — "Quantas linhas / colunas tem A?" (multiple choice)
// ---------------------------------------------------------------------------
function createCountRowsOrCols(
  order: number,
  title: string,
  matrixA: Grid,
  dimension: "linhas" | "colunas"
): Assignment {
  const correctNumber =
    dimension === "linhas" ? matrixA.length : matrixA[0].length;

  const options: TOption[] = ["2", "3", "4", "5"].map(value => ({
    id: Number(value) === correctNumber ? "correct" : `distractor-${value}`,
    value,
    correct: Number(value) === correctNumber,
  }));

  return {
    ...baseAssignment(order, title),
    instructions: `Quantas ${dimension} tem a matriz A?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`A matriz A tem {resposta} ${dimension}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 7 — "O elemento a_ij pertence à diagonal principal?" (sim / não)
// ---------------------------------------------------------------------------
function createDiagonalMembership(
  order: number,
  title: string,
  matrixA: Grid,
  probeRow: number,
  probeCol: number
): Assignment {
  const onDiagonal = probeRow === probeCol;
  const el = notation(probeRow, probeCol);

  const options: TOption[] = [
    { id: "sim", value: "Sim", correct: onDiagonal },
    { id: "nao", value: "Não", correct: !onDiagonal },
  ];

  return {
    ...baseAssignment(order, title),
    instructions: `A diagonal principal é formada pelos elementos aᵢⱼ em que i = j. O elemento ${el} pertence à diagonal principal de A?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`${el} está na diagonal principal? {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 8 — "Qual destes elementos está na diagonal principal?" (multiple choice)
// ---------------------------------------------------------------------------
function createWhichIsOnDiagonal(
  order: number,
  title: string,
  matrixA: Grid,
  correctPosition: Position,
  distractorPositions: Position[]
): Assignment {
  const options: TOption[] = shuffleArray([
    {
      id: "correct",
      value: notation(correctPosition[0], correctPosition[1]),
      correct: true,
    },
    ...distractorPositions.map(([row, col], index) => ({
      id: `distractor-${index}`,
      value: notation(row, col),
      correct: false,
    })),
  ]);

  return {
    ...baseAssignment(order, title),
    instructions: `Qual dos elementos abaixo está na diagonal principal de A (a posição em que a linha é igual à coluna)?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O elemento da diagonal principal é {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 9 — "Qual é o valor do elemento simétrico de a_ij (ou seja, a_ji)?"
// ---------------------------------------------------------------------------
function createSymmetricValue(
  order: number,
  title: string,
  matrixA: Grid,
  probeRow: number,
  probeCol: number,
  distractorValues: number[]
): Assignment {
  const symmetricValue = matrixA[probeCol - 1][probeRow - 1];
  const el = notation(probeRow, probeCol);
  const symmetricEl = notation(probeCol, probeRow);

  const options: TOption[] = shuffleArray([
    { id: "correct", value: String(symmetricValue), correct: true },
    ...distractorValues.map((value, index) => ({
      id: `distractor-${index}`,
      value: String(value),
      correct: false,
    })),
  ]);

  return {
    ...baseAssignment(order, title),
    instructions: `O simétrico de ${el} em relação à diagonal principal é ${symmetricEl} (troca-se a linha pela coluna). Qual é o valor de ${symmetricEl} em A?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor de ${symmetricEl} é {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 10 — o aluno DIGITA na matriz: troca o valor de a_ij (localizar + editar)
// ---------------------------------------------------------------------------
function createReplaceCellValue(
  order: number,
  title: string,
  matrixA: Grid,
  targetRow: number,
  targetCol: number,
  replacement: number
): Assignment {
  const r = targetRow - 1;
  const c = targetCol - 1;
  const el = notation(targetRow, targetCol);

  return {
    ...baseAssignment(order, title),
    instructions: `Na matriz A, troque o valor do elemento ${el} (linha ${targetRow}, coluna ${targetCol}) por ${replacement}. As demais células ficam como estão.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          // Every cell is an input, so the editable underline no longer gives
          // away which position the student is supposed to find.
          matrixValue: matrixA.map(row =>
            row.map(value => ({ value, editable: true }))
          ),
        },
      ]);
    },
    validate() {
      const matrix = useFillBlankMatrixInputStore
        .getState()
        .getMatrixById("matrix-a");
      if (!matrix) return false;
      // The target cell must hold `replacement`; every other cell must be left
      // untouched — locating the right one is the whole exercise.
      return matrixA.every((row, i) =>
        row.every((original, j) => {
          const raw = matrix.matrixValue[i][j].value;
          if (raw === "" || Number.isNaN(Number(raw))) return false;
          const expected = i === r && j === c ? replacement : original;
          return Number(raw) === expected;
        })
      );
    },
  };
}

// ---------------------------------------------------------------------------
// Kind 11 — o aluno DIGITA na matriz: troca dois elementos de lugar
// (reflexão pela diagonal principal — duas células editáveis)
// ---------------------------------------------------------------------------
function createSwapCells(
  order: number,
  title: string,
  matrixA: Grid,
  positionA: Position,
  positionB: Position
): Assignment {
  const [ar, ac] = [positionA[0] - 1, positionA[1] - 1];
  const [br, bc] = [positionB[0] - 1, positionB[1] - 1];
  const valueA = matrixA[ar][ac];
  const valueB = matrixA[br][bc];
  const elA = notation(positionA[0], positionA[1]);
  const elB = notation(positionB[0], positionB[1]);

  return {
    ...baseAssignment(order, title),
    instructions: `Troque os valores das posições ${elA} e ${elB} de A. As demais células ficam como estão.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          // Every cell is an input, so the editable underline no longer gives
          // away which positions the student is supposed to find.
          matrixValue: matrixA.map(row =>
            row.map(value => ({ value, editable: true }))
          ),
        },
      ]);
    },
    validate() {
      const matrix = useFillBlankMatrixInputStore
        .getState()
        .getMatrixById("matrix-a");
      if (!matrix) return false;
      return matrixA.every((row, i) =>
        row.every((original, j) => {
          const raw = matrix.matrixValue[i][j].value;
          if (raw === "" || Number.isNaN(Number(raw))) return false;
          let expected = original;
          if (i === ar && j === ac) expected = valueB;
          else if (i === br && j === bc) expected = valueA;
          return Number(raw) === expected;
        })
      );
    },
  };
}

// ---------------------------------------------------------------------------
// Kind 12 — o aluno LEVA uma opção para a célula: qual valor ocupa a_ij?
// ---------------------------------------------------------------------------
function createPickValueIntoCell(
  order: number,
  title: string,
  matrixA: Grid,
  targetRow: number,
  targetCol: number,
  distractorValues: number[]
): Assignment {
  const r = targetRow - 1;
  const c = targetCol - 1;
  const targetValue = matrixA[r][c];
  const el = notation(targetRow, targetCol);

  const options: Option[] = shuffleArray([
    { id: "correct", displayValue: String(targetValue), value: targetValue },
    ...distractorValues.map((value, index) => ({
      id: `distractor-${index}`,
      displayValue: String(value),
      value,
    })),
  ]);

  return {
    ...baseAssignment(order, title),
    instructions: `Observe a matriz A. Selecione, entre as opções, o valor que ocupa a posição ${el} (linha ${targetRow}, coluna ${targetCol}) e leve-o para a célula em destaque.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS,
    setup() {
      showMatrixA(matrixA);
      const { setMatrix, setOptions } =
        useFillInMatrixWithOptionsStore.getState();
      setMatrix({
        id: "answer-slot",
        type: MatrixType.IDENTITY,
        dimention: "2D",
        matrixValue: [[{ value: "", editable: true }]],
      });
      setOptions(options);
    },
    validate() {
      const { matrix, selectedOptions } =
        useFillInMatrixWithOptionsStore.getState();
      if (!matrix || selectedOptions.length === 0) return false;
      return Number(matrix.matrixValue[0][0].value) === targetValue;
    },
  };
}

// ---------------------------------------------------------------------------
// Lista final — a ordem do array É a progressão de dificuldade / navegação.
// ---------------------------------------------------------------------------
export const matrixElementIdentificationAssignmentList: Assignment[] = [
  // Nível 1 — fundamentos: 2x2 e retangulares pequenas, leitura direta
  createValueAtNotation(1, "Valor de um elemento (2×2)", [
    [3, 5],
    [7, 2],
  ], 1, 1),
  createValueAtNotation(2, "Valor de um elemento (retangular)", [
    [4, 1, 6],
    [2, 8, 5],
  ], 2, 3),
  createCountRowsOrCols(
    3,
    "Contando linhas e colunas",
    [
      [5, 2, 9],
      [1, 7, 3],
    ],
    "colunas"
  ),
  createMatrixOrder(4, "Ordem da matriz", [
    [1, 2, 3],
    [4, 5, 6],
  ]),

  // Nível 2 — matrizes 3x3, valor <-> posição, ordem
  createValueAtNotation(5, "Valor de um elemento (3×3)", [
    [5, 1, 0],
    [2, 8, 4],
    [9, 6, 3],
  ], 3, 2),
  createRowOfValue(6, "Em que linha está o valor?", [
    [2, 4, 7],
    [1, 9, 3],
    [8, 5, 6],
  ], 9),
  createColumnOfValue(7, "Em que coluna está o valor?", [
    [3, 7, 1],
    [5, 2, 8],
    [4, 9, 6],
  ], 8),
  createNotationOfValue(
    8,
    "Qual notação indica a posição?",
    [
      [6, 2, 9],
      [4, 7, 1],
      [3, 8, 5],
    ],
    7,
    [
      [1, 3],
      [3, 2],
      [2, 1],
    ]
  ),

  // Nível 3 — negativos, diagonal principal, primeira manipulação
  createValueAtNotation(9, "Valor de um elemento (negativos)", [
    [-3, 7, 2],
    [4, -1, 9],
    [0, 5, -6],
  ], 1, 3),
  createDiagonalMembership(
    10,
    "Diagonal principal: pertence?",
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
    2,
    3
  ),
  createWhichIsOnDiagonal(
    11,
    "Qual elemento está na diagonal?",
    [
      [2, 9, 4],
      [7, 1, 6],
      [3, 8, 5],
    ],
    [2, 2],
    [
      [3, 1],
      [1, 3],
      [2, 3],
    ]
  ),
  createReplaceCellValue(
    12,
    "Altere o elemento da posição",
    [
      [8, 3],
      [1, 6],
      [4, 9],
    ],
    3,
    2,
    0
  ),

  // Nível 4 — 3x4 / 4x4, decimais, elemento simétrico e troca de posições
  createValueAtNotation(13, "Valor de um elemento (3×4, decimais)", [
    [1.5, -2, 4, 0],
    [3, 0.5, -7, 2],
    [-4.5, 6, 2, -1],
  ], 3, 4),
  createPickValueIntoCell(
    14,
    "Selecione o valor da posição",
    [
      [2, 7, 1, 5],
      [9, 3, 8, 4],
      [6, 0, 2, 7],
    ],
    2,
    3,
    [9, 3, 1]
  ),
  createSymmetricValue(
    15,
    "Elemento simétrico pela diagonal",
    [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 1, 0, 2],
      [3, 5, 7, 9],
    ],
    1,
    4,
    [4, 9, 1]
  ),
  createSwapCells(
    16,
    "Troque dois elementos de lugar",
    [
      [2, 4, 6, 8],
      [1, 3, 5, 7],
      [0, 2, 4, 6],
      [9, 1, 5, 3],
    ],
    [2, 4],
    [4, 2]
  ),
];
