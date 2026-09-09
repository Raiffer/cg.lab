import { initial2DScalingMatrixValue } from "@/constants/inicial2DMatricesValues";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

interface ApplyScaleMatrixToPointProps {
  order: number;
  initialPosition: [number, number];
  goalScale: [number, number];
}

function createApplyScaleMatrix2DAssignment({
  order,
  initialPosition,
  goalScale,
}: ApplyScaleMatrixToPointProps): Assignment {
  return {
    assisted: false,
    id: `apply-scale-matrix-to-point-2d-${order}`,
    title: "Aplique a Matriz de Escala",
    instructions: `Mova o ponto A(${initialPosition[0]}, ${initialPosition[1]}) para a posição resultante após a aplicação da matriz de escala.`,
    order,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "scaling",
    setup: () => {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A",
          label: "A",
          position: initialPosition,
          movable: true,
          color: "red",
        },
      ]);

      const newMatrixValue = initial2DScalingMatrixValue;
      newMatrixValue[0][0].value = goalScale[0];
      newMatrixValue[0][0].editable = false;
      newMatrixValue[1][1].value = goalScale[1];
      newMatrixValue[1][1].editable = false;

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "scaleMatrix",
          type: MatrixType.SCALING,
          dimention: "2D",
          matrixValue: newMatrixValue,
        },
      ]);
    },
    validate: () => {
      const { getPoint } = useScene2DStore.getState();
      const point = getPoint("A");
      if (!point) return false;

      const transformedPoint = [
        initialPosition[0] * goalScale[0],
        initialPosition[1] * goalScale[1],
      ];

      const isCorrect =
        point.position[0] === transformedPoint[0] &&
        point.position[1] === transformedPoint[1];

      return isCorrect;
    },
  };
}

const applyScaleMatrixToPointAssignmentProps: ApplyScaleMatrixToPointProps[] = [
  {
    order: 1,
    initialPosition: [0, 0],
    goalScale: [2, 3],
  },
  {
    order: 2,
    initialPosition: [1, 1],
    goalScale: [2, 2],
  },
  {
    order: 3,
    initialPosition: [1, 1],
    goalScale: [-1, 1],
  },
  {
    order: 4,
    initialPosition: [1, 1],
    goalScale: [1, -1],
  },
  {
    order: 5,
    initialPosition: [1, 1],
    goalScale: [-1, -1],
  },
];

export const applyScaleMatrixToPointAssignmentList: Assignment[] =
  applyScaleMatrixToPointAssignmentProps.map(props =>
    createApplyScaleMatrix2DAssignment(props)
  );
