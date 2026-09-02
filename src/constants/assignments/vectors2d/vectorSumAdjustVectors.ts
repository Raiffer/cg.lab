import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { getRandomVectorWithTailAndTip } from "@/utils";
import { vec } from "mafs";

interface VectorSumAdjustVectorsProps {
  order: number;
  title: string;
  instructions: string;
  vectorCTail: [number, number];
  vectorCTip: [number, number];
  displayHelperVector?: boolean;
}

function createAdjustVectorSumAssignment({
  order,
  title,
  instructions,
  vectorCTail,
  vectorCTip,
  displayHelperVector = false,
}: VectorSumAdjustVectorsProps): Assignment {
  const randomAVec = getRandomVectorWithTailAndTip([-4, 4]);
  const randomBVec = getRandomVectorWithTailAndTip([-4, 4]);

  const vectorC = vec.sub(vectorCTip, vectorCTail);

  const formattedInstructions = displayHelperVector
    ? instructions
    : `Ajuste os vetores a e b para que a soma deles seja (${vectorC[0]}, ${vectorC[1]})`;

  return {
    assisted: false,
    id: `adjust-vector-sum-${order}`,
    title,
    instructions: formattedInstructions,
    order,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "vector-sum",
    setup: () => {
      const { setVectors, addVector } = useScene2DStore.getState();
      setVectors([
        {
          id: "a",
          tail: randomAVec.tail,
          tip: randomAVec.tip,
          label: "a",
          tipMovable: true,
          tailMovable: true,
          color: "red",
        },
        {
          id: "b",
          tail: randomBVec.tail,
          tip: randomBVec.tip,
          label: "b",
          tipMovable: true,
          tailMovable: true,
          color: "blue",
        },
      ]);
      if (displayHelperVector) {
        addVector({
          id: "c",
          tail: vectorCTail,
          tip: vectorCTip,
          label: "c",
          color: "white",
          tailMovable: false,
          tipMovable: false,
        });
      }
    },
    validate: () => {
      const { getVector } = useScene2DStore.getState();
      const a = getVector("a");
      const b = getVector("b");
      if (!a || !b) return false;

      const vecA = vec.sub(a.tip, a.tail);
      const vecB = vec.sub(b.tip, b.tail);

      const sum = vec.add(vecA, vecB);
      const isCorrect = vectorC[0] === sum[0] && vectorC[1] === sum[1];

      if (isCorrect) {
        const { addVector } = useScene2DStore.getState();
        addVector({
          id: "c-correct",
          tail: vectorCTail,
          tip: vectorCTip,
          label: "c",
          color: "green",
          tailMovable: false,
          tipMovable: false,
        });
      }

      return isCorrect;
    },
  };
}

const vectorSumAssignmentsProps: VectorSumAdjustVectorsProps[] = [
  // Level 1: Basic vector sums (visual helper enabled)
  {
    order: 1,
    title: "Soma de Vetores Básica",
    instructions: "Combine os vetores a e b para formar o vetor c",
    vectorCTail: [0, 0],
    vectorCTip: [2, 2],
    displayHelperVector: true,
  },
  {
    order: 2,
    title: "Soma Horizontal e Vertical",
    instructions: "Ajuste os vetores a e b para formar o vetor c",
    vectorCTail: [0, 0],
    vectorCTip: [3, 1],
    displayHelperVector: true,
  },

  // Level 2: Mixed direction sums (no visual helper)
  {
    order: 3,
    title: "Soma com Componentes Opostas",
    instructions: "Combine vetores para obter (2, -1)",
    vectorCTail: [0, 0],
    vectorCTip: [2, -1],
  },
  {
    order: 4,
    title: "Soma no Terceiro Quadrante",
    instructions: "Ajuste os vetores para obter (-3, -2)",
    vectorCTail: [0, 0],
    vectorCTip: [-3, -2],
  },

  // Level 3: Non-origin vectors
  {
    order: 5,
    title: "Soma com Vetores Deslocados",
    instructions: "Combine vetores partindo de (1, 1) para obter (3, 2)",
    vectorCTail: [1, 1],
    vectorCTip: [4, 3],
  },
  {
    order: 6,
    title: "Soma Complexa",
    instructions: "Encontre a combinação que resulta em (1, -4)",
    vectorCTail: [-1, 2],
    vectorCTip: [0, -2],
  },

  // Level 4: Decimal values
  {
    order: 7,
    title: "Precisão Decimal",
    instructions: "Ajuste para obter (1.5, 0.5)",
    vectorCTail: [0, 0],
    vectorCTip: [1.5, 0.5],
  },
  {
    order: 8,
    title: "Desafio Vetorial",
    instructions: "Combine para obter (-2.5, 1.5)",
    vectorCTail: [0.5, -1],
    vectorCTip: [-2, 0.5],
  },

  // Level 5: Challenging combinations
  {
    order: 9,
    title: "Soma de Múltiplos Vetores",
    instructions: "Ajuste dois vetores para somar (0, 5)",
    vectorCTail: [0, 0],
    vectorCTip: [0, 5],
  },
  {
    order: 10,
    title: "Soma de Vetores com Componentes Negativas",
    instructions: "Combine vetores para obter (3.5, -2.5)",
    vectorCTail: [1, -1],
    vectorCTip: [4.5, -3.5],
  },
];

export const vectorSumAdjustVectorsAssignmentList =
  vectorSumAssignmentsProps.map(createAdjustVectorSumAssignment);
