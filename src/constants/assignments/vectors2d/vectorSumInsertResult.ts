import { useFillInTheBlankStore } from "@/store/fillInTheBlankStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { vec } from "mafs";

interface VectorSumInsertResultProps {
  order: number;
  title: string;
  instructions: string;
  vectorATail: [number, number];
  vectorATip: [number, number];
  vectorBTail: [number, number];
  vectorBTip: [number, number];
}

function createVectorSumInsertResultAssignment({
  order,
  title,
  instructions,
  vectorATail,
  vectorATip,
  vectorBTail,
  vectorBTip,
}: VectorSumInsertResultProps): Assignment {
  return {
    id: `insert-vector-sum-${order}`,
    title,
    instructions,
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    subjectCategory: "vector-sum",
    setup: () => {
      const { setVectors } = useScene2DStore.getState();
      setVectors([
        {
          id: "a",
          tail: vectorATail,
          tip: vectorATip,
          label: "a",
          color: "blue",
        },
        {
          id: "b",
          tail: vectorBTail,
          tip: vectorBTip,
          label: "b",
          color: "blue",
        },
      ]);

      useFillInTheBlankStore.getState().setInputs([
        {
          dimention: "2D",
          pointRef: "c",
          label: "c",
          coordinatesValue: { x: "", y: "" },
        },
      ]);
    },
    validate: () => {
      const { getVector, addVector } = useScene2DStore.getState();
      const { getInputByPointRef } = useFillInTheBlankStore.getState();
      const a = getVector("a");
      const b = getVector("b");
      const input = getInputByPointRef("c");
      if (!a || !b || !input) return false;

      const vecA = vec.sub(a.tip, a.tail);
      const vecB = vec.sub(b.tip, b.tail);

      const sum = vec.add(vecA, vecB);
      const inputX = Number(input.coordinatesValue.x);
      const inputY = Number(input.coordinatesValue.y);
      const isCorrect = inputX === sum[0] && inputY === sum[1];

      if (isCorrect && !getVector("c")) {
        addVector({
          id: "c",
          tail: [0, 0],
          tip: sum,
          label: "c",
          color: "green",
        });
      }

      return isCorrect;
    },
  };
}

const vectorSumInsertResultProps: VectorSumInsertResultProps[] = [
  // Level 1: Simple vector additions (same direction)
  {
    order: 1,
    title: "Soma de Vetores Colineares",
    instructions: "Calcule o vetor resultante da soma de a e b",
    vectorATail: [0, 0],
    vectorATip: [2, 0],
    vectorBTail: [2, 0],
    vectorBTip: [4, 0],
  },
  {
    order: 2,
    title: "Soma de Vetores Verticais",
    instructions: "Determine o vetor soma de a e b",
    vectorATail: [0, 0],
    vectorATip: [0, 3],
    vectorBTail: [0, 3],
    vectorBTip: [0, 5],
  },

  // Level 2: Perpendicular vectors
  {
    order: 3,
    title: "Soma de Vetores Perpendiculares",
    instructions: "Some o vetor horizontal a com o vertical b",
    vectorATail: [0, 0],
    vectorATip: [3, 0],
    vectorBTail: [3, 0],
    vectorBTip: [3, 2],
  },
  {
    order: 4,
    title: "Soma Diagonal",
    instructions: "Calcule a resultante destes vetores diagonais",
    vectorATail: [0, 0],
    vectorATip: [2, 2],
    vectorBTail: [2, 2],
    vectorBTip: [4, 4],
  },

  // Level 3: Mixed direction vectors
  {
    order: 5,
    title: "Soma com Componentes Opostas",
    instructions: "Encontre o vetor resultante desta combinação",
    vectorATail: [0, 0],
    vectorATip: [3, 1],
    vectorBTail: [3, 1],
    vectorBTip: [1, 3],
  },
  {
    order: 6,
    title: "Soma Complexa",
    instructions: "Calcule a soma vetorial completa",
    vectorATail: [1, 1],
    vectorATip: [3, 2],
    vectorBTail: [3, 2],
    vectorBTip: [2, 4],
  },
  {
    order: 7,
    title: "Soma com Componentes Negativas",
    instructions: "Calcule o resultado com vetores em direções opostas",
    vectorATail: [0, 0],
    vectorATip: [2, 1],
    vectorBTail: [2, 1],
    vectorBTip: [0, 3],
  },
  {
    order: 8,
    title: "Soma com Valores Decimais",
    instructions: "Determine a soma precisa destes vetores",
    vectorATail: [0, 0],
    vectorATip: [1.5, 0],
    vectorBTail: [1.5, 0],
    vectorBTip: [1.5, 2.5],
  },
];

export const vectorSumInsertResultAssignmentList =
  vectorSumInsertResultProps.map(createVectorSumInsertResultAssignment);
