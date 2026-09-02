import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

interface MovePointAssignmentProps {
  order: number;
  title: string;
  instructions: string;
  initialPointPosition: [number, number];
  goalPointPosition: [number, number];
}

function createMovePointAssignment({
  order,
  title,
  instructions,
  initialPointPosition,
  goalPointPosition,
}: MovePointAssignmentProps): Assignment {
  return {
    assisted: false,
    id: `move-point-${order}`,
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
        point.position[0] === goalPointPosition[0] &&
        point.position[1] === goalPointPosition[1]
      );
    },
  };
}

const movePointAssignments = [
  {
    title: "Movimento Básico",
    instructions: "Mova o ponto A da origem para a posição (2, 3).",
    initialPointPosition: [0, 0],
    goalPointPosition: [2, 3],
  },
  {
    title: "Movimento Horizontal",
    instructions: "Mova o ponto A horizontalmente para (5, 0).",
    initialPointPosition: [0, 0],
    goalPointPosition: [5, 0],
  },
  {
    title: "Movimento Vertical",
    instructions: "Mova o ponto A verticalmente para (0, 4).",
    initialPointPosition: [0, 0],
    goalPointPosition: [0, 4],
  },

  // Level 2: Negative coordinates
  {
    title: "Segundo Quadrante",
    instructions: "Mova o ponto A para o segundo quadrante (-3, 2).",
    initialPointPosition: [0, 0],
    goalPointPosition: [-3, 2],
  },
  {
    title: "Terceiro Quadrante",
    instructions: "Mova o ponto A para o terceiro quadrante (-1, -4).",
    initialPointPosition: [0, 0],
    goalPointPosition: [-1, -4],
  },
  {
    title: "Retorno à Origem",
    instructions: "Mova o ponto A de volta à origem (0, 0).",
    initialPointPosition: [-2, 3],
    goalPointPosition: [0, 0],
  },

  // Level 3: Decimal coordinates
  {
    title: "Coordenadas Decimais",
    instructions: "Mova o ponto A para a posição (1.5, 2.5).",
    initialPointPosition: [0, 0],
    goalPointPosition: [1.5, 2.5],
  },
  {
    title: "Precisão Decimal",
    instructions: "Mova o ponto A para a posição exata (-0.5, 1.5).",
    initialPointPosition: [0, 0],
    goalPointPosition: [-0.5, 1.5],
  },
];

export const movePointAssignmentsList = movePointAssignments.map(
  (assignment, index) =>
    createMovePointAssignment({
      ...assignment,
      order: index + 1, // Order is derived from the array index
      initialPointPosition: assignment.initialPointPosition as [number, number],
      goalPointPosition: assignment.goalPointPosition as [number, number],
    })
);
