import { initial2DRotationMatrixZValue } from "@/constants/inicial2DMatricesValues";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import {
  applyTransformationsToPolygon,
  create2DRotationMatrix,
} from "@/utils/matrix";
import { createSquare } from "@/utils/polygon";

interface RotationMatrixFillInBlankProps {
  order: number;
  targetAngleInDegrees: number;
  squareProps: {
    squareCenter: [number, number];
    squareSize: [number, number];
  };
}

function createRotationmatrixFillInBlankAssignment({
  order,
  targetAngleInDegrees,
  squareProps,
}: RotationMatrixFillInBlankProps): Assignment {
  const { squareCenter, squareSize } = squareProps;

  const square = createSquare("square", "blue", squareCenter, squareSize);

  return {
    assisted: false,
    id: `rotation-matrix-${order}`,
    title: "Matriz de Rotação no eixo Z",
    instructions:
      "Altere a matriz de rotação para rotacionar o quadrado para o objetivo.",
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "rotation-matrix",
    setup: () => {
      const { addPolygon, setObjectivePolygons } = useScene2DStore.getState();
      addPolygon({ ...square, displayAxes: true });
      setObjectivePolygons([
        {
          ...square,
          id: "target-square",
          color: "green",
          rotationMatrix:
            create2DRotationMatrix(targetAngleInDegrees).transpose(),
          displayAxes: true,
        },
      ]);

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: "rotation-matrix-z",
        polygonRefId: "square",
        type: MatrixType.ROTATION_Z,
        dimention: "2D",
        matrixValue: initial2DRotationMatrixZValue,
      });
    },
    validate: () => {
      const { getMatrixById } = useFillBlankMatrixInputStore.getState();
      const matrix = getMatrixById("rotation-matrix-z");
      const square = useScene2DStore.getState().getPolygon("square");
      const targetSquare = useScene2DStore
        .getState()
        .getObjectivePolygon("target-square");
      if (
        !matrix ||
        !square ||
        !targetSquare ||
        !square.rotationMatrix ||
        !targetSquare.rotationMatrix
      )
        return false;

      const transformedCurrentSquare = applyTransformationsToPolygon(square, [
        square.rotationMatrix,
      ]);
      const transformedTargetSquare = applyTransformationsToPolygon(
        targetSquare,
        [targetSquare.rotationMatrix]
      );

      // Check if the transformed square points match the target square points
      for (let i = 0; i < transformedCurrentSquare.points.length; i++) {
        const currentPoint = transformedCurrentSquare.points[i].position;
        const targetPoint = transformedTargetSquare.points[i].position;
        // Allow a small tolerance for floating point comparisons
        if (
          Math.abs(currentPoint[0] - targetPoint[0]) > 0.01 ||
          Math.abs(currentPoint[1] - targetPoint[1]) > 0.01
        ) {
          return false;
        }
      }

      return true;
    },
  };
}

const rotationMatrixFillInBlankProps: RotationMatrixFillInBlankProps[] = [
  {
    order: 1,
    targetAngleInDegrees: 45,
    squareProps: { squareCenter: [0, 0], squareSize: [1, 1] },
  },
  {
    order: 2,
    targetAngleInDegrees: -45,
    squareProps: { squareCenter: [0, 0], squareSize: [1, 1] },
  },
  {
    order: 3,
    targetAngleInDegrees: 45,
    squareProps: { squareCenter: [0.5, 0.5], squareSize: [1, 1] },
  },
  {
    order: 4,
    targetAngleInDegrees: 90,
    squareProps: { squareCenter: [0.5, 0.5], squareSize: [1, 1] },
  },
  {
    order: 5,
    targetAngleInDegrees: -45,
    squareProps: { squareCenter: [1, 1], squareSize: [1, 1] },
  },
  {
    order: 6,
    targetAngleInDegrees: -90,
    squareProps: { squareCenter: [1, 1], squareSize: [1, 1] },
  },
];

export const rotationMatrixFillInBlankAssignments =
  rotationMatrixFillInBlankProps.map(createRotationmatrixFillInBlankAssignment);
