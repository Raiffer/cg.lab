import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

interface AlignPointsInAxisAssignmentProps {
  order: number;
  title: string;
  instructions: string;
  axisToAlign: "x" | "y";
}

function createAlignPointsInAxisAssignment({
  order,
  title,
  instructions,
  axisToAlign,
}: AlignPointsInAxisAssignmentProps): Assignment {
  return {
    assisted: false,
    id: `align-points-axis-${order}`,
    order,
    title,
    instructions,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "points",
    setup: () => {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A",
          position: [-2, 4],
          movable: true,
          color: "blue",
          label: "A",
          constraints: {
            roundCoordinates: true,
          },
        },
        {
          id: "B",
          position: [1, -2],
          movable: true,
          color: "green",
          label: "B",
          constraints: {
            roundCoordinates: true,
          },
        },
      ]);
    },
    validate: () => {
      const { getPoint } = useScene2DStore.getState();
      const pointA = getPoint("A");
      const pointB = getPoint("B");

      if (axisToAlign === "x") {
        const isCorrect =
          pointA?.position[1] === 0 && pointB?.position[1] === 0;
        return isCorrect;
      } else {
        const isCorrect =
          pointA?.position[0] === 0 && pointB?.position[0] === 0;
        return isCorrect;
      }
    },
  };
}

export const alignPointsInXAxisAssignment = createAlignPointsInAxisAssignment({
  order: 5,
  title: "Alinhe os pontos no eixo x",
  instructions: "Alinhe os pontos A e B no eixo x.",
  axisToAlign: "x",
});

export const alignPointsInYAxisAssignment = createAlignPointsInAxisAssignment({
  order: 6,
  title: "Alinhe os pontos no eixo y",
  instructions: "Alinhe os pontos A e B no eixo y.",
  axisToAlign: "y",
});
