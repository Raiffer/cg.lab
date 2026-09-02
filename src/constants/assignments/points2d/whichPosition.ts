import { useFillInTheBlankStore } from "@/store/fillInTheBlankStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

interface WhichPositionCoordsInputAssignment {
  order: number;
  title: string;
  instructions: string;
  pointPosition: [number, number];
}

function createWhichPositionCoordsInputsAssignment({
  order,
  title,
  instructions,
  pointPosition,
}: WhichPositionCoordsInputAssignment): Assignment {
  return {
    assisted: false,
    id: `which-position-${order}`,
    order,
    title,
    instructions,
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    subjectCategory: "points",
    setup: () => {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A",
          position: pointPosition,
          movable: false,
          color: "red",
          label: "A",
          constraints: {
            roundCoordinates: true,
          },
        },
      ]);

      useFillInTheBlankStore.getState().setInputs([
        {
          dimention: "2D",
          pointRef: "A",
          label: "A",
          coordinatesValue: { x: "", y: "" },
        },
      ]);
    },
    validate: () => {
      const { getInputByPointRef } = useFillInTheBlankStore.getState();
      const input = getInputByPointRef("A");
      if (!input) return false;
      const coordinates = input.coordinatesValue;
      const inputX = Number(coordinates.x);
      const inputY = Number(coordinates.y);
      const isCorrect =
        inputX === pointPosition[0] && inputY === pointPosition[1];
      useFillInTheBlankStore.getState().reset();
      return isCorrect;
    },
  };
}

const whichPositionAssignments = [
  // Level 1: Basic positive coordinates
  {
    title: "Identificação Básica",
    instructions:
      "Digite as coordenadas do ponto A mostrado no primeiro quadrante.",
    pointPosition: [2, 3],
  },
  {
    title: "Pontos no Eixo X",
    instructions: "Qual a posição do ponto A localizado no eixo X?",
    pointPosition: [3, 0],
  },
  {
    title: "Pontos no Eixo Y",
    instructions: "Qual a posição do ponto A localizado no eixo Y?",
    pointPosition: [0, 4],
  },

  // Level 2: Negative coordinates and quadrants
  {
    title: "Segundo Quadrante",
    instructions: "Determine as coordenadas do ponto A no segundo quadrante.",
    pointPosition: [-3, 2],
  },
  {
    title: "Terceiro Quadrante",
    instructions:
      "Identifique as coordenadas do ponto A no terceiro quadrante.",
    pointPosition: [-1, -4],
  },

  // Level 3: Decimal coordinates
  {
    title: "Precisão Decimal",
    instructions:
      "Digite as coordenadas exatas do ponto A com uma casa decimal.",
    pointPosition: [0.5, 1],
  },
  {
    title: "Coordenadas Decimais",
    instructions: "Determine as coordenadas do ponto A com precisão decimal.",
    pointPosition: [1.5, 2.5],
  },
  {
    title: "Coordenada Negativa Decimal",
    instructions:
      "Identifique as coordenadas do ponto A com precisão decimal negativa.",
    pointPosition: [-0.5, 2.5],
  },
  {
    title: "Coordenadas Negativas",
    instructions:
      "Digite as coordenadas exatas do ponto A com precisão negativa.",
    pointPosition: [-2.5, -1.5],
  },
];

export const whichPositionAssignmentList = whichPositionAssignments.map(
  (assignment, index) =>
    createWhichPositionCoordsInputsAssignment({
      ...assignment,
      order: index + 1,
      pointPosition: assignment.pointPosition as [number, number],
    })
);
