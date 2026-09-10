import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { shuffleArray } from "@/utils";

interface PointPositionWithOptionAssignmentProps {
  order: number;
  title: string;
  pointPosition: [number, number];
  options: TOption[];
  instructions?: string;
}

function createPointPositionWithOptionsAssignment({
  order,
  title,
  pointPosition,
  options,
  instructions = "Complete o espaço em branco.",
}: PointPositionWithOptionAssignmentProps): Assignment {
  const optionsShuffled = shuffleArray(options);

  return {
    assisted: false,
    id: `point-position-${order}`,
    order,
    title,
    instructions,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "points",
    setup() {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A",
          position: pointPosition,
          label: "A",
          movable: false,
          color: "red",
        },
      ]);

      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();

      setSentence("A posição do ponto A é {coordinatesA}");

      setOptions(optionsShuffled);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const coordinatesAAnswer = selectedOptions["coordinatesA"];
      if (!coordinatesAAnswer) return false;

      const isCorrect = coordinatesAAnswer.correct;

      return isCorrect;
    },
  };
}

const pointPositionWithOptionsAssignments: PointPositionWithOptionAssignmentProps[] =
  [
    {
      order: 1,
      title: "Ponto na Origem",
      instructions:
        "Identifique a posição do ponto A e complete o espaço em branco.",
      pointPosition: [0, 0] as [number, number],
      options: [
        { id: "option-1", value: "(0, 0)", correct: true },
        { id: "option-2", value: "(0, 1)", correct: false },
        { id: "option-3", value: "(1, 0)", correct: false },
        { id: "option-4", value: "(2, 1)", correct: false },
      ],
    },
    {
      order: 2,
      title: "Ponto no Eixo X",
      instructions:
        "Identifique a posição do ponto no eixo X e complete o espaço em branco.",
      pointPosition: [2, 0] as [number, number],
      options: [
        { id: "option-1", value: "(2, 0)", correct: true },
        { id: "option-2", value: "(0, 2)", correct: false },
        { id: "option-3", value: "(2, 1)", correct: false },
        { id: "option-4", value: "(1, 0)", correct: false },
      ],
    },
    {
      order: 3,
      title: "Ponto no Eixo Y",
      instructions:
        "Identifique a posição do ponto no eixo Y e complete o espaço em branco.",
      pointPosition: [0, -2] as [number, number],
      options: [
        { id: "option-1", value: "(0, -2)", correct: true },
        { id: "option-2", value: "(2, 0)", correct: false },
        { id: "option-3", value: "(0, 2)", correct: false },
        { id: "option-4", value: "(1, -2)", correct: false },
      ],
    },
    {
      order: 4,
      title: "Ponto no Primeiro Quadrante",
      instructions:
        "Observe o ponto no primeiro quadrante e complete o espaço em branco.",
      pointPosition: [1, 1] as [number, number],
      options: [
        { id: "option-1", value: "(1, 1)", correct: true },
        { id: "option-2", value: "(2, 1)", correct: false },
        { id: "option-3", value: "(1, 3)", correct: false },
        { id: "option-4", value: "(3, 2)", correct: false },
      ],
    },
    {
      order: 5,
      title: "Posição no Segundo Quadrante",
      instructions:
        "Identifique a posição do ponto no segundo quadrante e complete o espaço em branco.",
      pointPosition: [-1, 2] as [number, number],
      options: [
        { id: "option-1", value: "(-1, 2)", correct: true },
        { id: "option-2", value: "(-2, 2)", correct: false },
        { id: "option-3", value: "(-1, -2)", correct: false },
        { id: "option-4", value: "(-3, 1)", correct: false },
      ],
    },
    {
      order: 6,
      title: "Posição no Terceiro Quadrante",
      instructions:
        "Identifique a posição do ponto no terceiro quadrante e complete o espaço em branco.",
      pointPosition: [-2, -3] as [number, number],
      options: [
        { id: "option-1", value: "(-2, -3)", correct: true },
        { id: "option-2", value: "(2, -3)", correct: false },
        { id: "option-3", value: "(2, 3)", correct: false },
        { id: "option-4", value: "(0, -3)", correct: false },
      ],
    },
    {
      order: 7,
      title: "Posição no Quarto Quadrante",
      instructions:
        "Identifique a posição do ponto no quarto quadrante e complete o espaço em branco.",
      pointPosition: [3, -1] as [number, number],
      options: [
        { id: "option-1", value: "(3, -1)", correct: true },
        { id: "option-2", value: "(3, 1)", correct: false },
        { id: "option-3", value: "(1, -3)", correct: false },
        { id: "option-4", value: "(0, -1)", correct: false },
      ],
    },
    {
      order: 8,
      title: "Coordenadas Decimais",
      instructions:
        "Identifique a posição do ponto com coordenadas decimais e complete o espaço em branco.",
      pointPosition: [0.5, 1] as [number, number],
      options: [
        { id: "option-1", value: "(0.5, 1)", correct: true },
        { id: "option-2", value: "(1.5, 2.5)", correct: false },
        { id: "option-3", value: "(2.5, -1.5)", correct: false },
        { id: "option-4", value: "(0, -2.5)", correct: false },
      ],
    },
    {
      order: 9,
      title: "Coordenadas Negativas",
      instructions:
        "Identifique a posição do ponto com coordenadas negativas e complete o espaço em branco.",
      pointPosition: [-1.5, -2] as [number, number],
      options: [
        { id: "option-1", value: "(-1.5, -2)", correct: true },
        { id: "option-2", value: "(1.5, 2)", correct: false },
        { id: "option-3", value: "(0, -2.5)", correct: false },
        { id: "option-4", value: "(2.5, -1)", correct: false },
      ],
    },
  ];

export const pointPositionWithOptionsAssignmentsList =
  pointPositionWithOptionsAssignments.map(assi =>
    createPointPositionWithOptionsAssignment(assi)
  );
