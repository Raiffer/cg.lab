import { useFillInTheBlankStore } from "@/store/fillInTheBlankStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { AssignmentType, RandomGeneratedAssignment } from "@/types/Assignment";
import {
  generateAssignmentId,
  getRandomFloatConstrained,
  getRandomVector,
  getRandomVectorWithTailAndTip,
} from "@/utils";
import { vec } from "mafs";
import { SubjectCategories } from "../defaultDailyMissions";
import { useFillInVecLengthFormulaStore } from "@/store/fillInVecLengthFormulaStore";

const COORDINATE_LIMITS = [-4, 4] as const;

function setupScene(
  vectors: Array<{
    id: string;
    tail: [number, number];
    tip: [number, number];
    tailMovable: boolean;
    tipMovable: boolean;
    color: string;
    label: string;
  }>
) {
  const { reset, setVectors } = useScene2DStore.getState();
  reset();
  setVectors(vectors);
}

function validateVector(
  inputVector: { x: string; y: string },
  expectedVector: [number, number]
): boolean {
  return (
    Number(inputVector.x) === expectedVector[0] &&
    Number(inputVector.y) === expectedVector[1]
  );
}

function vectorsAreEqual(
  vectorA: [number, number],
  vectorB: [number, number]
): boolean {
  return vectorA[0] === vectorB[0] && vectorA[1] === vectorB[1];
}

// Common Assignment Factory
function createVectorAssignment({
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
    id: generateAssignmentId("vector-assignment"),
    dimensions: "2D",
    order: Math.floor(Math.random() * 100),
    title,
    instructions,
    type,
    subjectCategory,
    setup,
    validate,
  };
}

// Assignment Generators
export function generateVectorTransformationAssignment(): RandomGeneratedAssignment {
  const targetVector = getRandomVector(COORDINATE_LIMITS);
  const initialVector = getRandomVectorWithTailAndTip(COORDINATE_LIMITS);

  return createVectorAssignment({
    title: "Transforme o vetor",
    type: AssignmentType.INTERACTIVE,
    instructions: `Transforme o vetor a em (${targetVector[0]}, ${targetVector[1]}).`,
    subjectCategory: "vector-definition",
    setup: () => {
      setupScene([
        {
          id: "a",
          tail: initialVector.tail,
          tip: initialVector.tip,
          tailMovable: true,
          tipMovable: true,
          color: "blue",
          label: "a",
        },
      ]);
    },
    validate: () => {
      const { getVector } = useScene2DStore.getState();
      const a = getVector("a");
      if (!a) return false;

      const vecA = vec.sub(a.tip, a.tail);
      return vecA[0] === targetVector[0] && vecA[1] === targetVector[1];
    },
  });
}

export function generateVectorSumAssignment(): RandomGeneratedAssignment {
  const a = getRandomVectorWithTailAndTip(COORDINATE_LIMITS);
  const b = getRandomVectorWithTailAndTip(COORDINATE_LIMITS);
  const targetVector = getRandomVector(COORDINATE_LIMITS);

  return createVectorAssignment({
    title: "Some os vetores",
    instructions: `Mude os vetores a e b para que a soma deles seja (${targetVector[0]}, ${targetVector[1]}).`,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "vector-sum",
    setup: () => {
      setupScene([
        {
          id: "a",
          tail: a.tail,
          tip: a.tip,
          tailMovable: true,
          tipMovable: true,
          color: "blue",
          label: "a",
        },
        {
          id: "b",
          tail: b.tail,
          tip: b.tip,
          tailMovable: true,
          tipMovable: true,
          color: "red",
          label: "b",
        },
      ]);
    },
    validate: () => {
      const { getVector } = useScene2DStore.getState();
      const aVec = getVector("a");
      const bVec = getVector("b");
      if (!aVec || !bVec) return false;

      const vecSum = vec.add(
        vec.sub(aVec.tip, aVec.tail),
        vec.sub(bVec.tip, bVec.tail)
      );
      const isCorrect =
        vecSum[0] === targetVector[0] && vecSum[1] === targetVector[1];
      if (isCorrect) {
        useScene2DStore.getState().addVector({
          id: "c",
          label: "c",
          tail: [0, 0],
          tip: vecSum,
          tailMovable: false,
          tipMovable: false,
          color: "green",
        });
      }
      return isCorrect;
    },
  });
}

export function generateVectorFillInAssignment(): RandomGeneratedAssignment {
  const vector = getRandomVectorWithTailAndTip(COORDINATE_LIMITS);

  return createVectorAssignment({
    title: "Preencha o vetor",
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    instructions: "Preencha o vetor com os valores corretos.",
    subjectCategory: "vector-definition",
    setup: () => {
      setupScene([
        {
          id: "a",
          tail: vector.tail,
          tip: vector.tip,
          tailMovable: false,
          tipMovable: false,
          color: "blue",
          label: "a",
        },
      ]);

      const { setInputs } = useFillInTheBlankStore.getState();
      setInputs([
        {
          label: "a",
          dimention: "2D",
          pointRef: "a",
          coordinatesValue: { x: "", y: "" },
        },
      ]);
    },
    validate: () => {
      const { getInputByPointRef } = useFillInTheBlankStore.getState();
      const input = getInputByPointRef("a");
      if (!input) return false;

      const { getVector } = useScene2DStore.getState();
      const a = getVector("a");
      if (!a) return false;
      const userAnswer = {
        x: input.coordinatesValue.x as string,
        y: input.coordinatesValue.y as string,
      };

      return validateVector(userAnswer, vec.sub(a.tip, a.tail));
    },
  });
}

export function generateVectorSumFillInAssignment(): RandomGeneratedAssignment {
  const a = getRandomVectorWithTailAndTip(COORDINATE_LIMITS);
  const b = getRandomVectorWithTailAndTip(COORDINATE_LIMITS);

  return createVectorAssignment({
    title: "Preencha a soma dos vetores",
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    instructions: "Qual é a soma dos vetores a e b?.",
    subjectCategory: "vector-sum",
    setup: () => {
      setupScene([
        {
          id: "a",
          tail: a.tail,
          tip: a.tip,
          tailMovable: false,
          tipMovable: false,
          color: "blue",
          label: "a",
        },
        {
          id: "b",
          tail: b.tail,
          tip: b.tip,
          tailMovable: false,
          tipMovable: false,
          color: "red",
          label: "b",
        },
      ]);

      const { setInputs } = useFillInTheBlankStore.getState();
      setInputs([
        {
          label: "c",
          dimention: "2D",
          pointRef: "c",
          coordinatesValue: { x: "", y: "" },
        },
      ]);
    },
    validate: () => {
      const { getInputByPointRef } = useFillInTheBlankStore.getState();
      const input = getInputByPointRef("c");
      if (!input) return false;

      const { getVector } = useScene2DStore.getState();
      const aVec = getVector("a");
      const bVec = getVector("b");
      if (!aVec || !bVec) return false;
      const userAnswer = {
        x: input.coordinatesValue.x as string,
        y: input.coordinatesValue.y as string,
      };

      const vecSum = vec.add(
        vec.sub(aVec.tip, aVec.tail),
        vec.sub(bVec.tip, bVec.tail)
      );
      const isCorrect = validateVector(userAnswer, vecSum);
      if (isCorrect) {
        useScene2DStore.getState().addVector({
          id: "c",
          label: "c",
          tail: [0, 0],
          tip: vecSum,
          tailMovable: false,
          tipMovable: false,
          color: "green",
        });
      }

      return isCorrect;
    },
  });
}

export function generateVectorLengthFillInFormulaAssignment(): RandomGeneratedAssignment {
  // Generate random vector
  const vector = getRandomVectorWithTailAndTip(COORDINATE_LIMITS);
  const vectorId = "a";
  const vectorLabel = "a";
  const vectorColor = "blue";

  // Calculate vector components
  const dx = vector.tip[0] - vector.tail[0];
  const dy = vector.tip[1] - vector.tail[1];
  const vectorLength = vec.dist(vector.tail, vector.tip);

  const shouldFillSomeComponents = Math.random() < 0.5;
  const axisToFill = Math.random() < 0.5 ? "x" : "y";

  return createVectorAssignment({
    title: "Preencha o vetor",
    type: AssignmentType.FILL_IN_THE_BLANK_FORMULA,
    instructions: "Complete a fórmula para calcular o módulo do vetor.",
    subjectCategory: "vector-length",
    setup: () => {
      setupScene([
        {
          id: vectorId,
          tail: vector.tail,
          tip: vector.tip,
          tailMovable: false,
          tipMovable: false,
          color: vectorColor,
          label: vectorLabel,
        },
      ]);

      // Randomly pre-fill some components
      const { setVecLengthFormulas } =
        useFillInVecLengthFormulaStore.getState();

      setVecLengthFormulas([
        {
          vectorRefId: vectorId,
          values: {
            x: shouldFillSomeComponents && axisToFill === "x" ? dx : "",
            y: shouldFillSomeComponents && axisToFill === "y" ? dy : "",
            z: "", // Always empty in 2D
          },
          dimentions: "2D",
        },
      ]);
    },
    validate: () => {
      const { getVector } = useScene2DStore.getState();
      const { getVecLengthFormula } = useFillInVecLengthFormulaStore.getState();
      const vector = getVector("a");
      const vecLenFormula = getVecLengthFormula("a");
      if (!vecLenFormula || !vector) return false;

      const x = Number(vecLenFormula.values.x);
      const y = Number(vecLenFormula.values.y);
      const calculatedInputLen = Math.sqrt(x ** 2 + y ** 2);
      const isCorrect = calculatedInputLen === vectorLength;
      if (isCorrect) {
        const newLabel = `||${vector.label}|| = ${vectorLength.toPrecision(2)}`;
        useScene2DStore.getState().setVectorLabel("a", newLabel);

        useScene2DStore.getState().addPolygon({
          id: "vector-triangle",
          points: [
            {
              id: "tail-point",
              position: vector.tail,
              movable: false,
            },
            {
              id: "x-component",
              position: [vector.tip[0], vector.tail[1]],
              movable: false,
            },
            {
              id: "tip-point",
              position: vector.tip,
              movable: false,
            },
          ],
          color: "rgba(0, 255, 100, 0.5)", // Semi-transparent green
        });
      }
      return calculatedInputLen === vectorLength;
    },
  });
}

export function generateVectorLengthInteractiveAssignment(): RandomGeneratedAssignment {
  const vector = getRandomVectorWithTailAndTip(COORDINATE_LIMITS);

  // Generate random formula values
  const formulaValues = {
    x: Math.floor(Math.random() * 5) + 1,
    y: Math.floor(Math.random() * 5) + 1,
    z: 0,
  };

  const targetVectorLength = Math.sqrt(
    formulaValues.x ** 2 + formulaValues.y ** 2 + formulaValues.z ** 2
  );

  return createVectorAssignment({
    title: "Ajuste o vetor",
    type: AssignmentType.INTERACTIVE,
    instructions:
      "Ajuste o vetor a para que seu comprimento seja igual ao da fórmula.",
    subjectCategory: "vector-length",
    setup: () => {
      setupScene([
        {
          id: "a",
          tail: vector.tail,
          tip: vector.tip,
          tailMovable: true,
          tipMovable: true,
          color: "blue",
          label: "a",
        },
      ]);

      const { setVecLengthFormulas } =
        useFillInVecLengthFormulaStore.getState();
      setVecLengthFormulas([
        {
          vectorRefId: "a",
          values: formulaValues,
          dimentions: "2D",
          fixedValues: true,
        },
      ]);
    },
    validate: () => {
      const { getVector } = useScene2DStore.getState();
      const aVector = getVector("a");
      if (!aVector) return false;
      const currentVectorLength = vec.dist(aVector.tail, aVector.tip);
      return currentVectorLength === targetVectorLength;
    },
  });
}

export function generateVectorScalarInteractiveAssignment(): RandomGeneratedAssignment {
  const randomVector = getRandomVectorWithTailAndTip([-3, 3]);
  const randomScalar = getRandomFloatConstrained(-3, 3);

  const vector = vec.sub(randomVector.tip, randomVector.tail);

  return createVectorAssignment({
    title: "Aplique o escalar ao vetor",
    type: AssignmentType.INTERACTIVE,
    instructions: `Aplique o escalar ${randomScalar} ao vetor v = (${vector[0]}, ${vector[1]}).`,
    subjectCategory: "vector-scalar",
    setup: () => {
      setupScene([
        {
          id: "v",
          tail: randomVector.tail,
          tip: randomVector.tip,
          tailMovable: true,
          tipMovable: true,
          color: "blue",
          label: "v",
        },
      ]);
    },
    validate: () => {
      const { getVector } = useScene2DStore.getState();
      const sceneVector = getVector("v");
      if (!sceneVector) return false;

      const scaledVector = vec.scale(vector, randomScalar);
      const userAnswer = vec.sub(sceneVector.tip, sceneVector.tail);

      console.log("userAnswer", userAnswer);
      console.log("scaledVector", scaledVector);

      const isCorrect =
        scaledVector[0] === userAnswer[0] && scaledVector[1] === userAnswer[1];

      return isCorrect;
    },
  });
}

export function generateVectorScalarCoordinatesInputAssignment(): RandomGeneratedAssignment {
  const randomVector = getRandomVectorWithTailAndTip([-3, 3]);
  const randomScalar = getRandomFloatConstrained(-3, 3);
  const vector = vec.sub(randomVector.tip, randomVector.tail);

  return createVectorAssignment({
    title: "Preencha o vetor",
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    instructions: `Descreva o vetor resultante da aplicação do escalar ${randomScalar} ao vetor v.`,
    subjectCategory: "vector-scalar",
    setup: () => {
      setupScene([
        {
          id: "v",
          tail: randomVector.tail,
          tip: randomVector.tip,
          tailMovable: false,
          tipMovable: false,
          color: "blue",
          label: "v",
        },
      ]);

      useFillInTheBlankStore.getState().setInputs([
        {
          label: "v'",
          dimention: "2D",
          pointRef: "v",
          coordinatesValue: { x: "", y: "" },
        },
      ]);
    },
    validate: () => {
      const { getInputByPointRef } = useFillInTheBlankStore.getState();
      const input = getInputByPointRef("v");
      if (!input) return false;

      const answerVector = [
        input.coordinatesValue.x,
        input.coordinatesValue.y,
      ].map(Number) as [number, number];
      const scaledVector = vec.scale(vector, randomScalar);

      const isCorrect = vectorsAreEqual(scaledVector, answerVector);

      if (isCorrect) {
        const { addVector } = useScene2DStore.getState();
        addVector({
          id: "scaled",
          tail: [0, 0],
          tip: scaledVector,
          tailMovable: false,
          tipMovable: false,
          color: "green",
          label: `v' = (${scaledVector[0]}, ${scaledVector[1]})`,
        });
      }

      return isCorrect;
    },
  });
}

export function generateRandomVectorAssignment(): RandomGeneratedAssignment {
  const assignmentGenerators = [
    generateVectorTransformationAssignment,
    generateVectorSumAssignment,
    generateVectorFillInAssignment,
    generateVectorSumFillInAssignment,
    generateVectorLengthFillInFormulaAssignment,
    generateVectorLengthInteractiveAssignment,
    generateVectorScalarInteractiveAssignment,
    generateVectorScalarCoordinatesInputAssignment,
  ];

  const randomIndex = Math.floor(Math.random() * assignmentGenerators.length);
  return assignmentGenerators[randomIndex]();
}
