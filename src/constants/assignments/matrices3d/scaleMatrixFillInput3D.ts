import { initial3DScalingMatrixValue } from "@/constants/initial3DMatricesValues";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";

interface ScaleMatrixFillInput3DProps {
  order: number;
  title?: string;
  instructions?: string;
  initialCubeProps: Partial<TCube>;
  targetScale: Vector3;
}

function createScaleMatrixFillInput3D({
  order,
  title,
  instructions,
  initialCubeProps,
  targetScale,
}: ScaleMatrixFillInput3DProps): Assignment {
  return {
    assisted: false,
    id: `scale-matrix-fill-input-${order}`,
    title: title || "Matriz de Escala 3D",
    instructions:
      instructions ||
      "Altere a matriz de escala no cubo A para que fique igual ao cubo B.",
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "scaling-matrix",
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
        scale: targetScale,
        color: "yellow",
      });

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: `translation-matrix-3d`,
        dimention: "3D",
        type: MatrixType.SCALING,
        objectRefId: cube.id,
        matrixValue: initial3DScalingMatrixValue,
      });
    },
    validate() {
      const { getCube } = useScene3DStore.getState();
      const sceneCube = getCube("scene-cube");
      if (!sceneCube) return false;

      const isCorrect = sceneCube.scale.equals(targetScale);

      return isCorrect;
    },
  };
}

const scaleMatrixFillInput3DAssignmentsProps: ScaleMatrixFillInput3DProps[] = [
  {
    order: 1,
    title: "Escala uniforme na origem",
    initialCubeProps: {
      position: new Vector3(0.5, 0, 0.5),
      size: new Vector3(0.5, 0.5, 0.5),
    },
    targetScale: new Vector3(2, 2, 2),
  },
  {
    order: 2,
    title: "Escala não uniforme no eixo X",
    initialCubeProps: {
      position: new Vector3(0.5, 0, 0.5),
      size: new Vector3(0.5, 0.5, 0.5),
    },
    targetScale: new Vector3(2, 1, 1),
  },
  {
    order: 3,
    title: "Escala não uniforme no eixo Y",
    initialCubeProps: {
      position: new Vector3(0.5, 0, 0.5),
      size: new Vector3(0.5, 0.5, 0.5),
    },
    targetScale: new Vector3(1, 2, 1),
  },
  {
    order: 4,
    title: "Escala não uniforme no eixo Z",
    initialCubeProps: {
      position: new Vector3(0.5, 0, 0.5),
      size: new Vector3(0.5, 0.5, 0.5),
    },
    targetScale: new Vector3(1, 1, 2),
  },
  {
    order: 5,
    title: "Redução de tamanho no eixo Y",
    initialCubeProps: {
      position: new Vector3(0.5, 0, 0.5),
      size: new Vector3(1, 1, 1),
    },
    targetScale: new Vector3(1, 0.5, 1),
  },
];

export const scaleMatrixFillInput3DAssignmentList =
  scaleMatrixFillInput3DAssignmentsProps.map(createScaleMatrixFillInput3D);
