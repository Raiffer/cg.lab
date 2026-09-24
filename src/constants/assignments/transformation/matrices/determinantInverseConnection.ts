import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

/**
 * "Essa Matriz Tem Inversa? (calculando)" — a ponte explícita de volta para
 * o Módulo 1: "matriz inversa" foi definida ali como a que exige
 * det(A) ≠ 0 (a existência da inversa depende do determinante). Diferente
 * de matrixSingularityPrediction.ts (mesma pergunta, mas com o paralelogramo
 * desenhado — o aluno vê a resposta), aqui não tem apoio visual
 * (`hideCanvas: true`): o aluno precisa calcular o determinante de verdade
 * para decidir, sem atalho geométrico.
 *
 * Progressão: 1–3 matrizes 2x2 (reforça a fórmula antes de aumentar a
 * ordem); 4–5 matrizes 3x3 (usa a mesma expansão em cofatores de
 * determinantCalculation.ts, agora a serviço de uma decisão, não só do
 * valor em si).
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

function det3(m: Grid3): number {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

function optionsFor(hasInverse: boolean): TOption[] {
  return [
    { id: "sim", value: "Sim, possui inversa", correct: hasInverse },
    { id: "nao", value: "Não, não possui inversa", correct: !hasInverse },
  ];
}

const baseAssignment = (order: number, title: string) => ({
  id: `determinant-inverse-connection-${order}`,
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

function create2x2Assignment(order: number, title: string, m: Grid2): Assignment {
  const hasInverse = det2(m) !== 0;

  return {
    ...baseAssignment(order, title),
    instructions:
      "Uma matriz quadrada só tem inversa se det(A) ≠ 0. Calcule det(A): essa matriz possui inversa?",
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: m.map(row =>
            row.map(value => ({ value, editable: false }))
          ),
        },
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("A matriz A possui inversa? {resposta}");
      setOptions(optionsFor(hasInverse));
    },
    validate: validateOptions,
  };
}

function create3x3Assignment(order: number, title: string, m: Grid3): Assignment {
  const hasInverse = det3(m) !== 0;

  return {
    ...baseAssignment(order, title),
    instructions:
      "Calcule det(A) pela expansão em cofatores na primeira linha (a=a₁₁, b=a₁₂, c=a₁₃): essa matriz possui inversa?",
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: m.map(row =>
            row.map(value => ({ value, editable: false }))
          ),
        },
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("A matriz A possui inversa? {resposta}");
      setOptions(optionsFor(hasInverse));
    },
    validate: validateOptions,
  };
}

export const determinantInverseConnectionAssignmentList: Assignment[] = [
  // Nível 1 — 2x2, determinante não nulo, caso direto
  create2x2Assignment(1, "Tem Inversa? (2×2)", [
    [2, 3],
    [1, 4],
  ]),
  // Nível 1 — 2x2, linhas proporcionais, det = 0
  create2x2Assignment(2, "Tem Inversa? (2×2, singular)", [
    [2, 4],
    [1, 2],
  ]),
  // Nível 2 — 2x2, decimais, det não nulo mas pequeno
  create2x2Assignment(3, "Tem Inversa? (2×2, decimais)", [
    [1.5, 3],
    [0.5, 1.2],
  ]),
  // Nível 3 — 3x3, det não nulo
  create3x3Assignment(4, "Tem Inversa? (3×3)", [
    [1, 0, 2],
    [2, 1, 0],
    [0, 1, 1],
  ]),
  // Nível 3 — 3x3, linha de zeros, det = 0
  create3x3Assignment(5, "Tem Inversa? (3×3, singular)", [
    [1, 2, 3],
    [0, 0, 0],
    [4, 5, 6],
  ]),
];
