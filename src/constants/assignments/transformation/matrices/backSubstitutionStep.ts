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

/**
 * "Substituição Retroativa" — com o sistema já em forma triangular, resolver
 * é só substituir de baixo para cima: x₃ sai direto da última equação,
 * depois x₂ (usando o x₃ já conhecido), depois x₁ (usando os dois). Cada
 * instância vira TRÊS exercícios em sequência (x₃, depois x₂, depois x₁,
 * igual ao padrão já usado em determinantSignPrediction.ts) em vez de pedir
 * o vetor solução inteiro de uma vez — cada passo é uma única substituição
 * e uma conta simples, nunca as três variáveis simultâneas na cabeça.
 *
 * As instâncias são construídas AO CONTRÁRIO: escolho a solução (x₁,x₂,x₃)
 * primeiro, e os termos independentes são calculados a partir dela — nunca
 * o inverso (montar o sistema e resolver à mão), o que eliminaria o risco
 * de eu errar uma conta na instância de exemplo.
 *
 * Progressão: 1–2 coeficientes 1 na diagonal (a substituição é a única
 * conta real); 3 com um coeficiente diferente de 1 na diagonal; 4–5
 * soluções com números negativos.
 */

interface BackSubstitutionInstanceProps {
  order: number;
  title?: string;
  // Coeficientes da parte triangular (acima da diagonal incluída); os
  // termos independentes são derivados da solução, não digitados à mão.
  row1: [number, number, number]; // a1·x1 + b1·x2 + c1·x3
  row2: [number, number]; // a2·x2 + b2·x3
  row3: number; // a3·x3
  solution: [number, number, number]; // x1, x2, x3 verdadeiros
}

function formatNumber(value: number): number {
  return Math.round(value * 100) / 100;
}

function makeOptions(correctValue: number, distractors: number[]): TOption[] {
  const rounded = formatNumber(correctValue);
  const seen = new Set<number>([rounded]);
  const uniqueDistractors = distractors
    .map(formatNumber)
    .filter(value => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  return shuffleArray([
    { id: "correct", value: String(rounded), correct: true },
    ...uniqueDistractors.map((value, index) => ({
      id: `distractor-${index}`,
      value: String(value),
      correct: false,
    })),
  ]);
}

function baseAssignment(id: string, order: number, title: string) {
  return {
    id,
    order,
    title,
    assisted: false,
    hideCanvas: true,
    subjectCategory: "linear-systems" as const,
  };
}

function validateOptions(): boolean {
  const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
  const answer = selectedOptions["resposta"];
  return answer ? answer.correct : false;
}

function showMatrix(row1: [number, number, number, number], row2: [number, number, number], row3: number, rhs3: number) {
  useFillBlankMatrixInputStore.getState().setMatrices([
    {
      id: "augmented-matrix",
      label: "Sistema (já triangular)",
      type: MatrixType.IDENTITY,
      dimention: "2D",
      matrixValue: [
        row1.map(value => ({ value, editable: false })),
        [0, row2[0], row2[1], row2[2]].map(value => ({ value, editable: false })),
        [0, 0, row3, rhs3].map(value => ({ value, editable: false })),
      ],
    },
  ]);
}

function createBackSubstitutionSequence({
  order,
  row1,
  row2,
  row3,
  solution,
}: Omit<BackSubstitutionInstanceProps, "title">): Assignment[] {
  const [x1, x2, x3] = solution;
  const rhs1 = row1[0] * x1 + row1[1] * x2 + row1[2] * x3;
  const rhs2 = row2[0] * x2 + row2[1] * x3;
  const rhs3 = row3 * x3;

  const fullRow1: [number, number, number, number] = [
    row1[0],
    row1[1],
    row1[2],
    rhs1,
  ];
  const fullRow2: [number, number, number] = [row2[0], row2[1], rhs2];

  // Etapa 1 — x3, direto da última equação: a3·x3 = rhs3
  const stepX3: Assignment = {
    ...baseAssignment(`back-substitution-${order}-x3`, order, "Substituição Retroativa: x₃"),
    instructions: `A última equação do sistema é ${row3}x₃ = ${rhs3}. Qual é x₃?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    feedback: {
      correct: `x₃ = ${rhs3}/${row3} = ${x3}.`,
      incorrect: `Isole x₃: divida os dois lados por ${row3}.`,
    },
    setup() {
      showMatrix(fullRow1, fullRow2, row3, rhs3);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("x₃ = {resposta}");
      setOptions(
        makeOptions(x3, [
          rhs3, // esqueceu de dividir pelo coeficiente
          -x3, // erro de sinal
        ])
      );
    },
    validate: validateOptions,
  };

  // Etapa 2 — x2, substituindo x3: a2·x2 + b2·x3 = rhs2
  const stepX2: Assignment = {
    ...baseAssignment(`back-substitution-${order}-x2`, order, "Substituição Retroativa: x₂"),
    instructions: `Você já viu que x₃ = ${x3}. A segunda equação é ${row2[0]}x₂ + ${row2[1]}x₃ = ${rhs2}. Qual é x₂?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    feedback: {
      correct: `${row2[0]}x₂ = ${rhs2} − ${row2[1]}·${x3} = ${rhs2 - row2[1] * x3} → x₂ = ${x2}.`,
      incorrect: `Primeiro substitua x₃ = ${x3} na equação, depois isole x₂.`,
    },
    setup() {
      showMatrix(fullRow1, fullRow2, row3, rhs3);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("x₂ = {resposta}");
      setOptions(
        makeOptions(x2, [
          rhs2 / row2[0], // esqueceu de substituir x3
          (rhs2 + row2[1] * x3) / row2[0], // somou em vez de subtrair
        ])
      );
    },
    validate: validateOptions,
  };

  // Etapa 3 — x1, substituindo x2 e x3: a1·x1 + b1·x2 + c1·x3 = rhs1
  const stepX1: Assignment = {
    ...baseAssignment(`back-substitution-${order}-x1`, order, "Substituição Retroativa: x₁"),
    instructions: `Você já viu que x₃ = ${x3} e x₂ = ${x2}. A primeira equação é ${row1[0]}x₁ + ${row1[1]}x₂ + ${row1[2]}x₃ = ${rhs1}. Qual é x₁?`,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    feedback: {
      correct: `${row1[0]}x₁ = ${rhs1} − ${row1[1]}·${x2} − ${row1[2]}·${x3} = ${rhs1 - row1[1] * x2 - row1[2] * x3} → x₁ = ${x1}. Solução completa: (${x1}, ${x2}, ${x3}).`,
      incorrect: `Substitua x₂ = ${x2} e x₃ = ${x3} na equação antes de isolar x₁.`,
    },
    setup() {
      showMatrix(fullRow1, fullRow2, row3, rhs3);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("x₁ = {resposta}");
      setOptions(
        makeOptions(x1, [
          rhs1 / row1[0], // esqueceu de substituir x2 e x3
          (rhs1 - row1[1] * x2) / row1[0], // esqueceu o termo com x3
        ])
      );
    },
    validate: validateOptions,
  };

  return [stepX3, stepX2, stepX1];
}

const backSubstitutionProps: Omit<BackSubstitutionInstanceProps, "order">[] = [
  // Nível 1: diagonal toda 1, a substituição é a única conta
  {
    row1: [1, 2, -1],
    row2: [1, 3],
    row3: 1,
    solution: [8, -1, 2],
  },
  {
    row1: [1, -2, 3],
    row2: [1, -1],
    row3: 1,
    solution: [4, 2, 5],
  },
  // Nível 2: um coeficiente na diagonal diferente de 1
  {
    row1: [1, 1, 2],
    row2: [2, -1],
    row3: 1,
    solution: [3, 1, -2],
  },
  // Nível 3: solução com números negativos
  {
    row1: [1, 0, -2],
    row2: [1, 3],
    row3: 1,
    solution: [-3, 2, -4],
  },
  {
    row1: [1, 2, 1],
    row2: [1, -2],
    row3: 1,
    solution: [5, -3, -1],
  },
];

export const backSubstitutionStepAssignmentList: Assignment[] =
  backSubstitutionProps.flatMap((props, index) =>
    createBackSubstitutionSequence({ ...props, order: index + 1 })
  );
