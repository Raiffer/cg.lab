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
 * "Multiplicador do Pivô" — o primeiro passo do escalonamento manual
 * (Eliminação Gaussiana) na prática: pra zerar um elemento usando a linha
 * do pivô, por qual número multiplicar a linha do pivô antes de somar?
 * k = −alvo / pivô (assim alvo + k·pivô = 0). Uma única divisão — o resto
 * do escalonamento (aplicar o multiplicador na linha toda) fica pra outra
 * questão; aqui o foco é só essa conta isolada, que é onde a maioria dos
 * erros de escalonamento manual realmente acontece.
 *
 * Todas as instâncias são escolhidas para que a divisão dê um número
 * inteiro — a ideia não é testar divisão difícil, é testar se o aluno sabe
 * QUAL conta fazer.
 *
 * Progressão: 1–3 pivô e alvo positivos (aquecimento); 4 alvo negativo; 5
 * pivô negativo (o caso que mais gera erro de sinal).
 */

/** Rounds away binary floating-point noise / repeating decimals (e.g. the
 * "inverted" distractor below is often a fraction like -2/6) so every MC
 * option shows a short, clean number instead of a long decimal. */
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

interface PivotMultiplierAssignmentProps {
  order: number;
  title?: string;
  matrix: [[number, number, number], [number, number, number]];
  pivotRow: 1 | 2;
  targetRow: 1 | 2;
}

function createPivotMultiplierAssignment({
  order,
  title,
  matrix,
  pivotRow,
  targetRow,
}: PivotMultiplierAssignmentProps): Assignment {
  const pivotValue = matrix[pivotRow - 1][0];
  const targetValue = matrix[targetRow - 1][0];
  const correct = formatNumber(-targetValue / pivotValue);

  const options = makeOptions(correct, [
    targetValue / pivotValue, // esqueceu o sinal negativo
    -pivotValue / targetValue, // inverteu a divisão
    -targetValue, // esqueceu de dividir pelo pivô
  ]);

  return {
    id: `pivot-multiplier-${order}`,
    order,
    title: title || "Multiplicador do Pivô",
    instructions: `Para zerar o primeiro elemento da linha ${targetRow} (valor ${targetValue}) usando a linha ${pivotRow} como pivô (valor ${pivotValue}), por qual número multiplicamos a linha ${pivotRow} antes de somar?`,
    assisted: false,
    hideCanvas: true,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "linear-systems",
    feedback: {
      correct: `k = −(${targetValue})/(${pivotValue}) = ${correct}. Conferindo: ${targetValue} + ${correct}·${pivotValue} = 0.`,
      incorrect: `Lembre: k é o número que, multiplicado pelo pivô (${pivotValue}) e somado ao alvo (${targetValue}), dá zero. k = −alvo/pivô.`,
    },
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "augmented-matrix",
          label: "Sistema",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: matrix.map(row =>
            row.map(value => ({ value, editable: false }))
          ),
        },
      ]);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("k = {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      return answer ? answer.correct : false;
    },
  };
}

const pivotMultiplierProps: Omit<PivotMultiplierAssignmentProps, "order">[] = [
  // Nível 1: valores pequenos e positivos
  {
    matrix: [
      [2, 3, 5],
      [6, 1, 8],
    ],
    pivotRow: 1,
    targetRow: 2,
  },
  {
    matrix: [
      [3, -1, 4],
      [9, 2, 1],
    ],
    pivotRow: 1,
    targetRow: 2,
  },
  {
    matrix: [
      [4, 2, -3],
      [8, 5, 1],
    ],
    pivotRow: 1,
    targetRow: 2,
  },
  // Nível 2: alvo negativo
  {
    matrix: [
      [5, 1, 2],
      [-15, 4, 3],
    ],
    pivotRow: 1,
    targetRow: 2,
  },
  // Nível 3: pivô negativo — o caso que mais confunde o sinal
  {
    matrix: [
      [-3, 2, 1],
      [12, -1, 5],
    ],
    pivotRow: 1,
    targetRow: 2,
  },
];

export const pivotMultiplierAssignmentList = pivotMultiplierProps.map(
  (props, index) => createPivotMultiplierAssignment({ ...props, order: index + 1 })
);
