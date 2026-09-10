import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { TPolygon } from "@/types/Scene2DConfig";
import { generateTrianglePoints, TriangleType } from "@/utils";
import { createSquare } from "@/utils/polygon";
import { vec } from "mafs";

interface ApplyTranslationMatrixToPolygonProps {
  order: number;
  title?: string;
  instructions?: string;
  squareProps?: {
    center: [number, number];
    size: [number, number];
  };
  triangleProps?: {
    center: [number, number];
    size: number;
    type: TriangleType;
  };
  translation: [number, number];
}

function createTranslationMatrixToPolygonAssignment({
  order,
  title,
  instructions,
  squareProps,
  triangleProps,
  translation,
}: ApplyTranslationMatrixToPolygonProps): Assignment {
  let initialPolygon = undefined;
  if (triangleProps) {
    const trianglePoints = generateTrianglePoints(
      triangleProps?.center,
      triangleProps?.type,
      triangleProps?.size
    );
    const trianglePolygon: TPolygon = {
      id: "polygon",
      points: trianglePoints.map(point => ({
        id: `${point[0]}-${point[1]}`,
        position: point,
        color: "blue",
        label: "",
        movable: true,
      })),
      color: "blue",
    };
    initialPolygon = trianglePolygon;
  }
  if (squareProps) {
    const square = createSquare(
      "polygon",
      "blue",
      squareProps?.center,
      squareProps?.size,
      true
    );
    initialPolygon = square;
  }

  return {
    assisted: false,
    id: `apply-translation-matrix-to-polygon-2d-${order}`,
    title: title || "Aplique a Matriz de Translação a um Polígono",
    instructions: instructions || `Aplique a matriz de translação ao polígono.`,
    order,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "translation",
    setup: () => {
      const { addPolygon } = useScene2DStore.getState();
      if (initialPolygon) {
        addPolygon({
          ...initialPolygon,
          id: "initial-polygon",
          color: "gray",
          opacity: 0.35,
          strokeStyle: "dashed",
          movable: false,
          points: initialPolygon.points.map(point => ({
            ...point,
            id: `${point.id}-initial`,
            color: "gray",
            movable: false,
          })),
        });
        addPolygon(initialPolygon);
      }

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
      const { getPolygon } = useScene2DStore.getState();
      const currentPolygon = getPolygon("polygon");
      if (!currentPolygon || !initialPolygon) return false;

      const targetPolygonPoints = initialPolygon.points.map(point =>
        vec.add(point.position, translation)
      );

      const currentAndTargetPolygonsMatch = targetPolygonPoints.every(
        (point, index) => {
          const currentPoint = currentPolygon.points[index].position;
          return currentPoint[0] === point[0] && currentPoint[1] === point[1];
        }
      );
      return currentAndTargetPolygonsMatch;
    },
  };
}

const applyTranslationMatrixToPolygonAssignmentProps: Omit<
  ApplyTranslationMatrixToPolygonProps,
  "order"
>[] = [
  // Nível 1: Translações básicas com triângulo
  {
    title: "Translação Simples - Triângulo",
    instructions: "Mova o triângulo usando a matriz de translação fornecida.",
    triangleProps: {
      center: [0, 0],
      size: 2,
      type: "equilateral",
    },
    translation: [2, 0],
  },
  {
    title: "Translação Negativa Simples - Triângulo",
    instructions: "Mova o triângulo usando a matriz de translação fornecida.",
    triangleProps: {
      center: [0, 0],
      size: 2,
      type: "isosceles",
    },
    translation: [-2, 0],
  },
  {
    title: "Translação Diagonal - Triângulo",
    instructions: "Aplique a translação diagonal ao triângulo.",
    triangleProps: {
      center: [0, 0],
      size: 2,
      type: "equilateral",
    },
    translation: [1, 1],
  },

  // Nível 2: Translações negativas
  {
    title: "Translação Negativa - Triângulo",
    instructions: "Aplique uma translação com valores negativos.",
    triangleProps: {
      center: [0, 0],
      size: 2,
      type: "isosceles",
    },
    translation: [-1, -2],
  },
  {
    title: "Translação Mista - Triângulo",
    instructions: "Combine valores positivos e negativos na translação.",
    triangleProps: {
      center: [0, 0],
      size: 2,
      type: "scalene",
    },
    translation: [2, -1],
  },

  // Nível 3: Translações com quadrado
  {
    title: "Translação Básica - Quadrado",
    instructions: "Aplique a translação ao quadrado.",
    squareProps: {
      center: [0, 0],
      size: [1, 1],
    },
    translation: [3, 2],
  },
  {
    title: "Translação Complexa - Quadrado",
    instructions: "Translade o quadrado com valores maiores.",
    squareProps: {
      center: [0, 0],
      size: [1.5, 1.5],
    },
    translation: [4, -3],
  },

  // Nível 4: Translações precisas
  {
    title: "Translação Decimal - Triângulo",
    instructions: "Aplique uma translação com valores decimais precisos.",
    triangleProps: {
      center: [0, 0],
      size: 1,
      type: "equilateral",
    },
    translation: [1.5, 0.5],
  },
  {
    title: "Translação Decimal - Quadrado",
    instructions: "Translade o quadrado com valores decimais.",
    squareProps: {
      center: [0, 0],
      size: [1, 1],
    },
    translation: [2.5, -1.5],
  },

  // Nível 5: Desafios finais
  {
    title: "Desafio de Translação - Triângulo",
    instructions: "Aplique uma translação complexa ao triângulo.",
    triangleProps: {
      center: [1, 1],
      size: 2,
      type: "isosceles",
    },
    translation: [-3, 2],
  },
];

export const applyTranslationMatrixToPolygonAssignmentList: Assignment[] =
  applyTranslationMatrixToPolygonAssignmentProps.map((props, index) =>
    createTranslationMatrixToPolygonAssignment({
      ...props,
      order: index + 1,
    })
  );
