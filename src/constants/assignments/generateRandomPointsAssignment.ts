import { useFillInTheBlankStore } from "@/store/fillInTheBlankStore";
import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { AssignmentType, RandomGeneratedAssignment } from "@/types/Assignment";
import { getRandomCoords, shuffleArray } from "@/utils";
import { SubjectCategories } from "../defaultDailyMissions";

const COORDINATE_LIMITS = [-5, 5] as const;

function createPointAssignment({
  title,
  instructions,
  type,
  subjectCategory,
  setup,
  validate,
}: {
  title: string;
  instructions: string;
  type: AssignmentType;
  subjectCategory: SubjectCategories;
  setup: () => void;
  validate: () => boolean;
}): RandomGeneratedAssignment {
  return {
    assisted: false,
    id: `assignment-${Math.random().toString(36).substring(7)}`,
    order: Math.floor(Math.random() * 100),
    dimensions: "2D",
    title,
    instructions,
    type,
    subjectCategory,
    setup,
    validate,
  };
}

export const generateRandomMoveToPositionPointAssignment = () => {
  const initialPoint = getRandomCoords(COORDINATE_LIMITS);
  let targetPosition = getRandomCoords(COORDINATE_LIMITS);

  while (
    initialPoint[0] === targetPosition[0] &&
    initialPoint[1] === targetPosition[1]
  ) {
    targetPosition = getRandomCoords(COORDINATE_LIMITS);
  }

  return createPointAssignment({
    title: "Mover para posição",
    type: AssignmentType.INTERACTIVE,
    instructions: `Mova o ponto para a posição (${targetPosition[0]}, ${targetPosition[1]}).`,
    subjectCategory: "points",
    setup: () => {
      useScene2DStore.getState().setPoints([
        {
          id: "a",
          position: initialPoint,
          movable: true,
          color: "blue",
          label: "a",
          constraints: {
            roundCoordinates: true,
          },
        },
      ]);
    },
    validate: () => {
      const point = useScene2DStore.getState().getPoint("a");
      return (
        point?.position[0] === targetPosition[0] &&
        point?.position[1] === targetPosition[1]
      );
    },
  });
};

export const generateRandomWhichPositionPointAssignment = () => {
  const point = getRandomCoords(COORDINATE_LIMITS);

  return createPointAssignment({
    title: "Qual a posição?",
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    instructions: `Qual a posição do ponto?`,
    subjectCategory: "points",
    setup: () => {
      useScene2DStore.getState().setPoints([
        {
          id: "a",
          position: point,
          movable: false,
          color: "blue",
          label: "a",
          constraints: {
            roundCoordinates: true,
          },
        },
      ]);
      useFillInTheBlankStore.getState().setInputs([
        {
          dimention: "2D",
          label: "a",
          pointRef: "a",
          coordinatesValue: { x: "", y: "" },
        },
      ]);
    },
    validate: () => {
      const point = useScene2DStore.getState().getPoint("a");
      const input = useFillInTheBlankStore.getState().getInputByPointRef("a");
      if (!point || !input) return false;

      const inputX = Number(input.coordinatesValue.x);
      const inputY = Number(input.coordinatesValue.y);

      return point?.position[0] === inputX && point?.position[1] === inputY;
    },
  });
};

export const generateRandomFillInTheBlankWithOptionsPointAssignment = () => {
  const point = getRandomCoords(COORDINATE_LIMITS);
  const sentence = `O ponto tem coordenadas {coordinates}.`;

  const randomOptions: TOption[] = [];
  for (let i = 0; i < 3; i++) {
    const randomPos = getRandomCoords(COORDINATE_LIMITS);
    randomOptions.push({
      id: `option-${i}`,
      value: `(${randomPos[0]},${randomPos[1]})`,
      correct: false,
    });
  }
  randomOptions.push({
    id: "option-3",
    value: `(${point[0]},${point[1]})`,
    correct: true,
  });

  const shuffledOptions = shuffleArray(randomOptions);

  return createPointAssignment({
    title: "Preencher os espaços em branco",
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    instructions: ``,
    subjectCategory: "points",
    setup: () => {
      useScene2DStore.getState().setPoints([
        {
          id: "a",
          position: point,
          movable: false,
          color: "blue",
          label: "A",
          constraints: {
            roundCoordinates: true,
          },
        },
      ]);
      useFillInTheBlankWithOptionsStore.getState().setSentence(sentence);
      useFillInTheBlankWithOptionsStore.getState().setOptions(shuffledOptions);
    },
    validate: () => {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      return Object.values(selectedOptions).every(option => option.correct);
    },
  });
};
