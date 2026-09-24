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
 * "Propriedade do Escalar numa Linha" — multiplicar UMA linha por k
 * multiplica o determinante por k (não por k², mesmo numa matriz 2x2).
 * O distrator mais importante aqui é k²·X: é o erro de confundir "multipliquei
 * uma linha" com "multipliquei a matriz inteira" (k·A, que aí sim escala o
 * determinante por kⁿ — já visto em matrixScalarMultiplication.ts, categoria
 * "multiplication"). Colocar os dois lado a lado é proposital: o aluno
 * precisa perceber que são operações diferentes, não a mesma regra.
 *
 * Progressão: 1–2 k inteiro > 1 (escala); 3 k fracionário (0 < k < 1,
 * encolhe); 4 k negativo (inverte o sinal, além de escalar); 5 combina
 * negativo e fracionário.
 */

interface DeterminantScalarRowPropertyAssignmentProps {
  order: number;
  title?: string;
  rowA: [number, number];
  rowB: [number, number];
  scalar: number;
  /** Which row (1 or 2) gets multiplied by `scalar`. */
  scaledRow: 1 | 2;
}

function createDeterminantScalarRowPropertyAssignment({
  order,
  title,
  rowA,
  rowB,
  scalar,
  scaledRow,
}: DeterminantScalarRowPropertyAssignmentProps): Assignment {
  const determinant = rowA[0] * rowB[1] - rowA[1] * rowB[0];
  const correct = scalar * determinant;

  const options: TOption[] = shuffleArray([
    { id: "correct", value: String(correct), correct: true },
    { id: "whole-matrix", value: String(scalar * scalar * determinant), correct: false },
    { id: "unchanged", value: String(determinant), correct: false },
    { id: "added", value: String(scalar + determinant), correct: false },
  ]);

  return {
    id: `determinant-scalar-row-property-${order}`,
    order,
    title: title || "Multiplicar uma Linha pelo Escalar k",
    instructions: `det(A) = ${determinant}. Se multiplicarmos só a linha ${scaledRow} por k = ${scalar}, qual será o novo determinante?`,
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "determinants",
    setup() {
      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          type: MatrixType.IDENTITY,
          dimention: "2D",
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

      const { setVectors, setPolygons } = useScene2DStore.getState();
      setVectors([
        { id: "row-a", tail: [0, 0], tip: rowA, color: "red", label: "L1" },
        { id: "row-b", tail: [0, 0], tip: rowB, color: "green", label: "L2" },
      ]);
      setPolygons([
        {
          id: "parallelogram",
          color: "purple",
          opacity: 0.35,
          points: [
            { id: "p0", position: [0, 0], movable: false },
            { id: "p1", position: rowA, movable: false },
            {
              id: "p2",
              position: [rowA[0] + rowB[0], rowA[1] + rowB[1]],
              movable: false,
            },
            { id: "p3", position: rowB, movable: false },
          ],
        },
      ]);

      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("O novo determinante é {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      if (!answer) return false;

      // Visual payoff: actually apply the row-scaling to the scene, so a
      // correct answer is confirmed by seeing the parallelogram stretch.
      const scaledA: [number, number] =
        scaledRow === 1 ? [rowA[0] * scalar, rowA[1] * scalar] : rowA;
      const scaledB: [number, number] =
        scaledRow === 2 ? [rowB[0] * scalar, rowB[1] * scalar] : rowB;

      const { setVectors, setPolygons } = useScene2DStore.getState();
      setVectors([
        { id: "row-a", tail: [0, 0], tip: scaledA, color: "red", label: "L1" },
        { id: "row-b", tail: [0, 0], tip: scaledB, color: "green", label: "L2" },
      ]);
      setPolygons([
        {
          id: "parallelogram",
          color: "purple",
          opacity: 0.35,
          points: [
            { id: "p0", position: [0, 0], movable: false },
            { id: "p1", position: scaledA, movable: false },
            {
              id: "p2",
              position: [scaledA[0] + scaledB[0], scaledA[1] + scaledB[1]],
              movable: false,
            },
            { id: "p3", position: scaledB, movable: false },
          ],
        },
      ]);

      return answer.correct;
    },
  };
}

const determinantScalarRowPropertyProps: Omit<
  DeterminantScalarRowPropertyAssignmentProps,
  "order"
>[] = [
  // Nível 1: k inteiro simples, escala a área
  { rowA: [2, 1], rowB: [1, 3], scalar: 2, scaledRow: 1 },
  { rowA: [1, 4], rowB: [3, 0], scalar: 3, scaledRow: 2 },
  // Nível 2: k fracionário, encolhe a área
  { rowA: [2, 0], rowB: [1, 4], scalar: 0.5, scaledRow: 1 },
  // Nível 3: k negativo, inverte o sinal e escala ao mesmo tempo
  { rowA: [3, 1], rowB: [1, 2], scalar: -2, scaledRow: 2 },
  // Nível 3: negativo e fracionário juntos
  { rowA: [4, 1], rowB: [2, 3], scalar: -0.5, scaledRow: 1 },
];

export const determinantScalarRowPropertyAssignmentList =
  determinantScalarRowPropertyProps.map((props, index) =>
    createDeterminantScalarRowPropertyAssignment({ ...props, order: index + 1 })
  );
