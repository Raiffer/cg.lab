import { useFillInVecLengthFormulaStore } from "@/store/fillInVecLengthFormulaStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { vec } from "mafs";
import { VectorTailAndTip } from "./vectorSumAdjustResult";

interface VectorLengthFormulaAssignmentProps {
  order: number;
  vectorRefId: string;
  vectorA: VectorTailAndTip;
  values: { x: number | string; y: number | string; z: number | string };
  dimentions: "2D" | "3D";
}

function createVectorLengthFormulaAssignment({
  order,
  vectorRefId,
  vectorA,
  values,
  dimentions,
}: VectorLengthFormulaAssignmentProps): Assignment {
  return {
    assisted: false,
    id: `vector-length-${order}`,
    title: "Comprimento do Vetor",
    instructions:
      "Ajuste os valores da fórmula para calcular o comprimento do vetor.",
    type: AssignmentType.FILL_IN_THE_BLANK_FORMULA,
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
        tailMovable: false,
        tipMovable: false,
      });

      useFillInVecLengthFormulaStore
        .getState()
        .setVecLengthFormulas([{ vectorRefId, values, dimentions }]);
    },
    validate() {
      const { getVector } = useScene2DStore.getState();
      const vector = getVector(vectorRefId);
      const vecLenFormula = useFillInVecLengthFormulaStore
        .getState()
        .getVecLengthFormula(vectorRefId);
      if (!vecLenFormula || !vector) return false;
      const x = Number(vecLenFormula.values.x);
      const y = Number(vecLenFormula.values.y);
      const calculatedInputLen = Math.sqrt(x ** 2 + y ** 2);
      const vectorLen = vec.dist(vector.tail, vector.tip);
      const isCorrect = calculatedInputLen === vectorLen;
      if (isCorrect) {
        const newLabel = `||${vector.label}|| = ${vectorLen.toPrecision(2)}`;
        useScene2DStore.getState().setVectorLabel(vectorRefId, newLabel);
      }
      return calculatedInputLen === vectorLen;
    },
  };
}

const vectorLengthAssignmentsProps: VectorLengthFormulaAssignmentProps[] = [
  {
    order: 1,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [2, 0] },
    values: { x: "", y: 0, z: 0 },
    dimentions: "2D",
  },
  {
    order: 2,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [0, 2] },
    values: { x: 0, y: "", z: 0 },
    dimentions: "2D",
  },
  {
    order: 3,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [3, 4] },
    values: { x: "", y: 4, z: 0 },
    dimentions: "2D",
  },
  {
    order: 4,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [3, 4] },
    values: { x: 3, y: "", z: 0 },
    dimentions: "2D",
  },
  {
    order: 5,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [3, 4] },
    values: { x: "", y: "", z: "" },
    dimentions: "2D",
  },
  {
    order: 6,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [-3, 4] },
    values: { x: "", y: "", z: "" },
    dimentions: "2D",
  },
  {
    order: 7,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [3, -4] },
    values: { x: "", y: "", z: "" },
    dimentions: "2D",
  },
  {
    order: 8,
    vectorRefId: "a",
    vectorA: { tail: [0, 0], tip: [-3, -4] },
    values: { x: "", y: "", z: "" },
    dimentions: "2D",
  },
];

export const vectorLengthAssignmentList = vectorLengthAssignmentsProps.map(
  createVectorLengthFormulaAssignment
);
