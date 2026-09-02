import { useFillInVecLengthFormulaStore } from "@/store/fillInVecLengthFormulaStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { vec } from "mafs";
import { VectorTailAndTip } from "./vectorSumAdjustResult";

interface VectorLengthInteractiveAssignmentProps {
  order: number;
  vectorRefId: string;
  vectorA: VectorTailAndTip;
  values: { x: number | string; y: number | string; z: number | string };
  dimentions: "2D" | "3D";
}

function createVectorLengthInteractiveAssignment({
  order,
  vectorRefId,
  vectorA,
  values,
  dimentions,
}: VectorLengthInteractiveAssignmentProps): Assignment {
  return {
    assisted: false,
    id: `vector-length-interactive-${order}`,
    title: "Ajuste o vetor",
    instructions:
      "Ajuste o vetor para que o comprimento do vetor seja igual ao valor da fórmula.",
    type: AssignmentType.INTERACTIVE,
    order,
    subjectCategory: "vector-length",
    setup() {
      const { addVector } = useScene2DStore.getState();
      addVector({
        id: vectorRefId,
        tail: vectorA.tail,
        tip: vectorA.tip,
        color: "blue",
        label: vectorRefId,
        tailMovable: true,
        tipMovable: true,
      });

      useFillInVecLengthFormulaStore
        .getState()
        .setVecLengthFormulas([
          { vectorRefId, values, dimentions, fixedValues: true },
        ]);
    },
    validate() {
      const { getVector } = useScene2DStore.getState();
      const vector = getVector(vectorRefId);
      if (!vector) return false;

      const currentVectorLength = vec.dist(vector.tail, vector.tip);
      const targetLength = Math.sqrt(
        Number(values.x) ** 2 + Number(values.y) ** 2
      );
      return currentVectorLength === targetLength;
    },
  };
}

const vectorLengthAssignmentsProps: VectorLengthInteractiveAssignmentProps[] = [
  {
    order: 1,
    vectorRefId: "a",
    vectorA: { tail: [1, 1], tip: [2, 0] },
    values: { x: 2, y: 0, z: 0 },
    dimentions: "2D",
  },
  {
    order: 2,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [0, 2] },
    values: { x: 0, y: 5, z: 0 },
    dimentions: "2D",
  },
  {
    order: 3,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [2, 2] },
    values: { x: 0, y: 2.5, z: 0 },
    dimentions: "2D",
  },
  {
    order: 4,
    vectorRefId: "a",
    vectorA: { tail: [-1, 3], tip: [1, 4] },
    values: { x: 2, y: 2, z: 0 },
    dimentions: "2D",
  },
  {
    order: 5,
    vectorRefId: "a",
    vectorA: { tail: [-2, -1], tip: [2, -4] },
    values: { x: 3, y: 4, z: 0 },
    dimentions: "2D",
  },
];

export const vectorLengthInteractiveAssignmentList =
  vectorLengthAssignmentsProps.map(createVectorLengthInteractiveAssignment);
