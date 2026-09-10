import {
  initial3DRotationMatrixXValue,
  initial3DRotationMatrixYValue,
  initial3DRotationMatrixZValue,
} from "@/constants/initial3DMatricesValues";
import { degreesToRadians } from "@/lib/utils";
import { MatrixType } from "@/store/fillInBlankMatrixInputStore";
import { useFillInMatrixWithOptionsStore } from "@/store/fillInMatrixWithOptions";
import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Matrix4, Vector3 } from "three";

interface RotationMatrixFillWithOptions3DProps {
  order: number;
  title?: string;
  instructions?: string;
  initialCubeProps: Partial<TCube>;
  rotationAxis: "X" | "Y" | "Z";
  rotationAngleInDegrees: number;
}

const mapRotationAxisToMatrixTypeAndInitialValue = {
  X: {
    type: MatrixType.ROTATION_X,
    initialValue: initial3DRotationMatrixXValue,
  },
  Y: {
    type: MatrixType.ROTATION_Y,
    initialValue: initial3DRotationMatrixYValue,
  },
  Z: {
    type: MatrixType.ROTATION_Z,
    initialValue: initial3DRotationMatrixZValue,
  },
};

const createTargetRotationFromAxisAndAngle = (
  rotationAxis: "X" | "Y" | "Z",
  rotationAngleInDegrees: number
) => {
  switch (rotationAxis) {
    case "X":
      return new Vector3(rotationAngleInDegrees, 0, 0);
    case "Y":
      return new Vector3(0, rotationAngleInDegrees, 0);
    case "Z":
      return new Vector3(0, 0, rotationAngleInDegrees);
    default:
      throw new Error("Invalid rotation axis");
  }
};

export const generateOptions = (angle: number) => {
  const radians = degreesToRadians(angle);
  const cosValue = Math.cos(radians);
  const sinValue = Math.sin(radians);

  return [
    { id: "cos-1", value: cosValue, displayValue: `cos(${angle}°)` },
    { id: "cos-2", value: cosValue, displayValue: `cos(${angle}°)` },
    { id: "sin-1", value: sinValue, displayValue: `sin(${angle}°)` },
    { id: "-sin-1", value: -sinValue, displayValue: `-sin(${angle}°)` },
    { id: "-sin-2", value: -sinValue, displayValue: `-sin(${angle}°)` },
  ];
};

function createRotationMatrixFillWithOptions3D({
  order,
  title,
  instructions,
  initialCubeProps,
  rotationAxis,
  rotationAngleInDegrees,
}: RotationMatrixFillWithOptions3DProps): Assignment {
  const targetRotation = createTargetRotationFromAxisAndAngle(
    rotationAxis,
    rotationAngleInDegrees
  );

  return {
    assisted: false,
    id: `rotation-matrix-fill-with-options-${order}`,
    title: title || "Matriz de Rotação 3D",
    instructions:
      instructions ||
      "Complete a matriz de rotação no cubo A para que fique igual ao cubo B.",
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS,
    subjectCategory: "rotation",
    setup() {
      const { addCube, addObjectiveCube } = useScene3DStore.getState();
      const cube: TCube = {
        id: "scene-cube",
        label: "A",
        position: initialCubeProps.position || new Vector3(0, 0, 0),
        size: initialCubeProps.size || new Vector3(1, 1, 1),
        scale: initialCubeProps.scale || new Vector3(1, 1, 1),
        rotation: initialCubeProps.rotation || new Vector3(0, 0, 0),
        translation: initialCubeProps.translation || new Vector3(0, 0, 0),
        color: initialCubeProps.color || "red",
        displayCustomAxes: true,
      };
      addCube(cube);
      addObjectiveCube({
        ...cube,
        id: "objective-scene-cube",
        label: "B",
        rotation: targetRotation,
        color: "yellow",
      });

      const { setMatrix, setOptions } =
        useFillInMatrixWithOptionsStore.getState();
      setMatrix({
        id: "rotation-matrix-y",
        type: mapRotationAxisToMatrixTypeAndInitialValue[rotationAxis].type,
        dimention: "3D",
        matrixValue:
          mapRotationAxisToMatrixTypeAndInitialValue[rotationAxis].initialValue,
        objectRefId: cube.id,
      });

      const options = generateOptions(rotationAngleInDegrees);
      setOptions(options);
    },
    validate() {
      const { getCube } = useScene3DStore.getState();
      const sceneCube = getCube("scene-cube");
      if (!sceneCube) return false;
      if (
        !sceneCube.customXRotationMatrix &&
        !sceneCube.customYRotationMatrix &&
        !sceneCube.customZRotationMatrix
      )
        return false;

      const rotationAxisVector = createTargetRotationFromAxisAndAngle(
        rotationAxis,
        1
      );
      const rotationAngleInRadians = degreesToRadians(rotationAngleInDegrees);
      const expectedRotationMatrix = new Matrix4().makeRotationAxis(
        rotationAxisVector,
        rotationAngleInRadians
      );

      if (rotationAxis === "X" && sceneCube.customXRotationMatrix) {
        return expectedRotationMatrix.equals(sceneCube.customXRotationMatrix);
      } else if (rotationAxis === "Y" && sceneCube.customYRotationMatrix) {
        return expectedRotationMatrix.equals(sceneCube.customYRotationMatrix);
      } else if (rotationAxis === "Z" && sceneCube.customZRotationMatrix) {
        return expectedRotationMatrix.equals(sceneCube.customZRotationMatrix);
      }
      return false;
    },
  };
}

const rotationMatrixFillWithOptions3DAssignmentProps: RotationMatrixFillWithOptions3DProps[] =
  [
    {
      order: 1,
      title: "Complete a matriz de rotação no eixo Y",
      initialCubeProps: {
        position: new Vector3(0, 0, 0),
      },
      rotationAxis: "Y",
      rotationAngleInDegrees: 45,
    },
    {
      order: 2,
      title: "Rotação com ângulo negativo no eixo Y",
      initialCubeProps: {
        position: new Vector3(0, 0, 0),
      },
      rotationAxis: "Y",
      rotationAngleInDegrees: -45,
    },
    {
      order: 3,
      title: "Complete a matriz de rotação no eixo Y com ângulo 90°",
      initialCubeProps: {
        position: new Vector3(0, 0, 0),
      },
      rotationAxis: "Y",
      rotationAngleInDegrees: 90,
    },
  ];

export const rotationMatrixFillWithOptions3DAssignmentList =
  rotationMatrixFillWithOptions3DAssignmentProps.map(
    createRotationMatrixFillWithOptions3D
  );
