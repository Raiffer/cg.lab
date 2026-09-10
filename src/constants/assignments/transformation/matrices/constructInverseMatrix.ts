import {
  initial2DScalingMatrixValue,
  initial2DTranslationMatrixValue,
} from "@/constants/inicial2DMatricesValues";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import {
  applyTransformationsToPolygon,
  create2DScaleMatrix,
  create2DTranslationMatrix,
} from "@/utils/matrix";
import { createSquare } from "@/utils/polygon";

type ConstructInverseMatrixProps = {
  order: number;
  title?: string;
  squareCenter: [number, number];
  squareSize: [number, number];
} & (
  | { matrixType: "translation"; appliedValues: [number, number] }
  | { matrixType: "scale"; appliedValues: [number, number] }
);

function createConstructInverseMatrixAssignment(
  props: ConstructInverseMatrixProps
): Assignment {
  const { order, title, squareCenter, squareSize, matrixType, appliedValues } =
    props;

  const originalSquare = createSquare(
    "polygon",
    "blue",
    squareCenter,
    squareSize
  );
  const appliedMatrix =
    matrixType === "translation"
      ? create2DTranslationMatrix(...appliedValues)
      : create2DScaleMatrix(...appliedValues);
  // Polygon as it appears at the start of the exercise: A already applied.
  const displacedSquare = applyTransformationsToPolygon(originalSquare, [
    appliedMatrix,
  ]);

  const inverseValues: [number, number] =
    matrixType === "translation"
      ? [-appliedValues[0], -appliedValues[1]]
      : [1 / appliedValues[0], 1 / appliedValues[1]];

  const matrixLabel =
    matrixType === "translation"
      ? `A = translação (${appliedValues[0]}, ${appliedValues[1]})`
      : `A = escala (${appliedValues[0]}, ${appliedValues[1]})`;

  return {
    id: `construct-inverse-matrix-${order}`,
    order,
    title: title || "Construa a Matriz Inversa",
    instructions: `Preencha B, inversa de A = ${matrixLabel}, para o quadrado voltar ao contorno tracejado.`,
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "inverse-matrix",
    setup() {
      const { addPolygon, setObjectivePolygons } = useScene2DStore.getState();
      addPolygon(displacedSquare);
      setObjectivePolygons([
        { ...originalSquare, id: "target-polygon", color: "green" },
      ]);

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: "inverse-matrix",
        label: "B",
        polygonRefId: "polygon",
        type: matrixType === "translation" ? MatrixType.TRANSLATION : MatrixType.SCALING,
        dimention: "2D",
        matrixValue:
          matrixType === "translation"
            ? initial2DTranslationMatrixValue
            : initial2DScalingMatrixValue,
      });
    },
    validate() {
      const { getPolygon } = useScene2DStore.getState();
      const polygon = getPolygon("polygon");
      if (!polygon) return false;

      if (matrixType === "translation") {
        if (!polygon.translation) return false;
        return (
          polygon.translation[0] === inverseValues[0] &&
          polygon.translation[1] === inverseValues[1]
        );
      }

      if (!polygon.scale) return false;
      return (
        polygon.scale[0] === inverseValues[0] &&
        polygon.scale[1] === inverseValues[1]
      );
    },
  };
}

const constructInverseMatrixProps: Omit<
  ConstructInverseMatrixProps,
  "order"
>[] = [
  // Nível 1: desfazer uma translação simples
  {
    matrixType: "translation",
    appliedValues: [3, -2],
    squareCenter: [0, 0],
    squareSize: [1, 1],
  },
  // Nível 1: desfazer uma escala que encolheu o quadrado (inversa = valor maior)
  {
    matrixType: "scale",
    appliedValues: [0.5, 0.5],
    squareCenter: [0, 0],
    squareSize: [1, 1],
  },
  // Nível 2: translação com valores diferentes em cada eixo
  {
    matrixType: "translation",
    appliedValues: [-4, 1],
    squareCenter: [1, 1],
    squareSize: [1, 1],
  },
  // Nível 2: desfazer uma escala que ampliou o quadrado (inversa = fração)
  {
    matrixType: "scale",
    appliedValues: [2, 2],
    squareCenter: [0.5, 0.5],
    squareSize: [1, 1],
  },
];

export const constructInverseMatrixAssignmentList =
  constructInverseMatrixProps.map((props, index) =>
    createConstructInverseMatrixAssignment({ ...props, order: index + 1 })
  );
