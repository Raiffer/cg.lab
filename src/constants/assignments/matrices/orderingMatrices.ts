import {
  MatrixOption,
  useOrderMatrixStore,
} from "@/store/orderMatrixMultiplicationStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { TPolygon } from "@/types/Scene2DConfig";
import { shuffleArray } from "@/utils";
import {
  applyTransformationsToPolygon,
  create2DRotationMatrix,
  create2DScaleMatrix,
  create2DTranslationMatrix,
} from "@/utils/matrix";
import { createSquare } from "@/utils/polygon";
import { Matrix3 } from "three";

interface OrderMatrixMultiplicationProps {
  order: number;
  title?: string;
  instructions?: string;
  initialPolygons: TPolygon[];
  objectiveTransformations: Matrix3[];
  availableTransformations: {
    type: "translation" | "scale" | "rotation";
    values: [number, number] | number;
    id?: string;
  }[];
}

function createMatrixFromConfig(
  type: "translation" | "scale" | "rotation",
  values: [number, number] | number
) {
  switch (type) {
    case "translation":
      return create2DTranslationMatrix(...(values as [number, number]));
    case "scale":
      return create2DScaleMatrix(...(values as [number, number]));
    case "rotation":
      return create2DRotationMatrix(values as number);
    default:
      throw new Error("Invalid transformation type: " + type);
  }
}

function createOrderMatrixMultiplication({
  order,
  title,
  instructions,
  initialPolygons,
  objectiveTransformations,
  availableTransformations,
}: OrderMatrixMultiplicationProps): Assignment {
  const objectivePolygons = initialPolygons.map(polygon => {
    const transformedPolygon = applyTransformationsToPolygon(
      polygon,
      objectiveTransformations
    );
    return {
      ...transformedPolygon,
      id: `objective-${polygon.id}`,
    };
  });

  const matricesOptions = availableTransformations.map((transform, index) => {
    const id = transform.id || `${transform.type}-matrix-${index}`;
    const matrix = createMatrixFromConfig(transform.type, transform.values);
    return createTransformOption(
      id,
      matrix,
      transform.type === "rotation" ? "z" : undefined,
      transform.type === "rotation" ? (transform.values as number) : undefined
    );
  });
  const shuffledMatricesOptions = shuffleArray(matricesOptions);

  return {
    id: `sorting-matrices-${order}`,
    title: title || "Ordenação de Matrizes",
    instructions:
      instructions ||
      "Ordene as matrizes de transformação para obter o resultado esperado.",
    order,
    type: AssignmentType.ORDER_MATRIX_MULTIPLICATION,
    subjectCategory: "matrix-multiplication",
    setup() {
      const { setPolygons, setObjectivePolygons } = useScene2DStore.getState();
      setPolygons(initialPolygons);
      setObjectivePolygons(objectivePolygons);

      const { createObject, setMatricesOptions } =
        useOrderMatrixStore.getState();
      createObject(initialPolygons[0].id);
      setMatricesOptions(shuffledMatricesOptions);
    },
    validate() {
      const sceneSquare = useScene2DStore
        .getState()
        .getPolygon(initialPolygons[0].id);
      if (!sceneSquare) return false;

      const objectiveSquare = objectivePolygons[0];
      return (
        sceneSquare.points.every(
          (point, index) =>
            point.position[0] === objectiveSquare.points[index].position[0] &&
            point.position[1] === objectiveSquare.points[index].position[1]
        ) && sceneSquare.color === objectiveSquare.color
      );
    },
  };
}

function createTransformOption(
  id: string,
  matrix: Matrix3,
  rotationAxis?: "x" | "y" | "z",
  rotationAngle?: number
): MatrixOption {
  return {
    id,
    matrix: matrix.transpose(),
    rotationAxis,
    rotationAngle,
  };
}

const orderingMatricesAssignmentsProps: Omit<
  OrderMatrixMultiplicationProps,
  "order"
>[] = [
  {
    title: "Escala na origem",
    instructions:
      "Selecione as matrizes para aplicar uma escala de 2x no quadrado mantendo-o na origem",
    initialPolygons: [createSquare("square1", "blue", [0, 0], [1, 1])],
    objectiveTransformations: [create2DScaleMatrix(2, 2)],
    availableTransformations: [
      { type: "translation", values: [-1, -1] },
      { type: "scale", values: [2, 2] },
      { type: "translation", values: [1, 1] },
    ],
  },
  {
    title: "Escala em quadrado decentralizado da origem",
    instructions:
      "Selecione as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [1.5, 1.5], [1, 1])],
    objectiveTransformations: [create2DScaleMatrix(2, 2)],
    availableTransformations: [
      { type: "translation", values: [-1.5, -1.5] },
      { type: "translation", values: [-1, -1] },
      { type: "scale", values: [2, 2] },
      { type: "translation", values: [1, 1] },
    ],
  },
  {
    title: "Translação e escala",
    instructions:
      "Selecione as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [0.5, 0.5], [1, 1])],
    objectiveTransformations: [
      create2DTranslationMatrix(-0.5, -0.5),
      create2DScaleMatrix(2, 2),
    ],
    availableTransformations: [
      { type: "translation", values: [-0.5, -0.5] },
      { type: "scale", values: [2, 2] },
      { type: "translation", values: [1, 1] },
    ],
  },
  {
    title: "Translação e rotação",
    instructions:
      "Selecione as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [1, 1], [1, 1])],
    objectiveTransformations: [
      create2DTranslationMatrix(-1, -1),
      create2DRotationMatrix(45),
    ],
    availableTransformations: [
      { type: "translation", values: [-1, -1] },
      { type: "scale", values: [2, 2] },
      { type: "rotation", values: 45 },
      { type: "translation", values: [1, 1] },
    ],
  },
  {
    title: "Combinando três transformações",
    instructions:
      "Selecione as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [1, 1], [1, 1])],
    objectiveTransformations: [
      create2DTranslationMatrix(-1, -1),
      create2DScaleMatrix(2, 2),
      create2DRotationMatrix(45),
    ],
    availableTransformations: [
      { type: "translation", values: [-1, -1] },
      { type: "scale", values: [2, 2] },
      { type: "rotation", values: 45 },
      { type: "translation", values: [1, 1] },
    ],
  },
  {
    title: "Voltando para a posição original",
    instructions:
      "Selecione as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [1, 1], [1, 1])],
    objectiveTransformations: [
      create2DTranslationMatrix(-1, -1),
      create2DRotationMatrix(45),
      create2DTranslationMatrix(1, 1),
    ],
    availableTransformations: [
      { type: "translation", values: [-1, -1] },
      { type: "scale", values: [2, 2] },
      { type: "rotation", values: 45 },
      { type: "translation", values: [1, 1] },
    ],
  },
  {
    title: "Translação e escala decimal",
    instructions:
      "Selecione as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [-1, 1], [2, 2])],
    objectiveTransformations: [
      create2DTranslationMatrix(1, -1),
      create2DScaleMatrix(0.5, 0.5),
    ],
    availableTransformations: [
      { type: "translation", values: [1, -1] },
      { type: "scale", values: [0.5, 0.5] },
      { type: "translation", values: [-1, -1] },
      { type: "translation", values: [-1, 1] },
    ],
  },
  {
    title: "Matrizes repetidas",
    instructions:
      "Selecione as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [0.5, 0.5], [1, 1])],
    objectiveTransformations: [
      create2DTranslationMatrix(-0.5, -0.5),
      create2DScaleMatrix(2, 2),
      create2DScaleMatrix(2, 2),
    ],
    availableTransformations: [
      { type: "translation", values: [-0.5, -0.5] },
      { type: "scale", values: [2, 2] },
      { type: "translation", values: [0.5, 0.5] },
    ],
  },
  {
    title: "Transformações repetidas",
    instructions:
      "Selecione as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [0.5, 0.5], [1, 1])],
    objectiveTransformations: [
      create2DTranslationMatrix(-0.5, -0.5),
      create2DScaleMatrix(4, 4),
      create2DScaleMatrix(0.5, 0.5),
    ],
    availableTransformations: [
      { type: "translation", values: [-0.5, -0.5] },
      { type: "scale", values: [4, 4] },
      { type: "scale", values: [0.5, 0.5] },
      { type: "translation", values: [0.5, 0.5] },
    ],
  },
  // Nível avançado: quatro transformações em sequência, com duas matrizes
  // distratoras que não fazem parte da solução
  {
    title: "Quatro passos",
    instructions:
      "Selecione, na ordem correta, as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [1, 1], [1, 1])],
    objectiveTransformations: [
      create2DTranslationMatrix(-1, -1),
      create2DRotationMatrix(90),
      create2DScaleMatrix(1.5, 1.5),
      create2DTranslationMatrix(1, 1),
    ],
    availableTransformations: [
      { type: "translation", values: [-1, -1] },
      { type: "rotation", values: 90 },
      { type: "scale", values: [1.5, 1.5] },
      { type: "translation", values: [1, 1] },
      { type: "rotation", values: -90 },
      { type: "scale", values: [2, 2] },
    ],
  },
  // Nível avançado: distratoras que revertem o efeito correto, para forçar
  // atenção ao sinal de cada transformação, não só ao tipo
  {
    title: "Cuidado com o sinal",
    instructions:
      "Selecione, na ordem correta, as matrizes para transformar o quadrado para o objetivo",
    initialPolygons: [createSquare("square1", "blue", [2, 0], [1, 1])],
    objectiveTransformations: [
      create2DTranslationMatrix(-2, 0),
      create2DRotationMatrix(45),
      create2DTranslationMatrix(2, 0),
    ],
    availableTransformations: [
      { type: "translation", values: [-2, 0] },
      { type: "translation", values: [2, 0] },
      { type: "rotation", values: 45 },
      { type: "rotation", values: -45 },
    ],
  },
];

export const orderingMatricesAssignments = orderingMatricesAssignmentsProps.map(
  (props, index) =>
    createOrderMatrixMultiplication({
      order: index + 1,
      ...props,
    })
);
