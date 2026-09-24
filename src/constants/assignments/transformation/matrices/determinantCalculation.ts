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
 * "Cálculo do Determinante" — aplicar a fórmula diretamente, sem nenhum
 * apoio visual (`hideCanvas: true`): a intuição geométrica (área/volume) é
 * trabalhada nos outros arquivos deste módulo (determinantSignPrediction,
 * determinantAreaTarget) — aqui o foco é só a mecânica algébrica em si.
 *
 * Progressão de dificuldade — o salto de "matriz 2x2" direto para "expansão
 * em cofatores 3x3 do zero" é grande demais para uma questão só (a fórmula
 * de 3x3 tem 3 termos e 6 multiplicações, contra 1 termo e 2 multiplicações
 * da 2x2), então o meio do caminho foi dividido em dois degraus:
 *   1–4  matriz 2x2, fórmula ad − bc. Distratores reproduzem os dois erros
 *        mais comuns: esquecer o sinal (ad + bc) e inverter a ordem da
 *        subtração (bc − ad).
 *   5    matriz 3x3 TRIANGULAR (zeros abaixo da diagonal): det = a·e·i, o
 *        produto da diagonal — introduz o tamanho 3x3 sem introduzir a
 *        fórmula de cofatores ainda. Distrator principal: somar a diagonal
 *        em vez de multiplicar.
 *   6    matriz 3x3 qualquer, mas os três "recortes" 2x2 (M₁, M₂, M₃) já vêm
 *        calculados no enunciado — o aluno só precisa combinar
 *        a·M₁ − b·M₂ + c·M₃. Isola a parte "montar a fórmula" da parte
 *        "calcular os recortes", que só se juntam na questão seguinte.
 *   7–8  matriz 3x3 qualquer, expansão em cofatores completa, do zero —
 *        agora com as duas peças (tamanho 3x3, e a fórmula de combinação)
 *        já praticadas separadamente. Distrator principal: somar só a
 *        diagonal principal, ignorando os outros cinco termos.
 */

type Grid2 = [[number, number], [number, number]];
type Grid3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

function det2(m: Grid2): number {
  const [[a, b], [c, d]] = m;
  return a * d - b * c;
}

/** The three 2x2 "cutouts" (minors) used by cofactor expansion along the
 * first row, plus the coefficients and final value — computed once so
 * det3() and the "guided" exercise below always agree with each other. */
function cofactorBreakdown(m: Grid3) {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const M1 = e * i - f * h;
  const M2 = d * i - f * g;
  const M3 = d * h - e * g;
  const correct = a * M1 - b * M2 + c * M3;
  return { a, b, c, M1, M2, M3, correct };
}

function det3(m: Grid3): number {
  return cofactorBreakdown(m).correct;
}

function readonlyDisplayMatrix(values: number[][]): Matrix {
  return {
    id: "matrix-a",
    label: "A",
    type: MatrixType.IDENTITY,
    dimention: "2D",
    matrixValue: values.map(row =>
      row.map(value => ({ value, editable: false }))
    ),
  };
}

const baseAssignment = (order: number, title: string) => ({
  id: `determinant-calculation-${order}`,
  order,
  title,
  assisted: false,
  hideCanvas: true,
  subjectCategory: "determinants" as const,
});

function validateOptions(): boolean {
  const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
  const answer = selectedOptions["resposta"];
  return answer ? answer.correct : false;
}

function makeOptions(correctValue: number, distractors: number[]): TOption[] {
  const seen = new Set<number>([correctValue]);
  const uniqueDistractors = distractors.filter(value => {
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
  return shuffleArray([
    { id: "correct", value: String(correctValue), correct: true },
    ...uniqueDistractors.map((value, index) => ({
      id: `distractor-${index}`,
      value: String(value),
      correct: false,
    })),
  ]);
}

function create2x2Assignment(order: number, title: string, m: Grid2): Assignment {
  const [[a, b], [c, d]] = m;
  const correct = det2(m);

  const options = makeOptions(correct, [
    a * d + b * c, // esqueceu o sinal
    b * c - a * d, // inverteu a ordem da subtração
  ]);

  return {
    ...baseAssignment(order, title),
    instructions: `Calcule o determinante de A. det(A) = a·d − b·c.`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix(m),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("det(A) = {resposta}");
      setOptions(options);
    },
    validate: validateOptions,
  };
}

/** Degrau 1 do 3x3: matriz TRIANGULAR (zeros abaixo da diagonal), onde
 * det(A) = a·e·i — só multiplicar a diagonal, sem expansão de cofatores.
 * Introduz o tamanho 3x3 isoladamente. */
function create3x3TriangularAssignment(
  order: number,
  title: string,
  m: Grid3
): Assignment {
  const correct = det3(m); // == m[0][0] * m[1][1] * m[2][2] para matriz triangular
  const diagonalSum = m[0][0] + m[1][1] + m[2][2];
  const antiDiagonalProduct = m[0][2] * m[1][1] * m[2][0];

  const options = makeOptions(correct, [diagonalSum, antiDiagonalProduct]);

  return {
    ...baseAssignment(order, title),
    instructions:
      "Quando uma matriz 3×3 é triangular (só há zeros abaixo da diagonal principal), " +
      "o determinante é simplesmente o produto da diagonal: det(A) = a·e·i.",
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix(m),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("det(A) = {resposta}");
      setOptions(options);
    },
    validate: validateOptions,
  };
}

/** Degrau 2 do 3x3: os três recortes 2x2 (M₁, M₂, M₃) já vêm calculados no
 * enunciado — o aluno só precisa montar a·M₁ − b·M₂ + c·M₃. Isola a parte
 * "combinar com o sinal e o coeficiente certos" da parte "calcular cada
 * recorte", que só se juntam na questão seguinte (create3x3Assignment). */
function create3x3GuidedAssignment(
  order: number,
  title: string,
  m: Grid3
): Assignment {
  const { a, b, c, M1, M2, M3, correct } = cofactorBreakdown(m);

  const options = makeOptions(correct, [
    a * M1 + b * M2 + c * M3, // esqueceu o sinal negativo do termo do meio
    M1 + M2 + M3, // esqueceu de multiplicar pelos coeficientes a, b, c
  ]);

  return {
    ...baseAssignment(order, title),
    instructions:
      `Os três recortes 2×2 de A já foram calculados: M₁ = ei − fh = ${M1}, ` +
      `M₂ = di − fg = ${M2}, M₃ = dh − eg = ${M3}. Combine com os coeficientes ` +
      `da primeira linha (a = ${a}, b = ${b}, c = ${c}): det(A) = a·M₁ − b·M₂ + c·M₃.`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix(m),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("det(A) = {resposta}");
      setOptions(options);
    },
    validate: validateOptions,
  };
}

function create3x3Assignment(order: number, title: string, m: Grid3): Assignment {
  const correct = det3(m);
  const diagonalOnly = m[0][0] * m[1][1] * m[2][2]; // ignora os outros 5 termos da expansão

  const options = makeOptions(correct, [
    diagonalOnly,
    -correct,
  ]);

  return {
    ...baseAssignment(order, title),
    instructions:
      "Calcule o determinante de A pela expansão em cofatores na primeira linha: " +
      "det(A) = a·(ei − fh) − b·(di − fg) + c·(dh − eg).",
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        readonlyDisplayMatrix(m),
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("det(A) = {resposta}");
      setOptions(options);
    },
    validate: validateOptions,
  };
}

export const determinantCalculationAssignmentList: Assignment[] = [
  // Nível 1 — valores pequenos e positivos, aquecimento com a fórmula
  create2x2Assignment(1, "Determinante 2×2", [
    [3, 2],
    [1, 4],
  ]),
  create2x2Assignment(2, "Determinante 2×2 (outro caso)", [
    [5, 1],
    [3, 2],
  ]),
  // Nível 1 — negativos, testa se o aluno aplica o sinal corretamente
  create2x2Assignment(3, "Determinante 2×2 com negativos", [
    [-2, 3],
    [4, -1],
  ]),
  // Nível 2 — decimais, sem "atalho de cabeça"
  create2x2Assignment(4, "Determinante 2×2 com decimais", [
    [1.5, 2],
    [0.5, 3],
  ]),
  // Nível 3, degrau 1 — 3x3 triangular: só multiplicar a diagonal
  create3x3TriangularAssignment(5, "Determinante 3×3 (matriz triangular)", [
    [2, 3, 1],
    [0, 4, 2],
    [0, 0, 5],
  ]),
  // Nível 3, degrau 2 — 3x3 com os recortes já calculados, só combinar
  create3x3GuidedAssignment(6, "Determinante 3×3 (montando a fórmula)", [
    [2, 1, 1],
    [3, 1, 2],
    [1, 4, 0],
  ]),
  // Nível 3, degrau 3 — 3x3 do zero, expansão em cofatores completa
  create3x3Assignment(7, "Determinante 3×3", [
    [1, 2, 0],
    [0, 1, 3],
    [2, 0, 1],
  ]),
  create3x3Assignment(8, "Determinante 3×3 com negativos", [
    [2, -1, 0],
    [1, 3, -2],
    [0, 1, 1],
  ]),
];
