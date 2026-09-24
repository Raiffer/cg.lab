import {
  Matrix,
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { shuffleArray } from "@/utils";

/**
 * "Multiplicação de matrizes" — 6 exercícios sobre a MECÂNICA de A · B
 * (regra linha-vezes-coluna): nada disso existia antes — o que já tinha em
 * `subjectCategory: "multiplication"` (orderingMatrices) assume que o aluno
 * já sabe multiplicar e foca em COMPOR transformações geométricas conhecidas
 * numa forma da cena. Aqui A e B são matrizes numéricas quaisquer — sem
 * plano cartesiano (`hideCanvas: true`), mesmo cartão branco centralizado
 * dos outros exercícios de fundamentos.
 *
 * Progressão de dificuldade:
 *   1  o caso mais simples possível: linha (1x2) vezes coluna (2x1) = um
 *      número só — a mecânica pura de "multiplicar pares e somar", sem
 *      nenhuma navegação de linha/coluna dentro de uma grade maior
 *   2  regra de compatibilidade: dado A (2x3) e B (3x2), é possível
 *      calcular A·B? qual a ordem do resultado?
 *   3  1 elemento de A(2x2)·B(2x2), múltipla escolha
 *   4  A(2x2)·B(2x2) inteira, o aluno digita todas as células
 *   5  1 elemento de A(2x3)·B(3x2) — três parcelas para somar, não duas
 *   6  a mais difícil: A·B já "pronta" com 1 elemento errado; o aluno acha
 *      qual é
 */

type Grid = number[][];

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

/** Regra linha-vezes-coluna: A é m×n, B precisa ser n×p; resultado é m×p. */
function matrixMultiply(matrixA: Grid, matrixB: Grid): Grid {
  const rows = matrixA.length;
  const inner = matrixA[0].length;
  const cols = matrixB[0].length;
  const result: Grid = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let k = 0; k < inner; k++) sum += matrixA[i][k] * matrixB[k][j];
      row.push(cleanZero(sum));
    }
    result.push(row);
  }
  return result;
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
  id: `matrix-matrix-multiplication-${order}`,
  order,
  title: "Multiplicação de matrizes",
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
// Kind 1 — o caso mais simples: linha (1xn) vezes coluna (nx1) = um número
// só. Múltipla escolha, com distratores que reproduzem confundir a regra
// (somar tudo, ou trocar quem multiplica com quem).
// ---------------------------------------------------------------------------
function createDotProductAssignment(
  order: number,
  rowVector: number[],
  columnVector: number[],
  distractorValues: number[]
): Assignment {
  const matrixA: Grid = [rowVector];
  const matrixB: Grid = columnVector.map(value => [value]);
  const targetValue = matrixMultiply(matrixA, matrixB)[0][0];

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
    instructions: `Multiplicação de matrizes não é feita elemento a elemento: multiplica-se cada par (mesma posição) e somam-se os produtos. A é 1×${rowVector.length} e B é ${columnVector.length}×1, então A · B é 1×1. Calcule A · B.`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`A · B = {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 2 — regra de compatibilidade: A é m×n, B é p×q; só dá pra multiplicar
// se n = p, e o resultado sai m×q.
// ---------------------------------------------------------------------------
function createDimensionRuleAssignment(
  order: number,
  matrixA: Grid,
  matrixB: Grid
): Assignment {
  const rows = matrixA.length;
  const inner = matrixA[0].length;
  const compatible = matrixB.length === inner;
  const cols = matrixB[0].length;
  const correct = compatible ? `${rows} × ${cols}` : "não é possível";

  const candidateOptions = [
    `${rows} × ${cols}`,
    `${matrixB.length} × ${matrixB.length}`,
    "não é possível",
    `${rows} × ${matrixA[0].length}`,
  ];
  const uniqueOptions = candidateOptions.filter(
    (value, index, all) => all.indexOf(value) === index
  );

  const options: TOption[] = shuffleArray(
    uniqueOptions.map((value, index) => ({
      id: value === correct ? "correct" : `distractor-${index}`,
      value,
      correct: value === correct,
    }))
  );

  return {
    ...baseAssignment(order),
    instructions: `Para calcular A · B, o número de colunas de A precisa ser igual ao número de linhas de B (aqui A é ${rows}×${inner} e B é ${matrixB.length}×${cols}). A · B é possível? Se sim, qual é a ordem do resultado?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`Resultado de A · B: {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 3 — múltipla escolha para 1 elemento de A·B, com distratores que
// reproduzem erros comuns (linha/coluna errada, multiplicar sem somar).
// ---------------------------------------------------------------------------
function createSingleEntryChoiceAssignment(
  order: number,
  matrixA: Grid,
  matrixB: Grid,
  targetRow: number,
  targetCol: number,
  distractorValues: number[]
): Assignment {
  const r = targetRow - 1;
  const c = targetCol - 1;
  const matrixC = matrixMultiply(matrixA, matrixB);
  const targetValue = matrixC[r][c];
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
    instructions: `Observe A e B. ${el} de A · B é a soma dos produtos da linha ${targetRow} de A pela coluna ${targetCol} de B. Qual é o valor de ${el}?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence(`O valor de ${el} em A · B é {resposta}`);
      setOptions(options);
    },
    validate: validateOptions,
  };
}

// ---------------------------------------------------------------------------
// Kind 4 — a matriz A·B inteira fica vazia; o aluno calcula e digita todas
// as células.
// ---------------------------------------------------------------------------
function createFullResultAssignment(
  order: number,
  matrixA: Grid,
  matrixB: Grid
): Assignment {
  const matrixC = matrixMultiply(matrixA, matrixB);

  return {
    ...baseAssignment(order),
    instructions: `Calcule C = A · B e preencha todas as células de C.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
        {
          id: "matrix-c",
          label: "C = A · B",
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
// Kind 5 — uma lacuna só em A·B, mas com matrizes retangulares: cada
// elemento agora soma 3 parcelas (dimensão interna maior), não 2.
// ---------------------------------------------------------------------------
function createSingleGapAssignment(
  order: number,
  matrixA: Grid,
  matrixB: Grid,
  gapRow: number,
  gapCol: number
): Assignment {
  const r = gapRow - 1;
  const c = gapCol - 1;
  const matrixC = matrixMultiply(matrixA, matrixB);
  const targetValue = matrixC[r][c];

  return {
    ...baseAssignment(order),
    instructions: `Complete o elemento que falta em C = A · B (aqui, cada elemento de C soma ${matrixA[0].length} produtos, não 2).`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
        {
          id: "matrix-c",
          label: "C = A · B",
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
// Kind 6 — C = A·B já vem "pronta", mas com exatamente um elemento errado
// (erro comum: multiplicar elemento a elemento em vez de somar a linha
// vezes coluna); o aluno acha qual é.
// ---------------------------------------------------------------------------
function createErrorSpotAssignment(
  order: number,
  matrixA: Grid,
  matrixB: Grid,
  wrongPosition: [number, number],
  wrongValue: number,
  distractorPositions: [number, number][]
): Assignment {
  const matrixC = matrixMultiply(matrixA, matrixB);
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
    ...baseAssignment(order),
    instructions: `A matriz C abaixo deveria ser C = A · B, mas exatamente um elemento está incorreto. Qual é o elemento errado?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix("matrix-a", "A", matrixA),
        readonlyDisplayMatrix("matrix-b", "B", matrixB),
        readonlyDisplayMatrix("matrix-c", "C = A · B", displayedC),
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
// Multiplicação de matrizes — 6 exercícios, progressão de dificuldade.
// ---------------------------------------------------------------------------
export const matrixMatrixMultiplicationAssignmentList: Assignment[] = [
  createDotProductAssignment(1, [2, 3], [4, 5], [14, 22, 20]),
  createDimensionRuleAssignment(
    2,
    [
      [1, 2, 3],
      [4, 5, 6],
    ],
    [
      [1, 0],
      [2, 1],
      [0, 3],
    ]
  ),
  createSingleEntryChoiceAssignment(
    3,
    [
      [1, 2],
      [3, 4],
    ],
    [
      [2, 0],
      [1, 3],
    ],
    1,
    2,
    [4, 0, 9]
  ),
  createFullResultAssignment(
    4,
    [
      [2, 1],
      [0, 3],
    ],
    [
      [1, 4],
      [2, 1],
    ]
  ),
  createSingleGapAssignment(
    5,
    [
      [1, 2, 0],
      [3, -1, 2],
    ],
    [
      [2, 1],
      [0, 3],
      [-1, 4],
    ],
    2,
    1
  ),
  createErrorSpotAssignment(
    6,
    [
      [1, 2],
      [3, 4],
    ],
    [
      [0, 1],
      [1, 2],
    ],
    [2, 2],
    8,
    [
      [1, 1],
      [1, 2],
      [2, 1],
    ]
  ),
];
