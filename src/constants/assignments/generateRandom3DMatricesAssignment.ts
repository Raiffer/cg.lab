import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene3DStore } from "@/store/scene3DStore";
import { AssignmentType, RandomGeneratedAssignment } from "@/types/Assignment";
import { getRandomVector3 } from "@/utils";
import { Vector3 } from "three";
import {
  initial3DScalingMatrixValue,
  initial3DTranslationMatrixValue,
} from "../initial3DMatricesValues";
import { SubjectCategories } from "../defaultDailyMissions";

const COORDINATE_LIMITS = [0, 3] as [number, number];

function createMatrixAssignment({
  title,
  instructions,
  type,
  subjectCategory,
  setup,
  validate,
}: {
  title: string;
  instructions: string;
  type: AssignmentType;
  subjectCategory: SubjectCategories;
  setup: () => void;
  validate: () => boolean;
}) {
  return {
    assisted: false,
    id: "matrix-assignment",
    dimensions: "3D" as "2D" | "3D",
    order: Math.floor(Math.random() * 100),
    title,
    instructions,
    type,
    subjectCategory,
    setup,
    validate,
  };
}

export function generate3DFillInTranslationMatrixAssignment(): RandomGeneratedAssignment {
  const initialPosition = getRandomVector3(COORDINATE_LIMITS);
  const targetPosition = getRandomVector3(COORDINATE_LIMITS);

  const translationVectorAnswer = targetPosition.clone().sub(initialPosition);

  return createMatrixAssignment({
    title: "Complete a matriz de translação 3D",
    instructions: `Complete a matriz de Translação para que mova o cubo A para que fique igual ao cubo B`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "translation",
    setup: () => {
      const { addCube, addObjectiveCube, reset } = useScene3DStore.getState();
      reset();
      addCube({
        id: "cubeA",
        position: initialPosition,
        color: "blue",
        label: "A",
        translation: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
        scale: new Vector3(1, 1, 1),
        size: new Vector3(1, 1, 1),
      });
      addObjectiveCube({
        id: "cubeB",
        position: targetPosition,
        color: "red",
        label: "B",
        translation: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
        scale: new Vector3(1, 1, 1),
        size: new Vector3(1, 1, 1),
      });

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "translationMatrix",
          type: MatrixType.TRANSLATION,
          dimention: "3D",
          matrixValue: initial3DTranslationMatrixValue,
          objectRefId: "cubeA",
        },
      ]);
    },
    validate: () => {
      const { getCube } = useScene3DStore.getState();
      const { getMatrixById } = useFillBlankMatrixInputStore.getState();
      const cubeA = getCube("cubeA");
      const translationMatrix = getMatrixById("translationMatrix");
      if (!cubeA || !translationMatrix) return false;

      const isCorrect = cubeA.translation.equals(translationVectorAnswer);
      return isCorrect;
    },
  });
}

export function generate3DFillInScaleMatrixAssignment(): RandomGeneratedAssignment {
  const initialPosition = getRandomVector3(COORDINATE_LIMITS);
  const initialScale = getRandomVector3([1, 3]);
  const targetScale = getRandomVector3([1, 3]);

  return createMatrixAssignment({
    title: "Complete a matriz de escala 3D",
    instructions: `Complete a matriz de Escala para que o cubo A fique igual ao cubo B`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "scaling",
    setup() {
      const { addCube, addObjectiveCube, reset } = useScene3DStore.getState();
      reset();
      addCube({
        id: "cubeA",
        position: initialPosition,
        color: "blue",
        label: "A",
        translation: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
        scale: initialScale,
        size: new Vector3(1, 1, 1),
      });
      addObjectiveCube({
        id: "cubeB",
        position: initialPosition,
        color: "red",
        label: "B",
        translation: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
        scale: targetScale,
        size: new Vector3(1, 1, 1),
      });

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "scaleMatrix",
          type: MatrixType.SCALING,
          dimention: "3D",
          matrixValue: initial3DScalingMatrixValue,
          objectRefId: "cubeA",
        },
      ]);
    },
    validate() {
      const { getCube } = useScene3DStore.getState();
      const { getMatrixById } = useFillBlankMatrixInputStore.getState();
      const cubeA = getCube("cubeA");
      const scaleMatrix = getMatrixById("scaleMatrix");
      if (!cubeA || !scaleMatrix) return false;

      const isCorrect = cubeA.scale.equals(targetScale);
      return isCorrect;
    },
  });
}
