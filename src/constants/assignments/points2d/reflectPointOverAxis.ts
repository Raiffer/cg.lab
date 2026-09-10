import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

interface ReflectPointOverAxisAssignmentProps {
  order: number;
  title: string;
  instructions: string;
  initialPointPosition: [number, number];
  axis: "x" | "y";
}

function createReflectPointOverAxisAssignment({
  order,
  title,
  instructions,
  initialPointPosition,
  axis,
}: ReflectPointOverAxisAssignmentProps): Assignment {
  const goalPosition: [number, number] =
    axis === "x"
      ? [initialPointPosition[0], -initialPointPosition[1]]
      : [-initialPointPosition[0], initialPointPosition[1]];

  return {
    id: `reflect-point-axis-${order}`,
    order,
    title,
    instructions,
    assisted: false,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "points",
    setup: () => {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A",
          position: initialPointPosition,
          movable: true,
          color: "red",
          label: "A",
          constraints: {
            roundCoordinates: true,
          },
        },
      ]);
    },
    validate: () => {
      const { getPoint } = useScene2DStore.getState();
      const point = getPoint("A");
      if (!point) return false;

      return (
        point.position[0] === goalPosition[0] &&
        point.position[1] === goalPosition[1]
      );
    },
  };
}

const reflectPointOverAxisAssignments: Omit<
  ReflectPointOverAxisAssignmentProps,
  "order"
>[] = [
  {
    title: "Reflexão no Eixo X",
    instructions:
      "Reflita o ponto A em relação ao eixo x, movendo-o para a posição espelhada.",
    initialPointPosition: [3, 2],
    axis: "x",
  },
  {
    title: "Reflexão no Eixo Y",
    instructions:
      "Reflita o ponto A em relação ao eixo y, movendo-o para a posição espelhada.",
    initialPointPosition: [-2, 4],
    axis: "y",
  },
];

export const reflectPointOverAxisAssignmentsList =
  reflectPointOverAxisAssignments.map((assignment, index) =>
    createReflectPointOverAxisAssignment({
      ...assignment,
      order: index + 1,
    })
  );
