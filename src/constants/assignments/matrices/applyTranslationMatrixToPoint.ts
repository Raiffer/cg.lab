import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { vec } from "mafs";

interface ApplyTranslationMatrixToPointProps {
  order: number;
  title?: string;
  instructions?: string;
  initialPosition: [number, number];
  translation: [number, number];
}

function createTranslationMatrix2DAssignment({
  order,
  title = "Aplique a Matriz de Translação",
  instructions = "Mova o ponto para a posição resultante após aplicar a matriz de translação.",
  initialPosition,
  translation,
}: ApplyTranslationMatrixToPointProps): Assignment {
  const targetPosition = vec.add(initialPosition, translation);

  return {
    assisted: false,
    id: `apply-translation-matrix-2d-${order}`,
    title,
    instructions,
    order,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "translation-matrix",
    setup: () => {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A-initial",
          label: "A₀",
          position: initialPosition,
          movable: false,
          color: "lightgreen",
        },
        {
          id: "A",
          label: "A",
          position: initialPosition,
          movable: true,
          color: "red",
        },
      ]);

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: "translation-matrix",
        type: MatrixType.TRANSLATION,
        dimention: "2D",
        matrixValue: [
          [
            { value: 1, editable: false },
            { value: 0, editable: false },
            { value: translation[0], editable: false },
          ],
          [
            { value: 0, editable: false },
            { value: 1, editable: false },
            { value: translation[1], editable: false },
          ],
          [
            { value: 0, editable: false },
            { value: 0, editable: false },
            { value: 1, editable: false },
          ],
        ],
      });
    },
    validate: () => {
      const point = useScene2DStore.getState().getPoint("A");
      if (!point) return false;

      return (
        point.position[0] === targetPosition[0] &&
        point.position[1] === targetPosition[1]
      );
    },
  };
}

const applyTranslationMatrixToPointAssignmentProps: Omit<
  ApplyTranslationMatrixToPointProps,
  "order"
>[] = [
  // Nível 1: Translações básicas com números inteiros
  {
    title: "Translação Horizontal",
    instructions: "Mova o ponto para a direita usando a matriz de translação",
    initialPosition: [0, 0],
    translation: [3, 0],
  },
  {
    title: "Translação Vertical",
    instructions: "Mova o ponto para cima usando a transformação mostrada",
    initialPosition: [0, 0],
    translation: [0, 2],
  },

  // Nível 2: Translações diagonais com inteiros
  {
    title: "Translação Diagonal",
    instructions: "Mova o ponto na diagonal superior direita",
    initialPosition: [0, 0],
    translation: [2, 3],
  },
  {
    title: "Translação a partir de Outra Posição",
    instructions: "Aplique a transformação partindo deste ponto inicial",
    initialPosition: [1, 2],
    translation: [3, 1],
  },

  // Nível 3: Introdução de decimais (sem mencionar valores)
  {
    title: "Translação Horizontal Precisa",
    instructions: "Execute o movimento horizontal com precisão",
    initialPosition: [0, 0],
    translation: [1.5, 0],
  },
  {
    title: "Translação Vertical Precisa",
    instructions: "Realize o deslocamento vertical cuidadosamente",
    initialPosition: [0, 0],
    translation: [0, 2.5],
  },

  // Nível 4: Combinação de movimentos com decimais
  {
    title: "Translação Diagonal Precisa",
    instructions: "Combine movimentos horizontais e verticais com precisão",
    initialPosition: [0, 0],
    translation: [1.5, 2],
  },
  {
    title: "Translação Completa",
    instructions: "Aplique a transformação mostrada na matriz",
    initialPosition: [0, 0],
    translation: [1.5, 2.5],
  },

  // Nível 5: Desafios avançados
  {
    title: "Translação a partir de Posição Arbitrária",
    instructions: "Começando desta posição, execute a transformação correta",
    initialPosition: [2, 1],
    translation: [1.5, 0.5],
  },
  {
    title: "Desafio de Translação",
    instructions:
      "Analise a posição inicial e a matriz para mover o ponto corretamente",
    initialPosition: [1.5, 2.5],
    translation: [2.5, 1.5],
  },
];

export const applyTranslationmatrixToPointAssignmentList: Assignment[] =
  applyTranslationMatrixToPointAssignmentProps.map((props, index) =>
    createTranslationMatrix2DAssignment({ ...props, order: index + 1 })
  );
