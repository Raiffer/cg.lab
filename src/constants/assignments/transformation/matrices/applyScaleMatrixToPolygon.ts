import { Assignment, AssignmentType } from "@/types/Assignment";
import { useScene2DStore } from "@/store/scene2DStore";
import { initial2DScalingMatrixValue } from "@/constants/inicial2DMatricesValues";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { generateSquarePoints, generateTrianglePoints } from "@/utils";

interface ApplyScaleMatrixToPolygonProps {
  order: number;
  squareCenter?: [number, number];
  squareSize?: [number, number];
  triangleCenter?: [number, number];
  triangleSize?: number;
  triangleType?: "equilateral" | "isosceles" | "scalene";
  goalScale: [number, number];
}

function createApplyScaleMatrixToPolygon({
  order,
  goalScale,
  squareCenter,
  squareSize,
  triangleCenter,
  triangleSize,
  triangleType,
}: ApplyScaleMatrixToPolygonProps): Assignment {
  let initialPoints: [number, number][] = [];
  if (squareCenter && squareSize)
    initialPoints = generateSquarePoints(squareCenter, squareSize);
  else if (triangleCenter && triangleSize && triangleType)
    initialPoints = generateTrianglePoints(
      triangleCenter,
      triangleType,
      triangleSize
    );

  return {
    assisted: false,
    id: `apply-scale-matrix-to-polygon-${order}`,
    order,
    title: "Aplique a matriz de escala ao polígono",
    instructions:
      "Mova os pontos para a posição resultante da aplicação da matriz de escala.",
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "scaling",
    setup() {
      const { setPolygons } = useScene2DStore.getState();
      setPolygons([
        {
          id: "square",
          color: "blue",
          points: initialPoints.map((point, index) => ({
            id: `point${index}`,
            position: point,
            movable: true,
          })),
        },
      ]);

      const newMatrixValue = initial2DScalingMatrixValue;
      newMatrixValue[0][0].value = goalScale[0];
      newMatrixValue[0][0].editable = false;
      newMatrixValue[1][1].value = goalScale[1];
      newMatrixValue[1][1].editable = false;

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "scaleMatrix",
          type: MatrixType.SCALING,
          dimention: "2D",
          matrixValue: newMatrixValue,
        },
      ]);
    },
    validate() {
      const { getPolygon } = useScene2DStore.getState();
      const polygon = getPolygon("square");
      if (!polygon) return false;

      const transformedPoints = initialPoints.map(point => ({
        x: point[0] * goalScale[0],
        y: point[1] * goalScale[1],
      }));

      const isCorrect = polygon.points.every((point, index) => {
        return (
          point.position[0] === transformedPoints[index].x &&
          point.position[1] === transformedPoints[index].y
        );
      });

      return isCorrect;
    },
  };
}

const applyScaleMatrixToPolygonAssignmentProps: ApplyScaleMatrixToPolygonProps[] =
  [
    {
      order: 1,
      squareCenter: [0, 0],
      squareSize: [1, 1],
      goalScale: [2, 2],
    },
    {
      order: 2,
      squareCenter: [1, 1],
      squareSize: [1, 1],
      goalScale: [2, 2],
    },
    {
      order: 3,
      squareCenter: [0, 0],
      squareSize: [1, 1],
      goalScale: [1, 2],
    },
    {
      order: 4,
      squareCenter: [0.5, 0.5],
      squareSize: [1, 1],
      goalScale: [2, 1],
    },
    {
      order: 5,
      triangleCenter: [0, 0],
      triangleSize: 1,
      triangleType: "equilateral",
      goalScale: [2, 2],
    },
    {
      order: 6,
      triangleCenter: [0, 0],
      triangleSize: 1,
      triangleType: "equilateral",
      goalScale: [1, 2],
    },
    {
      order: 7,
      triangleCenter: [1, 1],
      triangleSize: 1,
      triangleType: "isosceles",
      goalScale: [2, 1],
    },
    {
      order: 8,
      triangleCenter: [-2, 3],
      triangleSize: 2,
      triangleType: "scalene",
      goalScale: [2, 2],
    },
  ];

export const applyScaleMatrixToPolygonAssignmentList =
  applyScaleMatrixToPolygonAssignmentProps.map(createApplyScaleMatrixToPolygon);
