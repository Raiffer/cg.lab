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
import { createTetrisPiece } from "@/utils/polygon";
import { TetrisPieceType } from "@/types/TetrisPiece";

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

  const piece = createTetrisPiece(
    "square",
    "blue",
    squareCenter,
    TetrisPieceType.Z,
    squareSize
  );

  return {
    assisted: false,
    id: `rotation-matrix-${order}`,
    title: "Matriz de Rotação no eixo Z",
    instructions:
      "Altere a matriz de rotação para rotacionar o quadrado para o objetivo.",
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "rotation",
    setup: () => {
      const { addPolygon, setObjectivePolygons } = useScene2DStore.getState();
      piece.forEach(square => addPolygon(square));
      setObjectivePolygons(
        piece.map((square, index) => ({
          ...square,
          id: `target-square-${index + 1}`,
          color: "green",
          rotationMatrix:
            create2DRotationMatrix(targetAngleInDegrees).transpose(),
        }))
      );

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: "rotation-matrix-z",
        polygonRefId: piece[0].id,
        polygonRefIds: piece.map(square => square.id),
        type: MatrixType.ROTATION_Z,
        dimention: "2D",
        matrixValue: initial2DRotationMatrixZValue,
      });
    },
    validate: () => {
      const { getMatrixById } = useFillBlankMatrixInputStore.getState();
      const matrix = getMatrixById("rotation-matrix-z");
      if (!matrix?.polygonRefIds?.length) return false;
      const scene = useScene2DStore.getState();

      return matrix.polygonRefIds.every((polygonId, index) => {
        const polygon = scene.getPolygon(polygonId);
        const targetPolygon = scene.getObjectivePolygon(
          `target-square-${index + 1}`
        );
        if (
          !polygon ||
          !polygon.rotationMatrix ||
          !targetPolygon?.rotationMatrix
        ) {
          return false;
        }

        const transformedCurrentPolygon = applyTransformationsToPolygon(
          polygon,
          [polygon.rotationMatrix]
        );
        const transformedTargetPolygon = applyTransformationsToPolygon(
          targetPolygon,
          [targetPolygon.rotationMatrix]
        );

        return transformedCurrentPolygon.points.every((point, pointIndex) => {
          const targetPoint = transformedTargetPolygon.points[pointIndex];
          return (
            Math.abs(point.position[0] - targetPoint.position[0]) <= 0.01 &&
            Math.abs(point.position[1] - targetPoint.position[1]) <= 0.01
          );
        });
      });
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
