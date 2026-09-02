import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

interface ScalePointAssignmentProps {
  order: number;
  title?: string;
  instructions?: string;
  initialPosition: [number, number];
  goalScale: [number, number];
}

function createScalePointAssignment({
  order,
  title,
  instructions,
  initialPosition,
  goalScale,
}: ScalePointAssignmentProps): Assignment {
  const goalPointScale = [
    initialPosition[0] * goalScale[0],
    initialPosition[1] * goalScale[1],
  ];

  return {
    assisted: false,
    id: `scale-point-${order}`,
    title: title || "Matriz de Escala em Ponto",
    instructions:
      instructions ||
      `Altere a matriz de escala para que o ponto fique na posição (${goalPointScale[0]}, ${goalPointScale[1]}).`,
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "scaling-matrix",
    setup: () => {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A",
          color: "blue",
          position: initialPosition,
          movable: false,
          label: "A",
        },
      ]);

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: "scale-matrix",
        pointRefId: "A",
        type: MatrixType.SCALING,
        dimention: "2D",
        matrixValue: [
          [
            { value: 1, editable: true },
            { value: 0, editable: false },
            { value: 0, editable: false },
          ],
          [
            { value: 0, editable: false },
            { value: 1, editable: true },
            { value: 0, editable: false },
          ],
          [
            { value: 0, editable: false },
            { value: 0, editable: false },
            { value: 1, editable: false },
          ],
        ],
      });
    },
    validate: () => {
      const { getPoint } = useScene2DStore.getState();
      const point = getPoint("A");
      if (!point || !point.scale) return false;

      const pointScaled = [
        initialPosition[0] * point.scale[0],
        initialPosition[1] * point.scale[1],
      ];

      const isCorrect =
        pointScaled[0] === goalPointScale[0] &&
        pointScaled[1] === goalPointScale[1];
      return isCorrect;
    },
  };
}

const scalePointAssignmentsProps: ScalePointAssignmentProps[] = [
  {
    order: 1,
    title: "Matriz de Escala em Ponto no eixo X",
    initialPosition: [1, 0],
    goalScale: [2, 0],
  },
  {
    order: 2,
    title: "Matriz de Escala em Ponto no eixo Y",
    initialPosition: [0, 1],
    goalScale: [0, 2],
  },
  {
    order: 3,
    title: "Escalando em ambos os eixos",
    instructions:
      "Altere a matriz de escala para que o ponto fique na posição (2, 2).",
    initialPosition: [1, 1],
    goalScale: [2, 2],
  },
  {
    order: 4,
    title: "Matriz de Reflexão no eixo X em Ponto",
    instructions:
      "Altere a matriz de escala para que o ponto seja refletido no eixo X (-1, 1).",
    initialPosition: [1, 1],
    goalScale: [-1, 1],
  },
  {
    order: 5,
    title: "Matriz de Reflexão no eixo Y em Ponto",
    instructions:
      "Altere a matriz de escala para que o ponto seja refletido no eixo Y (1, -1).",
    initialPosition: [1, 1],
    goalScale: [1, -1],
  },
  {
    order: 6,
    title: "Matriz de Reflexão na Origem em Ponto",
    instructions:
      "Altere a matriz de escala para que o ponto seja refletido na origem (-1, -1).",
    initialPosition: [1, 1],
    goalScale: [-1, -1],
  },
];

export const scalePointAssignmentList = scalePointAssignmentsProps.map(
  createScalePointAssignment
);
