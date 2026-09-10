import {
  initial3DRotationMatrixXValue,
  initial3DRotationMatrixYValue,
  initial3DRotationMatrixZValue,
} from "@/constants/initial3DMatricesValues";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";

interface RotationMatrixFillInput3DProps {
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

function createRotationMatrixFillInput3D({
  order,
  title,
  instructions,
  initialCubeProps,
  rotationAxis,
  rotationAngleInDegrees,
}: RotationMatrixFillInput3DProps): Assignment {
  const targetRotation = createTargetRotationFromAxisAndAngle(
    rotationAxis,
    rotationAngleInDegrees
  );

  return {
    assisted: false,
    id: `rotation-matrix-fill-input-${order}`,
    title: title || "Matriz de Rotação 3D",
    instructions:
      instructions ||
      "Altere a matriz de rotação no cubo A para que fique igual ao cubo B.",
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
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
      };
      addCube(cube);
      addObjectiveCube({
        ...cube,
        id: "objective-scene-cube",
        label: "B",
        rotation: targetRotation,
        color: "yellow",
      });

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: `translation-matrix-3d`,
        dimention: "3D",
        type: mapRotationAxisToMatrixTypeAndInitialValue[rotationAxis].type,
        objectRefId: cube.id,
        matrixValue:
          mapRotationAxisToMatrixTypeAndInitialValue[rotationAxis].initialValue,
      });
    },
    validate() {
      const { getCube } = useScene3DStore.getState();
      const sceneCube = getCube("scene-cube");
      if (!sceneCube) return false;

      const isCorrect = sceneCube.rotation.equals(targetRotation);

      return isCorrect;
    },
  };
}

const rotationMatrixFillInput3DAssignmentProps: RotationMatrixFillInput3DProps[] =
  [
    {
      order: 1,
      title: "Matriz de Rotação 3D no eixo Y",
      instructions:
        "Altere a matriz de rotação no eixo Y para que transforme o cubo A no cubo B.",
      initialCubeProps: {
        position: new Vector3(0, 0, 0),
      },
      rotationAxis: "Y",
      rotationAngleInDegrees: 45,
    },
    {
      order: 2,
      title: "Rotação negativa no eixo Y",
      instructions:
        "Altere a matriz de rotação no eixo Y para que transforme o cubo A no cubo B.",
      initialCubeProps: {
        position: new Vector3(0, 0, 0),
      },
      rotationAxis: "Y",
      rotationAngleInDegrees: -45,
    },
    {
      order: 3,
      title: "Matriz de Rotação 3D no eixo X",
      instructions:
        "Altere a matriz de rotação no eixo X para que transforme o cubo A no cubo B.",
      initialCubeProps: {
        position: new Vector3(0, 0, 0),
      },
      rotationAxis: "X",
      rotationAngleInDegrees: 45,
    },
    {
      order: 4,
      title: "Rotação negativa no eixo X",
      instructions:
        "Altere a matriz de rotação no eixo X para que transforme o cubo A no cubo B.",
      initialCubeProps: {
        position: new Vector3(0, 0, 0),
      },
      rotationAxis: "X",
      rotationAngleInDegrees: -45,
    },
    {
      order: 5,
      title: "Matriz de Rotação 3D no eixo Z",
      instructions:
        "Altere a matriz de rotação no eixo Z para que transforme o cubo A no cubo B.",
      initialCubeProps: {
        position: new Vector3(0, 0, 0),
      },
      rotationAxis: "Z",
      rotationAngleInDegrees: 45,
    },
  ];

export const rotationMatrixFillInput3DAssignmentList =
  rotationMatrixFillInput3DAssignmentProps.map(rotationMatrixFillInput3DProps =>
    createRotationMatrixFillInput3D(rotationMatrixFillInput3DProps)
  );
