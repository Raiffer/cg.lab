import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { vec } from "mafs";
import { VectorTailAndTip } from "./vectorSumAdjustResult";

interface VectorScaleInteractiveAssignmentProps {
  order: number;
  title?: string;
  instructions?: string;
  initialVector: VectorTailAndTip;
  scalar: number;
}

function createVectorScalarInteractiveAssignment({
  order,
  title,
  instructions,
  initialVector,
  scalar,
}: VectorScaleInteractiveAssignmentProps): Assignment {
  return {
    assisted: false,
    id: `vector-scalar-${order}`,
    title: title || "Multiplicação de vetor por escalar",
    instructions:
      instructions ||
      `Aplique um escalar de ${scalar} ao vetor v = (${initialVector.tip[0]}, ${initialVector.tip[1]}).`,
    order,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "vector-scalar",
    setup() {
      const { addVector } = useScene2DStore.getState();
      addVector({
        id: "v1",
        tail: initialVector.tail,
        tip: initialVector.tip,
        color: "blue",
        label: "v",
        tailMovable: true,
        tipMovable: true,
      });
    },
    validate() {
      const { getVector } = useScene2DStore.getState();
      const sceneVec = getVector("v1");
      if (!sceneVec) return false;

      const vector = vec.sub(sceneVec.tip, sceneVec.tail);
      const vectorScaled = vec.scale(initialVector.tip, scalar);

      const isCorrect =
        vector[0] === vectorScaled[0] && vector[1] === vectorScaled[1];
      return isCorrect;
    },
  };
}

const vectorScalarInteractiveAssignmentsProps: VectorScaleInteractiveAssignmentProps[] =
  [
    {
      order: 1,
      title: "Dobrando o vetor horizontal",
      instructions: "Dobre o vetor v = (1, 0).",
      initialVector: { tail: [0, 0], tip: [1, 0] },
      scalar: 2,
    },
    {
      order: 2,
      title: "Dobrando o vetor vertical",
      instructions: "Dobre o vetor v = (0, 1).",
      initialVector: { tail: [0, 0], tip: [0, 1] },
      scalar: 2,
    },
    {
      order: 3,
      title: "Aplicando um escalar",
      initialVector: { tail: [0, 0], tip: [1, 1] },
      scalar: 2,
    },
    {
      order: 4,
      title: "Aplicando um escalar negativo",
      initialVector: { tail: [0, 0], tip: [0, 1] },
      scalar: -2,
    },
    {
      order: 5,
      title: "Aplicando um escalar negativo",
      initialVector: { tail: [0, 0], tip: [1, 0] },
      scalar: -3,
    },
    {
      order: 6,
      title: "Escalar decimal em um vetor horizontal",
      initialVector: { tail: [0, 0], tip: [1, 0] },
      scalar: 0.5,
    },
    {
      order: 7,
      title: "Escalar decimal em um vetor vertical",
      initialVector: { tail: [0, 0], tip: [0, 2] },
      scalar: 0.5,
    },
    {
      order: 8,
      title: "Escalar decimal em um vetor com os dois componentes",
      initialVector: { tail: [0, 0], tip: [2, 2] },
      scalar: 0.5,
    },
    {
      order: 9,
      title: "Escalar decimal negativo no eixo X",
      initialVector: { tail: [0, 0], tip: [1, 0] },
      scalar: -0.5,
    },
    {
      order: 10,
      title: "Escalar decimal negativo no eixo Y",
      initialVector: { tail: [0, 0], tip: [0, 1] },
      scalar: -0.5,
    },
    {
      order: 11,
      title: "Escalar decimal negativo com os dois componentes",
      initialVector: { tail: [0, 0], tip: [3, 2] },
      scalar: -0.5,
    },
  ];

export const vectorScalarInteractiveAssignmentList =
  vectorScalarInteractiveAssignmentsProps.map(
    createVectorScalarInteractiveAssignment
  );
