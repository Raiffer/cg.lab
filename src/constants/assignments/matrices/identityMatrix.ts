import { initial2DIdentityMatrixValue } from "@/constants/inicial2DMatricesValues";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { generateTrianglePoints, TriangleType } from "@/utils";
import { createSquare } from "@/utils/polygon";

interface IdentityMatrixAssignmentProps {
  order: number;
  title?: string;
  instructions?: string;
  shape:
    | { type: "square"; center: [number, number]; size: [number, number] }
    | {
        type: "triangle";
        center: [number, number];
        triangleType: TriangleType;
        size: number;
      };
  /** When false, no ghost of the (unchanged) target shape is shown — the
   * student must rely on the definition of the identity matrix, not on
   * visually matching an overlay. Used to raise the difficulty. */
  showObjective: boolean;
}

function createIdentityMatrixAssignment({
  order,
  title,
  instructions,
  shape,
  showObjective,
}: IdentityMatrixAssignmentProps): Assignment {
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

  return {
    id: `identity-matrix-${order}`,
    order,
    title: title || "Matriz Identidade",
    instructions:
      instructions ||
      (showObjective
        ? "Preencha a matriz que não altera o objeto (ele deve ficar sobre o contorno tracejado)."
        : "Preencha a matriz identidade — a que não altera nenhum objeto."),
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "identity-matrix",
    setup() {
      const { addPolygon, setObjectivePolygons } = useScene2DStore.getState();
      addPolygon(polygon);
      if (showObjective) {
        setObjectivePolygons([
          { ...polygon, id: "target-polygon", color: "green" },
        ]);
      }

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "identity-matrix",
          polygonRefId: "polygon",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: initial2DIdentityMatrixValue,
        },
      ]);
    },
    validate() {
      const { getMatrixById } = useFillBlankMatrixInputStore.getState();
      const matrix = getMatrixById("identity-matrix");
      if (!matrix) return false;

      const a = Number(matrix.matrixValue[0][0].value);
      const b = Number(matrix.matrixValue[0][1].value);
      const c = Number(matrix.matrixValue[1][0].value);
      const d = Number(matrix.matrixValue[1][1].value);

      return a === 1 && b === 0 && c === 0 && d === 1;
    },
  };
}

const identityMatrixProps: Omit<IdentityMatrixAssignmentProps, "order">[] = [
  // Nível 1: quadrado na origem, objetivo visível
  {
    shape: { type: "square", center: [0, 0], size: [2, 2] },
    showObjective: true,
  },
  // Nível 1: quadrado fora da origem, ainda com objetivo visível
  {
    shape: { type: "square", center: [2, 1], size: [1.5, 1.5] },
    showObjective: true,
  },
  // Nível 2: generaliza para um triângulo
  {
    shape: {
      type: "triangle",
      center: [-1, -1],
      triangleType: "equilateral",
      size: 2,
    },
    showObjective: true,
  },
  // Nível 3: sem objetivo visual — exige conhecer a definição de memória
  {
    shape: { type: "square", center: [1, 2], size: [1, 1] },
    showObjective: false,
  },
  {
    shape: {
      type: "triangle",
      center: [0, 0],
      triangleType: "isosceles",
      size: 2,
    },
    showObjective: false,
  },
];

export const identityMatrixAssignmentList = identityMatrixProps.map(
  (props, index) =>
    createIdentityMatrixAssignment({ ...props, order: index + 1 })
);
