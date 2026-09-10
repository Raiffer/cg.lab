import { useFillInTheBlankStore } from "@/store/fillInTheBlankStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { vec } from "mafs";

interface PointDisplacementInputProps {
  order: number;
  pointPosition: [number, number];
  goalPosition: [number, number];
}

function createPointDisplacementAssignment({
  order,
  pointPosition,
  goalPosition,
}: PointDisplacementInputProps): Assignment {
  return {
    assisted: false,
    id: `point-displacement-${order}`,
    title: `Desloque o ponto`,
    instructions: `Descreva o vetor de deslocamento do ponto para a posição (${goalPosition[0]}, ${goalPosition[1]}).`,
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    subjectCategory: "vector-definition",
    setup: () => {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A",
          label: "A",
          position: pointPosition,
          movable: false,
          color: "red",
        },
      ]);

      const { setInputs } = useFillInTheBlankStore.getState();
      setInputs([
        {
          dimention: "2D",
          coordinatesValue: { x: "", y: "" },
          pointRef: "A",
          label: "v",
        },
      ]);
    },
    validate: () => {
      const { getInputByPointRef } = useFillInTheBlankStore.getState();
      const { setVectors } = useScene2DStore.getState();
      const vectorInput = getInputByPointRef("A");
      if (!vectorInput) return false;

      const { x, y } = vectorInput.coordinatesValue;
      const inputedVector = [Number(x), Number(y)];
      const displacementVector = vec.sub(goalPosition, pointPosition);

      const isCorrect =
        inputedVector[0] === displacementVector[0] &&
        inputedVector[1] === displacementVector[1];

      if (isCorrect) {
        setVectors([
          {
            id: "displacement-vector",
            tail: pointPosition,
            tip: goalPosition,
            color: "blue",
            label: "v",
          },
        ]);
      }
      return isCorrect;
    },
  };
}

const pointDisplacementAssignmentsProps: PointDisplacementInputProps[] = [
  {
    order: 1,
    pointPosition: [0, 0],
    goalPosition: [3, 4],
  },
  {
    order: 2,
    pointPosition: [1, 2],
    goalPosition: [4, 6],
  },
  {
    order: 3,
    pointPosition: [-1, 2],
    goalPosition: [3, 2],
  },
  {
    order: 4,
    pointPosition: [-3, 4],
    goalPosition: [2, 2],
  },
  {
    order: 5,
    pointPosition: [2, -3],
    goalPosition: [-3, 2],
  },
  {
    order: 6,
    pointPosition: [0, 0],
    goalPosition: [-2, -3],
  },
];

export const pointDisplacementAssignmentList: Assignment[] =
  pointDisplacementAssignmentsProps.map(createPointDisplacementAssignment);
