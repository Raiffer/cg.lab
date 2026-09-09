import { initial2DTranslationMatrixValue } from "@/constants/inicial2DMatricesValues";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { applyTransformationsToPolygon } from "@/utils/matrix";
import { createSquare } from "@/utils/polygon";
import { Matrix3 } from "three";

interface FillInTranslationMatrixAssignmentProps {
  order: number;
  title: string;
  instructions: string;
  squareProps: {
    center: [number, number];
    size: [number, number];
  };
  targetTranslation: [number, number];
}

function createFillInTranslationMatrixAssignment({
  order,
  title,
  instructions,
  squareProps,
  targetTranslation,
}: FillInTranslationMatrixAssignmentProps): Assignment {
  const square = createSquare(
    "polygon",
    "blue",
    squareProps.center,
    squareProps.size
  );

  const translationMatrix = new Matrix3().translate(
    targetTranslation[0],
    targetTranslation[1]
  );
  const targetSquare = applyTransformationsToPolygon(square, [
    translationMatrix,
  ]);

  return {
    assisted: false,
    id: `fill-in-translation-matrix-${order}`,
    title: title || "Matriz de Translação",
    instructions:
      instructions ||
      "Preencha a matriz de translação para mover o quadrado para a posição objetivo.",
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "translation",
    setup() {
      const { addPolygon, setObjectivePolygons } = useScene2DStore.getState();
      addPolygon(square);
      setObjectivePolygons([{ ...targetSquare, id: "target-square" }]);

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: "translation-matrix",
        pointRefId: "A",
        type: MatrixType.TRANSLATION,
        dimention: "2D",
        matrixValue: initial2DTranslationMatrixValue,
        polygonRefId: "polygon",
      });
    },
    validate() {
      const { getMatrixById } = useFillBlankMatrixInputStore.getState();
      const matrix = getMatrixById("translation-matrix");
      if (!matrix) return false;

      const inputedTranslation = [
        Number(matrix.matrixValue[0][2].value),
        Number(matrix.matrixValue[1][2].value),
      ];
      const isCorrect =
        inputedTranslation[0] === targetTranslation[0] &&
        inputedTranslation[1] === targetTranslation[1];
      return isCorrect;
    },
  };
}

const fillInTranslationMatrixProps: Omit<
  FillInTranslationMatrixAssignmentProps,
  "order"
>[] = [
  // Nível 1: Fundamentos de translação
  {
    title: "Translação Horizontal",
    instructions:
      "Complete a matriz para mover o quadrado horizontalmente até a posição objetivo",
    squareProps: {
      center: [0, 0],
      size: [1, 1],
    },
    targetTranslation: [2, 0],
  },
  {
    title: "Translação Vertical",
    instructions: "Preencha a matriz para deslocar o quadrado verticalmente",
    squareProps: {
      center: [0, 0],
      size: [1, 1],
    },
    targetTranslation: [0, 3],
  },

  // Nível 2: Translações combinadas
  {
    title: "Translação Diagonal",
    instructions: "Ajuste a matriz para mover o quadrado na diagonal",
    squareProps: {
      center: [0, 0],
      size: [1, 1],
    },
    targetTranslation: [2, 2],
  },
  {
    title: "Translação com Componentes Diferentes",
    instructions:
      "Determine a matriz de translação que move o quadrado para a posição mostrada no painel",
    squareProps: {
      center: [0, 0],
      size: [1, 1],
    },
    targetTranslation: [3, 1],
  },

  // Nível 3: Posições iniciais diferentes
  {
    title: "Translação a partir de Posição Arbitrária",
    instructions:
      "O quadrado não está na origem. Calcule a translação necessária",
    squareProps: {
      center: [1, 1],
      size: [1, 1],
    },
    targetTranslation: [2, 0],
  },
  {
    title: "Translação com Referência Relativa",
    instructions:
      "Observe a posição inicial e determine a matriz de translação",
    squareProps: {
      center: [-1, 2],
      size: [1, 1],
    },
    targetTranslation: [2, 2],
  },

  // Nível 4: Translações negativas
  {
    title: "Translação para Esquerda",
    instructions: "Preencha a matriz para mover o quadrado para a esquerda",
    squareProps: {
      center: [0, 0],
      size: [1, 1],
    },
    targetTranslation: [-3, 0],
  },
  {
    title: "Translação para Quadrante Diferente",
    instructions:
      "Configure a matriz para mover o quadrado para o quadrante indicado",
    squareProps: {
      center: [2, 3],
      size: [1, 1],
    },
    targetTranslation: [0, -5],
  },

  // Nível 5: Desafios complexos
  {
    title: "Translação Composta",
    instructions:
      "Combine movimentos horizontais e verticais para alcançar o objetivo",
    squareProps: {
      center: [-1, -1],
      size: [1, 1],
    },
    targetTranslation: [3, -2],
  },
  {
    title: "Desafio de Translação Avançada",
    instructions:
      "Analise a posição inicial e final para determinar a translação exata",
    squareProps: {
      center: [3, -2],
      size: [1, 1],
    },
    targetTranslation: [-4, 5],
  },
];

export const fillInTranslationMatrixAssignmentList =
  fillInTranslationMatrixProps.map((props, index) => {
    return createFillInTranslationMatrixAssignment({
      ...props,
      order: index + 1,
    });
  });
