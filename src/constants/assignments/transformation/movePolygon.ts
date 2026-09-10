import { Assignment, AssignmentType } from "@/types/Assignment";
import { useScene2DStore } from "@/store/scene2DStore";
import { generateSquarePoints } from "@/utils";

interface TransformationMovePolygonAssignmentProps {
  order: number;
  initialCenter: [number, number];
  size: [number, number];
  goalCenter: [number, number];
}

function createTransformationMovePolygonAssignment({
  order,
  initialCenter,
  size,
  goalCenter,
}: TransformationMovePolygonAssignmentProps): Assignment {
  const initialPoints = generateSquarePoints(initialCenter, size);
  const translation: [number, number] = [
    goalCenter[0] - initialCenter[0],
    goalCenter[1] - initialCenter[1],
  ];

  return {
    assisted: false,
    id: `transformation-move-polygon-${order}`,
    order,
    title: "Translade o polígono",
    instructions: `Aplique a translação (${translation[0]}, ${translation[1]}).`,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "translation",
    setup: () => {
      useScene2DStore.getState().setPolygons([
        {
          id: "initial-polygon",
          color: "gray",
          opacity: 0.35,
          strokeStyle: "dashed",
          points: initialPoints.map((point, index) => ({
            id: `initial-point${index}`,
            position: point,
            movable: false,
            color: "gray",
          })),
        },
        {
          id: "polygon",
          color: "blue",
          fullMovable: true,
          points: initialPoints.map((point, index) => ({
            id: `point${index}`,
            position: point,
            movable: false,
          })),
        },
      ]);
    },
    validate: () => {
      const polygon = useScene2DStore.getState().getPolygon("polygon");
      if (!polygon || polygon.points.length !== initialPoints.length) {
        return false;
      }

      return polygon.points.every((point, index) => {
        const expectedPosition: [number, number] = [
          initialPoints[index][0] + translation[0],
          initialPoints[index][1] + translation[1],
        ];

        return (
          point.position[0] === expectedPosition[0] &&
          point.position[1] === expectedPosition[1]
        );
      });
    },
  };
}

const transformationMovePolygonAssignmentProps: TransformationMovePolygonAssignmentProps[] =
  [
    {
      order: 1,
      initialCenter: [0, 0],
      size: [2, 2],
      goalCenter: [3, 2],
    },
    {
      order: 2,
      initialCenter: [-2, 1],
      size: [1, 2],
      goalCenter: [1, -2],
    },
    {
      order: 3,
      initialCenter: [2, -2],
      size: [2, 1],
      goalCenter: [-1, 1.5],
    },
    {
      order: 4,
      initialCenter: [-5, 4],
      size: [3, 3],
      goalCenter: [5, 1.5],
    },
    {
      order: 5,
      initialCenter: [1.5, 2.5],
      size: [2, 2],
      goalCenter: [-2.5, -1.5],
    },
  ];

export const transformationMovePolygonAssignmentsList =
  transformationMovePolygonAssignmentProps.map(
    createTransformationMovePolygonAssignment
  );
