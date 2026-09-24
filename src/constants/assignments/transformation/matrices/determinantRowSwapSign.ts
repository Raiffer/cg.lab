import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { shuffleArray } from "@/utils";

/**
 * "Efeito da Troca de Linhas/Colunas" — trocar duas linhas (ou duas
 * colunas) SEMPRE inverte o sinal do determinante (é uma lei, não depende
 * dos números). Por isso não perguntamos "isso inverte o sinal? sim/não" —
 * a resposta seria sempre a mesma em toda instância, e o aluno passaria a
 * reconhecer o padrão da pergunta em vez da matemática. Em vez disso, damos
 * det(A) = X (com sinal explícito) e pedimos o novo determinante depois da
 * operação — isso exige aplicar a propriedade de verdade, não só recitá-la.
 *
 * Ao confirmar, a cena reage de acordo com a operação: L1/L2 (ou C1/C2, na
 * versão de colunas) trocam de posição na tela, mesma área, orientação
 * invertida — a troca de linhas e a de colunas são a mesma propriedade,
 * vista de dois jeitos geométricos diferentes: linhas de A ou colunas de A.
 *
 * O feedback de erro é diferente por alternativa escolhida (não um texto
 * genérico de "errado"): cada distrator corresponde a uma confusão
 * específica, e a explicação aponta exatamente para ela.
 *
 * Progressão:
 *   1–5  troca de uma linha (Nível 1–3: positivos, negativos, decimais)
 *   6–7  troca de duas COLUNAS: mesma propriedade, generalizada (Nível 4)
 */

type SwapKind = "rows" | "columns";

interface DeterminantRowSwapSignAssignmentProps {
  order: number;
  title?: string;
  swapKind: SwapKind;
  rowA: [number, number];
  rowB: [number, number];
}

const SWAP_KIND_LABEL: Record<SwapKind, string> = {
  rows: "as linhas 1 e 2",
  columns: "as colunas 1 e 2",
};

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function incorrectFeedbackFor(optionId: string | undefined): string {
  switch (optionId) {
    case "forgot-flip":
      return "A troca não mantém o determinante igual: o módulo continua o mesmo, mas o sinal inverte.";
    case "doubled":
      return "A troca não altera o tamanho da área (o módulo do determinante). No máximo o sinal muda.";
    case "zeroed":
      return "A troca não anula o determinante: a área não desaparece, só a orientação pode se inverter.";
    default:
      return "Releia o valor de det(A) informado e aplique a propriedade da troca de linhas/colunas.";
  }
}

function createDeterminantRowSwapSignAssignment({
  order,
  title,
  swapKind,
  rowA,
  rowB,
}: DeterminantRowSwapSignAssignmentProps): Assignment {
  const determinant = rowA[0] * rowB[1] - rowA[1] * rowB[0];
  const correctValue = -determinant;
  const doubled = 2 * determinant;

  const options: TOption[] = shuffleArray([
    { id: "correct", value: String(correctValue), correct: true },
    { id: "forgot-flip", value: String(determinant), correct: false },
    { id: "doubled", value: String(doubled), correct: false },
    { id: "zeroed", value: "0", correct: false },
  ]);

  // For "columns", show the matrix's column vectors (C1, C2) instead of its
  // row vectors — same shape/area, different geometric reading of A.
  const vectorA: [number, number] =
    swapKind === "columns" ? [rowA[0], rowB[0]] : rowA;
  const vectorB: [number, number] =
    swapKind === "columns" ? [rowA[1], rowB[1]] : rowB;
  const label1 = swapKind === "columns" ? "C1" : "L1";
  const label2 = swapKind === "columns" ? "C2" : "L2";

  function drawScene(v1: [number, number], v2: [number, number]) {
    const { setVectors, setPolygons } = useScene2DStore.getState();
    setVectors([
      { id: "vec-1", tail: [0, 0], tip: v1, color: "red", label: label1 },
      { id: "vec-2", tail: [0, 0], tip: v2, color: "green", label: label2 },
    ]);
    setPolygons([
      {
        id: "parallelogram",
        color: "purple",
        opacity: 0.35,
        points: [
          { id: "p0", position: [0, 0], movable: false },
          { id: "p1", position: v1, movable: false },
          {
            id: "p2",
            position: [v1[0] + v2[0], v1[1] + v2[1]],
            movable: false,
          },
          { id: "p3", position: v2, movable: false },
        ],
      },
    ]);
  }

  return {
    id: `determinant-row-swap-sign-${order}`,
    order,
    title: title || "Efeito da Troca de Linhas",
    instructions: `det(A) = ${formatSigned(determinant)}. Depois de trocar ${SWAP_KIND_LABEL[swapKind]} de A, qual será o novo determinante?`,
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "determinants",
    feedback: {
      correct: `Antes: det(A) = ${formatSigned(determinant)}. Depois: det(A) = ${formatSigned(correctValue)}. Módulo igual (${Math.abs(determinant)}), sinal invertido: mesma área, orientação invertida.`,
      incorrect: () => {
        const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
        return incorrectFeedbackFor(selectedOptions["resposta"]?.id);
      },
    },
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          liveStatLabel: () => `det(A) = ${formatSigned(determinant)}`,
          matrixValue: [
            [
              { value: rowA[0], editable: false },
              { value: rowA[1], editable: false },
            ],
            [
              { value: rowB[0], editable: false },
              { value: rowB[1], editable: false },
            ],
          ],
        },
      ]);

      drawScene(vectorA, vectorB);

      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("O novo determinante é {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      if (!answer) return false;

      // Visual payoff regardless of correctness: the vectors actually swap
      // on screen, so the student sees the same-area, now-mirrored shape.
      drawScene(vectorB, vectorA);

      return answer.correct;
    },
  };
}

const determinantRowSwapSignProps: Omit<
  DeterminantRowSwapSignAssignmentProps,
  "order"
>[] = [
  // Nível 1: valores pequenos e positivos
  { swapKind: "rows", rowA: [2, 1], rowB: [1, 3] },
  { swapKind: "rows", rowA: [4, 0], rowB: [2, 3] },
  // Nível 2: negativos
  { swapKind: "rows", rowA: [-1, 2], rowB: [3, 1] },
  // Nível 2: decimais — não dá pra "adivinhar" só olhando os inteiros
  { swapKind: "rows", rowA: [1.5, 2], rowB: [0.5, 3] },
  // Nível 3: determinante já negativo — o aluno precisa negar um negativo
  { swapKind: "rows", rowA: [1, 4], rowB: [3, 1] },
  // Nível 4: troca de colunas — mesma propriedade, generalizada
  { swapKind: "columns", rowA: [3, 1], rowB: [0, 2] },
  { swapKind: "columns", rowA: [1, -2], rowB: [3, 1] },
];

export const determinantRowSwapSignAssignmentList =
  determinantRowSwapSignProps.map((props, index) =>
    createDeterminantRowSwapSignAssignment({ ...props, order: index + 1 })
  );
