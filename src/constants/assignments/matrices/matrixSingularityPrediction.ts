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

// Neutral color for the parallelogram — deliberately the same regardless of
// whether the matrix is singular, so the tell is the shape's area (or lack
// of it), never a color hint.
const PARALLELOGRAM_COLOR = "purple";

interface MatrixSingularityPredictionAssignmentProps {
  order: number;
  title?: string;
  /** 2x2 matrix, given as [[a, b], [c, d]]. */
  matrix: [[number, number], [number, number]];
}

function createMatrixSingularityPredictionAssignment({
  order,
  title,
  matrix,
}: MatrixSingularityPredictionAssignmentProps): Assignment {
  const [[a, b], [c, d]] = matrix;
  const determinant = a * d - b * c;
  const hasInverse = determinant !== 0;

  // Each row of A, drawn as a vector from the origin. The parallelogram
  // they sweep out visually IS the determinant: it has area when the
  // matrix is invertible, and collapses onto a line (zero area) exactly
  // when it's singular — no calculation required to see it.
  const rowVectorA: [number, number] = [a, b];
  const rowVectorB: [number, number] = [c, d];
  const parallelogramPoints: [number, number][] = [
    [0, 0],
    rowVectorA,
    [rowVectorA[0] + rowVectorB[0], rowVectorA[1] + rowVectorB[1]],
    rowVectorB,
  ];

  const options: TOption[] = [
    { id: "sim", value: "Sim, possui inversa", correct: hasInverse },
    { id: "nao", value: "Não, não possui inversa", correct: !hasInverse },
  ];

  return {
    id: `matrix-singularity-prediction-${order}`,
    order,
    title: title || "Essa Matriz Tem Inversa?",
    instructions:
      "As linhas de A formam o paralelogramo sombreado. Ele tem área, ou achatou numa linha?",
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "matrix-fundamentals",
    setup() {
      const { setVectors, setPolygons } = useScene2DStore.getState();

      setVectors([
        {
          id: "row-a",
          tail: [0, 0],
          tip: rowVectorA,
          color: "red",
          label: "L1",
        },
        {
          id: "row-b",
          tail: [0, 0],
          tip: rowVectorB,
          color: "green",
          label: "L2",
        },
      ]);

      setPolygons([
        {
          id: "parallelogram",
          color: PARALLELOGRAM_COLOR,
          opacity: 0.35,
          points: parallelogramPoints.map((position, index) => ({
            id: `parallelogram-${index}`,
            position,
            movable: false,
          })),
        },
      ]);

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: [
            [
              { value: a, editable: false },
              { value: b, editable: false },
            ],
            [
              { value: c, editable: false },
              { value: d, editable: false },
            ],
          ],
        },
      ]);

      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("A matriz A possui inversa? {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      if (!answer) return false;
      return answer.correct;
    },
  };
}

const matrixSingularityPredictionProps: Omit<
  MatrixSingularityPredictionAssignmentProps,
  "order"
>[] = [
  // Nível 1: matriz identidade, paralelogramo é o quadrado unitário — claramente tem área
  { matrix: [[1, 0], [0, 1]] },
  // Nível 1: uma linha é o dobro exato da outra — vetores colineares, paralelogramo achatado
  { matrix: [[2, 4], [1, 2]] },
  // Nível 2: proporção menos óbvia (números negativos), mas ainda colineares
  { matrix: [[3, -6], [-1, 2]] },
  // Nível 2: pegadinha — os vetores parecem quase alinhados, mas não são — tem área
  { matrix: [[2, 4], [1, 3]] },
  // Nível 3: uma linha é o vetor nulo — não há paralelogramo nenhum
  { matrix: [[0, 0], [5, 3]] },
];

export const matrixSingularityPredictionAssignmentList =
  matrixSingularityPredictionProps.map((props, index) =>
    createMatrixSingularityPredictionAssignment({
      ...props,
      order: index + 1,
    })
  );
