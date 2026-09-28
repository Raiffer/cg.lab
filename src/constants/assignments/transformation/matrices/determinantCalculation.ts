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
 * A versão anterior deste arquivo pedia a expansão em cofatores 3×3
 * completa (3 termos, 6 multiplicações) de cabeça, em 3 questões seguidas
 * (#6–8) — pesado demais pra uma plataforma pensada pra ser respondida sem
 * lápis e papel, só escolhendo entre alternativas. Em vez de simplesmente
 * diminuir os números, a mudança é de ABORDAGEM: para 3×3, o conteúdo
 * agora ensina a RECONHECER estrutura que já revela det(A) = 0 sem nenhuma
 * conta — o mesmo raciocínio usado em matrixSingularityPrediction.ts e
 * determinantInverseConnection.ts, generalizado com mais casos e sem apoio
 * visual desta vez. A conta manual "de verdade" (Regra de Sarrus completa)
 * fica para uma futura questão interativa de arrastar termos, pensada para
 * a mecânica de cálculo em si, não para múltipla escolha.
 *
 * Progressão de dificuldade:
 *   1–4  matriz 2x2, fórmula ad − bc. Distratores reproduzem os dois erros
 *        mais comuns: esquecer o sinal (ad + bc) e inverter a ordem da
 *        subtração (bc − ad).
 *   5    matriz 3x3 TRIANGULAR (zeros abaixo da diagonal): det = a·e·i, o
 *        produto da diagonal — introduz o tamanho 3x3 com a conta mais
 *        simples possível (só multiplicar 3 números).
 *   6–8  três estruturas que garantem det(A) = 0 SEM calcular nada: linha
 *        de zeros, linhas proporcionais, colunas proporcionais — o aluno
 *        aprende a "ler" a matriz em vez de expandir cofatores.
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

/** Degraus 2–4 do 3x3: nenhuma conta — só reconhecer uma estrutura que
 * garante det(A) = 0 (linha/coluna de zeros, ou duas linhas/colunas
 * proporcionais). `correct` ainda é calculado de verdade via det3(m) (nunca
 * assumido como 0 só porque a instância "deveria" dar zero) — é uma
 * checagem de segurança contra erro de digitação na matriz de exemplo.
 * `hint` nomeia a estrutura no próprio enunciado, para o aluno aprender a
 * procurar por ela, não decorar a resposta certa. */
function create3x3RecognizeZeroAssignment(
  order: number,
  title: string,
  m: Grid3,
  hint: string
): Assignment {
  const correct = det3(m);
  const rowASum = m[0][0] + m[0][1] + m[0][2];
  const rowCSum = m[2][0] + m[2][1] + m[2][2];

  const options = makeOptions(correct, [rowASum, rowCSum]);

  return {
    ...baseAssignment(order, title),
    instructions: `Sem calcular nada: ${hint} Qual é det(A)?`,
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
  // Nível 3, degrau 2 — linha inteira de zeros
  create3x3RecognizeZeroAssignment(
    6,
    "Determinante 3×3 (linha de zeros)",
    [
      [2, 5, -1],
      [0, 0, 0],
      [4, 1, 3],
    ],
    "uma linha inteira de A é zero (linha 2)."
  ),
  // Nível 3, degrau 3 — duas linhas proporcionais
  create3x3RecognizeZeroAssignment(
    7,
    "Determinante 3×3 (linhas proporcionais)",
    [
      [1, 2, 3],
      [2, 4, 6],
      [0, 1, 4],
    ],
    "a linha 2 é o dobro da linha 1 (linhas proporcionais)."
  ),
  // Nível 3, degrau 4 — duas colunas proporcionais (generaliza pra colunas)
  create3x3RecognizeZeroAssignment(
    8,
    "Determinante 3×3 (colunas proporcionais)",
    [
      [1, 5, 2],
      [3, 1, 6],
      [0, 4, 0],
    ],
    "a coluna 3 é o dobro da coluna 1 (colunas proporcionais)."
  ),
];
