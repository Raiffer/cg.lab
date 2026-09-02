import { initial3DTranslationMatrixValue } from "@/constants/initial3DMatricesValues";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";

interface TranslationMatrixFillInput3DProps {
  order: number;
  title?: string;
  instructions?: string;
  initialCubeProps: Partial<TCube>;
  targetTranslation: Vector3;
}

function createTranslationMatrixFillInput3D({
  order,
  title,
  instructions,
  initialCubeProps,
  targetTranslation,
}: TranslationMatrixFillInput3DProps): Assignment {
  return {
    assisted: false,
    id: `translation-matrix-fill-input-${order}`,
    title: title || "Matriz de Translação 3D",
    instructions:
      instructions ||
      "Altere a matriz de translação no cubo A para que fique igual ao cubo B.",
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "translation-matrix",
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
        translation: targetTranslation,
        color: "yellow",
      });

      const { addMatrix } = useFillBlankMatrixInputStore.getState();
      addMatrix({
        id: `translation-matrix-3d`,
        dimention: "3D",
        type: MatrixType.TRANSLATION,
        objectRefId: cube.id,
        matrixValue: initial3DTranslationMatrixValue,
      });
    },
    validate() {
      const { getCube } = useScene3DStore.getState();
      const sceneCube = getCube("scene-cube");
      if (!sceneCube) return false;

      const isCorrect = sceneCube.translation.equals(targetTranslation);

      return isCorrect;
    },
  };
}

const translationMatrixFillInput3DAssignmentsProps: TranslationMatrixFillInput3DProps[] =
  [
    {
      order: 1,
      title: "Movendo no eixo X",
      initialCubeProps: { position: new Vector3(0, 0.5, 0) },
      targetTranslation: new Vector3(1, 0, 0),
    },
    {
      order: 2,
      title: "Movendo no eixo Z",
      initialCubeProps: { position: new Vector3(0, 0.5, 0) },
      targetTranslation: new Vector3(0, 0, 2),
    },
    {
      order: 3,
      title: "Movendo no eixo Y",
      initialCubeProps: { position: new Vector3(0, 0.5, 0) },
      targetTranslation: new Vector3(0, 1, 0),
    },
    {
      order: 4,
      title: "Translação negativa no eixo X",
      initialCubeProps: { position: new Vector3(1, 0, 0) },
      targetTranslation: new Vector3(-1, 0, 0),
    },
    {
      order: 5,
      title: "Translação negativa no eixo X e Y",
      initialCubeProps: { position: new Vector3(1, 1, 0) },
      targetTranslation: new Vector3(-1, -1, 0),
    },
    {
      order: 6,
      title: "Movendo para a origem",
      initialCubeProps: { position: new Vector3(0, -0.5, 0) },
      targetTranslation: new Vector3(0, 0.5, 0),
    },
    {
      order: 7,
      title: "Translação em todos os eixos",
      initialCubeProps: { position: new Vector3(0, 0, 0) },
      targetTranslation: new Vector3(2, 0.5, 2),
    },
  ];

export const translationMatrixFillInput3DAssignmentList =
  translationMatrixFillInput3DAssignmentsProps.map(
    createTranslationMatrixFillInput3D
  );
