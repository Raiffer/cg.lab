import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { getRandomVectorWithTailAndTip } from "@/utils";
import { vec } from "mafs";

export type VectorTailAndTip = {
  tail: [number, number];
  tip: [number, number];
};

interface VectorSumAjustResultProps {
  order: number;
  title: string;
  instructions: string;
  vectorA: VectorTailAndTip;
  vectorB: VectorTailAndTip;
}

function createVectorSumAdjustResultAssignment({
  order,
  title,
  instructions,
  vectorA,
  vectorB,
}: VectorSumAjustResultProps): Assignment {
  const randomCVec = getRandomVectorWithTailAndTip([-4, 4]);

  return {
    id: `adjust-vector-to-sum-${order}`,
    title,
    instructions,
    order,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "vector-sum",
    setup: () => {
      const { setVectors } = useScene2DStore.getState();
      setVectors([
        {
          id: "a",
          tail: vectorA.tail,
          tip: vectorA.tip,
          label: "a",
          tipMovable: false,
          tailMovable: false,
          color: "blue",
        },
        {
          id: "b",
          tail: vectorB.tail,
          tip: vectorB.tip,
          label: "b",
          tipMovable: false,
          tailMovable: false,
          color: "blue",
        },
        {
          id: "c",
          tail: randomCVec.tail,
          tip: randomCVec.tip,
          label: "c",
          tipMovable: true,
          tailMovable: true,
          color: "white",
        },
      ]);
    },
    validate: () => {
      const { getVector } = useScene2DStore.getState();
      const a = getVector("a");
      const b = getVector("b");
      const c = getVector("c");
      if (!a || !b || !c) return false;

      const expectedSum = vec.add(
        vec.sub(a.tip, a.tail),
        vec.sub(b.tip, b.tail)
      );
      const cVector = vec.sub(c.tip, c.tail);

      const isCorrect =
        cVector[0] === expectedSum[0] && cVector[1] === expectedSum[1];
      return isCorrect;
    },
  };
}

const adjustVectorSumResultProps: VectorSumAjustResultProps[] = [
  // Level 1: Simple vector sums (same starting point)
  {
    order: 1,
    title: "Soma Vetorial Básica",
    instructions: "Ajuste o vetor verde para representar a soma de a + b",
    vectorA: {
      tail: [0, 0],
      tip: [2, 0],
    },
    vectorB: {
      tail: [0, 0],
      tip: [0, 3],
    },
  },
  {
    order: 2,
    title: "Soma Diagonal Simples",
    instructions: "Posicione o vetor c como resultado da soma",
    vectorA: {
      tail: [0, 0],
      tip: [3, 0],
    },
    vectorB: {
      tail: [0, 0],
      tip: [0, 3],
    },
  },

  // Level 2: Negative components
  {
    order: 4,
    title: "Soma Completa",
    instructions: "Ajuste o vetor c para representar a soma de a e b",
    vectorA: {
      tail: [0, 0],
      tip: [3, -1],
    },
    vectorB: {
      tail: [0, 0],
      tip: [-2, 4],
    },
  },

  // Level 3: Displaced vectors
  {
    order: 5,
    title: "Vetores Deslocados",
    instructions: "Calcule a soma considerando diferentes pontos iniciais",
    vectorA: {
      tail: [1, 1],
      tip: [3, 2],
    },
    vectorB: {
      tail: [0, 2],
      tip: [2, 4],
    },
  },
  {
    order: 6,
    title: "Soma Complexa",
    instructions: "Ajuste o vetor resultante para a combinação de a e b",
    vectorA: {
      tail: [-1, 2],
      tip: [1, 3],
    },
    vectorB: {
      tail: [2, -1],
      tip: [3, 2],
    },
  },

  // Level 4: Decimal values
  {
    order: 7,
    title: "Precisão Decimal",
    instructions:
      "Posicione c para ser a soma a + b com valores decimais exatos",
    vectorA: {
      tail: [0, 0],
      tip: [1.5, 0],
    },
    vectorB: {
      tail: [0, 0],
      tip: [0, 2.5],
    },
  },
  {
    order: 8,
    title: "Desafio Final",
    instructions: "Ajuste c para ser a soma de a e b com precisão decimal",
    vectorA: {
      tail: [0.5, -1],
      tip: [2.5, 1],
    },
    vectorB: {
      tail: [-1.5, 0.5],
      tip: [0.5, 2.5],
    },
  },
];

export const vectorSumAdjustResultAssignmentList: Assignment[] =
  adjustVectorSumResultProps.map(createVectorSumAdjustResultAssignment);
