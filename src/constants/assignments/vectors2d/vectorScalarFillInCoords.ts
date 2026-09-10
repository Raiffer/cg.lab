import { Assignment, AssignmentType } from "@/types/Assignment";
import { VectorTailAndTip } from "./vectorSumAdjustResult";
import { useScene2DStore } from "@/store/scene2DStore";
import { useFillInTheBlankStore } from "@/store/fillInTheBlankStore";
import { vec } from "mafs";

interface VectorScalarFillInCoordsAssignmentProps {
  order: number;
  title?: string;
  instructions?: string;
  initialVector: VectorTailAndTip;
  scalar: number;
}

function createVectorScalarFillInCoordsAssignment({
  order,
  title,
  instructions,
  initialVector,
  scalar,
}: VectorScalarFillInCoordsAssignmentProps): Assignment {
  return {
    assisted: false,
    id: `vector-scalar-fill-in-coords-${order}`,
    title: title || "Multiplicação de vetor por escalar",
    instructions:
      instructions ||
      `Defina o vetor resultante após aplicar o escalar de ${scalar} ao vetor v.`,
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    subjectCategory: "vector-scalar",
    setup() {
      const { addVector } = useScene2DStore.getState();
      addVector({
        id: "v",
        tail: initialVector.tail,
        tip: initialVector.tip,
        color: "blue",
        label: "v",
        tailMovable: false,
        tipMovable: false,
      });

      useFillInTheBlankStore.getState().setInputs([
        {
          pointRef: "v",
          label: "v",
          coordinatesValue: { x: "", y: "", z: "" },
          dimention: "2D",
        },
      ]);
    },
    validate() {
      const { getVector } = useScene2DStore.getState();
      const sceneVec = getVector("v");
      const coordsInput = useFillInTheBlankStore
        .getState()
        .getInputByPointRef("v");
      if (!sceneVec || !coordsInput) return false;

      const vectorScaled = vec.scale(initialVector.tip, scalar);

      const inputX = Number(coordsInput.coordinatesValue.x);
      const inputY = Number(coordsInput.coordinatesValue.y);
      const isCorrect =
        vectorScaled[0] === inputX && vectorScaled[1] === inputY;

      if (isCorrect) {
        useScene2DStore.getState().setVectorTail("v", initialVector.tail);
        useScene2DStore.getState().setVectorTip("v", vectorScaled);
      }

      return isCorrect;
    },
  };
}

const vectorScalarFillInCoordsAssignmentsProps: VectorScalarFillInCoordsAssignmentProps[] =
  [
    // Level 1: Simple positive scaling (with target vector)
    {
      order: 1,
      title: "Dobrando o vetor",
      instructions: "Defina o vetor resultante após aplicar o escalar 2",
      initialVector: { tail: [0, 0], tip: [1, 0] },
      scalar: 2,
    },
    {
      order: 2,
      title: "Triplicando o vetor",
      instructions: "Defina o vetor resultante após aplicar o escalar 3",
      initialVector: { tail: [0, 0], tip: [0, 2] },
      scalar: 3,
    },

    // Level 2: Fractional scaling (no target)
    {
      order: 3,
      title: "Redução Vetorial",
      instructions: "Determine o vetor escalado por 0.5",
      initialVector: { tail: [0, 0], tip: [4, 0] },
      scalar: 0.5,
    },

    // Level 3: Negative scaling
    {
      order: 4,
      title: "Inversão de Vetor",
      instructions: "Determine o vetor após aplicar escalar negativo -1",
      initialVector: { tail: [0, 0], tip: [1, 0] },
      scalar: -1,
    },
    {
      order: 5,
      title: "Escalonamento Negativo",
      instructions: "Determine o vetor após aplicar escalar negativo de -0.5",
      initialVector: { tail: [0, 0], tip: [2, 2] },
      scalar: -0.5,
    },

    // Level 4: Diagonal vectors
    {
      order: 6,
      title: "Vetor Diagonal Escalonado",
      instructions:
        "Determine o vetor após aplicar escalar de 2 ao vetor v(1, 1)",
      initialVector: { tail: [0, 0], tip: [1, 1] },
      scalar: 2,
    },
  ];

export const vectorScalarFillInCoordsAssignmentList =
  vectorScalarFillInCoordsAssignmentsProps.map(
    createVectorScalarFillInCoordsAssignment
  );
