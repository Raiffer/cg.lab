import { useFillInTheBlankStore } from "@/store/fillInTheBlankStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { vec } from "mafs";

interface DefineTheVectorAssignmentProps {
  order: number;
  title: string;
  instructions: string;
  pointA: [number, number];
  pointB: [number, number];
}

function createDefineTheVectorAssignment({
  order,
  title,
  instructions,
  pointA,
  pointB,
}: DefineTheVectorAssignmentProps): Assignment {
  return {
    assisted: false,
    id: `define-the-vector-${order}`,
    title,
    instructions,
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    subjectCategory: "vector-definition",
    setup: () => {
      const { setVectors } = useScene2DStore.getState();
      setVectors([
        {
          id: "v",
          tail: pointA,
          tip: pointB,
          label: "v",
          color: "blue",
        },
      ]);

      useFillInTheBlankStore.getState().setInputs([
        {
          dimention: "2D",
          coordinatesValue: { x: "", y: "", z: "" },
          pointRef: "v",
          label: "v",
        },
      ]);
    },
    validate() {
      const { getInputByPointRef } = useFillInTheBlankStore.getState();
      const v = getInputByPointRef("v");
      if (!v) return false;

      const vector = vec.sub(pointB, pointA);
      const inputX = Number(v?.coordinatesValue.x);
      const inputY = Number(v?.coordinatesValue.y);

      const isCorrect = inputX === vector[0] && inputY === vector[1];
      return isCorrect;
    },
  };
}

const defineTheVectorAssignmentsProps: DefineTheVectorAssignmentProps[] = [
  // Nível 1: Vetores básicos no primeiro quadrante
  {
    order: 1,
    title: "Vetor Horizontal Simples",
    instructions: "Determine as componentes do vetor mostrado",
    pointA: [0, 0],
    pointB: [2, 0],
  },
  {
    order: 2,
    title: "Vetor Vertical Simples",
    instructions: "Encontre as coordenadas do vetor apresentado",
    pointA: [0, 0],
    pointB: [0, 3],
  },

  // Nível 2: Vetores diagonais no primeiro quadrante
  {
    order: 3,
    title: "Vetor Diagonal Positivo",
    instructions: "Calcule as componentes do vetor na diagonal",
    pointA: [0, 0],
    pointB: [2, 2],
  },
  {
    order: 4,
    title: "Vetor com Componentes Diferentes",
    instructions: "Determine o vetor com magnitudes distintas em cada eixo",
    pointA: [1, 1],
    pointB: [3, 4],
  },

  // Nível 3: Vetores com componentes negativas
  {
    order: 5,
    title: "Vetor Horizontal Negativo",
    instructions: "Analise o vetor e encontre suas componentes",
    pointA: [2, 0],
    pointB: [0, 0],
  },
  {
    order: 6,
    title: "Vetor Vertical Negativo",
    instructions: "Determine as coordenadas do vetor apontando para baixo",
    pointA: [0, 3],
    pointB: [0, 1],
  },

  // Nível 4: Vetores em múltiplos quadrantes
  {
    order: 7,
    title: "Vetor entre Quadrantes",
    instructions: "Calcule o vetor que atravessa diferentes quadrantes",
    pointA: [1, 2],
    pointB: [-1, 3],
  },
  {
    order: 8,
    title: "Vetor Completo",
    instructions: "Encontre todas as componentes do vetor mostrado",
    pointA: [2, 3],
    pointB: [-2, -1],
  },

  // Nível 5: Vetores decimais
  {
    order: 9,
    title: "Vetor com Componentes Decimais",
    instructions: "Determine as coordenadas do vetor com precisão",
    pointA: [0.5, 1],
    pointB: [1.5, 2.5],
  },
  {
    order: 10,
    title: "Desafio de Vetores",
    instructions: "Analise cuidadosamente o vetor e suas componentes",
    pointA: [1.5, 2.5],
    pointB: [-0.5, 3.5],
  },
];

export const defineTheVectorAssignmentList: Assignment[] =
  defineTheVectorAssignmentsProps.map(createDefineTheVectorAssignment);
