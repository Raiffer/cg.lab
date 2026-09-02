import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import {
  applyTransformationsToPolygon,
  create2DScaleMatrix,
} from "@/utils/matrix";
import { createSquare } from "@/utils/polygon";

interface ScalePolygonAssignmentProps {
  order: number;
  title?: string;
  instructions?: string;
  squareCenter: [number, number];
  squareSize: [number, number];
  goalScale: [number, number];
}

function createScalePolygonAssignment({
  order,
  title,
  instructions,
  squareCenter,
  squareSize,
  goalScale,
}: ScalePolygonAssignmentProps): Assignment {
  const square = createSquare("square", "blue", squareCenter, squareSize);

  const scaleMatrix = create2DScaleMatrix(goalScale[0], goalScale[1]);
  const targetSquare = applyTransformationsToPolygon(square, [scaleMatrix]);

  return {
    assisted: false,
    id: `scale-polygon-${order}`,
    title: title || "Matriz de Escala",
    instructions:
      instructions ||
      "Altere a matriz de escala para que escale o quadrado para o objetivo",
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "scaling-matrix",
    setup: () => {
      const { addPolygon, setObjectivePolygons } = useScene2DStore.getState();
      addPolygon(square);
      setObjectivePolygons([
        {
          ...targetSquare,
          id: "target-square",
          color: "green",
        },
      ]);

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: "scale-matrix",
        polygonRefId: "square",
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
      const { getPolygon } = useScene2DStore.getState();
      const polygon = getPolygon("square");
      if (!polygon || !polygon.scale) return false;

      const isCorrect =
        polygon.scale[0] === goalScale[0] && polygon.scale[1] === goalScale[1];
      return isCorrect;
    },
  };
}

const scalePolygonAssignmentsProps: ScalePolygonAssignmentProps[] = [
  {
    order: 1,
    title: "Escalar o quadrado para o dobro do tamanho",
    instructions:
      "Altere a matriz de escala para que o quadrado fique com o dobro do tamanho.",
    squareCenter: [0, 0],
    squareSize: [1, 1],
    goalScale: [2, 2],
  },
  {
    order: 2,
    title: "Escala não uniforme no eixo X",
    instructions:
      "Altere a matriz de escala para que o quadrado fique mais largo.",
    squareCenter: [0, 0],
    squareSize: [1, 1],
    goalScale: [2, 1],
  },
  {
    order: 3,
    title: "Escala não uniforme no eixo Y",
    instructions:
      "Altere a matriz de escala para que o quadrado fique mais alto.",
    squareCenter: [0, 0],
    squareSize: [1, 1],
    goalScale: [1, 2],
  },
  {
    order: 4,
    title: "Escala fora da origem",
    squareCenter: [0.5, 0.5],
    squareSize: [1, 1],
    goalScale: [2, 2],
  },
  {
    order: 5,
    title: "Escala não uniforme fora da origem no eixo X",
    squareCenter: [1, 1],
    squareSize: [1, 1],
    goalScale: [2, 1],
  },
  {
    order: 6,
    title: "Escala não uniforme fora da origem no eixo Y",
    squareCenter: [1, 1],
    squareSize: [1, 1],
    goalScale: [1, 2],
  },
  {
    order: 7,
    title: "Escala fora da origem",
    squareCenter: [1.5, 1.5],
    squareSize: [1, 1],
    goalScale: [2, 2],
  },
];

export const scalePolygonAssignmentList = scalePolygonAssignmentsProps.map(
  createScalePolygonAssignment
);
