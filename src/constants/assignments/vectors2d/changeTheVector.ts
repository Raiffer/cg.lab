import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { vec } from "mafs";

interface ChangeTheVectorAssignmentProps {
  order: number;
  title: string;
  instructions: string;
  tail: [number, number];
  tip: [number, number];
  goalVector: [number, number];
}

function createChangeTheVectorAssignment({
  order,
  title,
  instructions,
  tail,
  tip,
  goalVector,
}: ChangeTheVectorAssignmentProps): Assignment {
  return {
    assisted: false,
    id: `change-the-vector-${order}`,
    order,
    title,
    instructions,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "vector-definition",
    setup: () => {
      useScene2DStore.getState().reset();
      const { setVectors } = useScene2DStore.getState();
      setVectors([
        {
          id: "v",
          tail: tail,
          tip: tip,
          tailMovable: true,
          tipMovable: true,
          color: "red",
          label: "v",
        },
      ]);
    },
    validate: () => {
      const { getVector } = useScene2DStore.getState();
      const vector = getVector("v");
      if (!vector) return false;

      const vecA = vec.sub(vector.tip, vector.tail);
      const isCorrect = vecA[0] === goalVector[0] && vecA[1] === goalVector[1];
      return isCorrect;
    },
  };
}

const changeTheVectorAssignments: ChangeTheVectorAssignmentProps[] = [
  // Level 1: Basic vector changes (same starting point)
  {
    order: 1,
    title: "Vetor Horizontal",
    instructions: "Transforme o vetor em um vetor (3, 0)",
    tail: [0, 0],
    tip: [1, 1],
    goalVector: [3, 0],
  },
  {
    order: 2,
    title: "Vetor Vertical",
    instructions: "Modifique o vetor para que seja (0, 2)",
    tail: [0, 0],
    tip: [1, -1],
    goalVector: [0, 2],
  },

  // Level 2: Diagonal vectors (same starting point)
  {
    order: 3,
    title: "Vetor Diagonal Positivo",
    instructions: "Ajuste o vetor para que seja (2, 2)",
    tail: [0, 0],
    tip: [1, 0],
    goalVector: [2, 2],
  },
  {
    order: 4,
    title: "Vetor Diagonal Assimétrico",
    instructions: "Transforme o vetor em (3, 1)",
    tail: [0, 0],
    tip: [0.5, 1],
    goalVector: [3, 1],
  },

  // Level 3: Negative components
  {
    order: 5,
    title: "Sentido Invertido",
    instructions:
      "Altere o sentido do vetor para que aponte para a esquerda, mantendo o comprimento",
    tail: [0, 0],
    tip: [2, 0],
    goalVector: [-2, 0],
  },
  {
    order: 6,
    title: "Vetor Vertical Negativo",
    instructions:
      "Altere o sentido do vetor para que aponte para baixo, mantendo o comprimento",
    tail: [0, 0],
    tip: [0, 3],
    goalVector: [0, -3],
  },

  // Level 4: Changing from non-origin points
  {
    order: 7,
    title: "Vetor a partir de Ponto Arbitrário",
    instructions: "Ajuste o vetor para que tenha as componentes (2, -1)",
    tail: [1, 1],
    tip: [2, 2],
    goalVector: [2, -1],
  },
  {
    order: 8,
    title: "Vetor Completo",
    instructions: "Transforme o vetor para que tenha as componentes (3, -2)",
    tail: [0, 0],
    tip: [1, 1],
    goalVector: [3, -2],
  },

  // Level 5: Decimal values
  {
    order: 9,
    title: "Vetor com Precisão Decimal",
    instructions: "Ajuste o vetor para que tenha as componentes (1.5, 0.5)",
    tail: [0, 0],
    tip: [1, 0],
    goalVector: [1.5, 0.5],
  },
  {
    order: 10,
    title: "Desafio de Vetor Decimal",
    instructions: "Ajuste o vetor para que tenha as componentes (2.5, -1.5)",
    tail: [1, 1],
    tip: [2, 2],
    goalVector: [2.5, -1.5],
  },
];

export const changeTheVectorAssignmentList: Assignment[] =
  changeTheVectorAssignments.map(createChangeTheVectorAssignment);
