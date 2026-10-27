import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { generateTrianglePoints, TriangleType } from "@/utils";
import { createSquare } from "@/utils/polygon";
import {
  applyTransformationsToPolygon,
  create2DScaleMatrix,
} from "@/utils/matrix";

// Small tolerance because the exact scalar for most area ratios is irrational
// (k = sqrt(areaMultiplier)) — the student cannot type infinite decimal places.
const SCALAR_TOLERANCE = 0.02;

interface ScaleForDoubleAreaAssignmentProps {
  order: number;
  title?: string;
  areaMultiplier: number;
  shape:
    | { type: "square"; center: [number, number]; size: [number, number] }
    | {
        type: "triangle";
        center: [number, number];
        triangleType: TriangleType;
        size: number;
      };
}

function createScaleForDoubleAreaAssignment({
  order,
  title,
  areaMultiplier,
  shape,
}: ScaleForDoubleAreaAssignmentProps): Assignment {
  const polygon =
    shape.type === "square"
      ? createSquare("polygon", "blue", shape.center, shape.size)
      : {
          id: "polygon",
          color: "blue",
          points: generateTrianglePoints(
            shape.center,
            shape.triangleType,
            shape.size
          ).map((point, index) => ({
            id: `polygon-${String.fromCharCode(65 + index)}`,
            position: point,
            movable: false,
          })),
        };

  const targetScalar = Math.sqrt(areaMultiplier);
  const targetPolygon = applyTransformationsToPolygon(polygon, [
    create2DScaleMatrix(targetScalar, targetScalar),
  ]);

  const areaWord =
    areaMultiplier === 2
      ? "dobre"
      : areaMultiplier === 3
        ? "triplique"
        : `fique ${areaMultiplier}x maior`;

  return {
    id: `scale-for-double-area-${order}`,
    order,
    title: title || "Escalar que Altera a Área",
    instructions: `Preencha o mesmo k na diagonal para que a área ${areaWord}, sem distorcer a forma. Dica: k = √${areaMultiplier}.`,
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "scaling",
    setup() {
      const { addPolygon, setObjectivePolygons } = useScene2DStore.getState();
      addPolygon(polygon);
      setObjectivePolygons([
        { ...targetPolygon, id: "target-polygon", color: "green" },
      ]);

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "scale-matrix",
          polygonRefId: "polygon",
          type: MatrixType.SCALING,
          dimention: "2D",
          matrixValue: [
            [
              { value: "", editable: true },
              { value: 0, editable: false },
              { value: 0, editable: false },
            ],
            [
              { value: 0, editable: false },
              { value: "", editable: true },
              { value: 0, editable: false },
            ],
            [
              { value: 0, editable: false },
              { value: 0, editable: false },
              { value: 1, editable: false },
            ],
          ],
        },
      ]);
    },
    validate() {
      const { getPolygon } = useScene2DStore.getState();
      const polygonInScene = getPolygon("polygon");
      if (!polygonInScene || !polygonInScene.scale) return false;

      const [sx, sy] = polygonInScene.scale;
      const isUniform = Math.abs(sx - sy) < SCALAR_TOLERANCE;
      const isCorrectMagnitude =
        Math.abs(sx - targetScalar) < SCALAR_TOLERANCE &&
        Math.abs(sy - targetScalar) < SCALAR_TOLERANCE;

      return isUniform && isCorrectMagnitude;
    },
  };
}

const scaleForDoubleAreaProps: Omit<
  ScaleForDoubleAreaAssignmentProps,
  "order"
>[] = [
  // Nível 1 (aquecimento): fator de área "redondo" (k = 2), para fixar a relação k² = fator de área
  {
    areaMultiplier: 4,
    shape: { type: "square", center: [0, 0], size: [1, 1] },
  },
  // Nível 2: o caso pedido — dobrar a área mantendo a forma (k = √2)
  {
    areaMultiplier: 2,
    shape: { type: "square", center: [0, 0], size: [1, 1] },
  },
  // Nível 2: mesmo conceito, quadrado fora da origem
  {
    areaMultiplier: 2,
    shape: { type: "square", center: [1.5, 1], size: [1, 1] },
  },
  // Nível 3: generaliza para um triângulo
  {
    areaMultiplier: 2,
    shape: {
      type: "triangle",
      center: [-1, 0],
      triangleType: "equilateral",
      size: 2,
    },
  },
];

export const scaleForDoubleAreaAssignmentList = scaleForDoubleAreaProps.map(
  (props, index) =>
    createScaleForDoubleAreaAssignment({ ...props, order: index + 1 })
);
