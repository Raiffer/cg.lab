import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { shuffleArray } from "@/utils";
import { Vector3 } from "three";

const EPSILON = 0.001;

function vectorsAreClose(a: Vector3, b: Vector3): boolean {
  return a.distanceTo(b) < EPSILON;
}

interface InverseCandidate {
  id: string;
  /** Human-readable description shown as one of the 3 answer options. */
  label: string;
  /** What this candidate, applied to the cube's current (already
   * transformed) state, would add/multiply — NOT the absolute end state. */
  deltaTranslation: Vector3;
  deltaScale: Vector3;
}

interface MatrixInverseVisualIdentification3DProps {
  order: number;
  title?: string;
  cubeSize?: Vector3;
  originalTranslation: Vector3;
  originalScale: Vector3;
  /** Human-readable description of matrix A, for the instructions text. */
  transformDescription: string;
  appliedDeltaTranslation: Vector3;
  appliedDeltaScale: Vector3;
  /** Exactly 3 options; exactly one must be the true inverse of A. */
  candidates: InverseCandidate[];
}

function createMatrixInverseVisualIdentification3DAssignment({
  order,
  title,
  cubeSize = new Vector3(1, 1, 1),
  originalTranslation,
  originalScale,
  transformDescription,
  appliedDeltaTranslation,
  appliedDeltaScale,
  candidates,
}: MatrixInverseVisualIdentification3DProps): Assignment {
  const appliedTranslation = originalTranslation
    .clone()
    .add(appliedDeltaTranslation);
  const appliedScale = originalScale.clone().multiply(appliedDeltaScale);

  const options: TOption[] = shuffleArray(
    candidates.map(candidate => {
      const resultingTranslation = appliedTranslation
        .clone()
        .add(candidate.deltaTranslation);
      const resultingScale = appliedScale.clone().multiply(candidate.deltaScale);

      const correct =
        vectorsAreClose(resultingTranslation, originalTranslation) &&
        vectorsAreClose(resultingScale, originalScale);

      return { id: candidate.id, value: candidate.label, correct };
    })
  );

  return {
    id: `matrix-inverse-visual-identification-3d-${order}`,
    order,
    title: title || "Qual Matriz Desfaz a Transformação?",
    instructions: `A = ${transformDescription} foi aplicada ao cubo. Escolha a matriz que desfaz essa transformação (a inversa de A).`,
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "inverse-matrix",
    setup() {
      const { addCube, addObjectiveCube } = useScene3DStore.getState();
      const cube: TCube = {
        id: "cube-a",
        label: "A",
        position: new Vector3(0, cubeSize.y / 2, 0),
        size: cubeSize,
        color: "red",
        translation: appliedTranslation,
        rotation: new Vector3(0, 0, 0),
        scale: appliedScale,
      };
      addCube(cube);
      addObjectiveCube({
        ...cube,
        id: "objective-cube",
        label: "Objetivo",
        color: "yellow",
        translation: originalTranslation,
        scale: originalScale,
      });

      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("A matriz que desfaz a transformação é: {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const chosen = selectedOptions["resposta"];
      if (!chosen) return false;

      // Apply the chosen candidate to the cube regardless of correctness,
      // so the student visually sees whether it actually undoes the
      // transformation (landing back on the yellow objective cube) or not.
      const candidate = candidates.find(c => c.id === chosen.id);
      if (candidate) {
        const { getCube, updateCube } = useScene3DStore.getState();
        const cube = getCube("cube-a");
        if (cube) {
          updateCube("cube-a", {
            ...cube,
            translation: appliedTranslation.clone().add(candidate.deltaTranslation),
            scale: appliedScale.clone().multiply(candidate.deltaScale),
          });
        }
      }

      return chosen.correct;
    },
  };
}

const NO_SCALE = new Vector3(1, 1, 1);
const NO_TRANSLATION = new Vector3(0, 0, 0);

const matrixInverseVisualIdentification3DProps: Omit<
  MatrixInverseVisualIdentification3DProps,
  "order"
>[] = [
  // Nível 1: translação pura, distratores óbvios (repetir A / acertar só 1 eixo)
  {
    originalTranslation: new Vector3(0, 0, 0),
    originalScale: new Vector3(1, 1, 1),
    transformDescription: "translação (3, 2, 0)",
    appliedDeltaTranslation: new Vector3(3, 2, 0),
    appliedDeltaScale: NO_SCALE,
    candidates: [
      {
        id: "correct",
        label: "Translação (-3, -2, 0)",
        deltaTranslation: new Vector3(-3, -2, 0),
        deltaScale: NO_SCALE,
      },
      {
        id: "repeats-a",
        label: "Translação (3, 2, 0)",
        deltaTranslation: new Vector3(3, 2, 0),
        deltaScale: NO_SCALE,
      },
      {
        id: "one-axis-wrong",
        label: "Translação (-3, 2, 0)",
        deltaTranslation: new Vector3(-3, 2, 0),
        deltaScale: NO_SCALE,
      },
    ],
  },

  // Nível 2: translação nos 3 eixos, distratores mais sutis
  {
    originalTranslation: new Vector3(0, 0, 0),
    originalScale: new Vector3(1, 1, 1),
    transformDescription: "translação (-2, 4, 1)",
    appliedDeltaTranslation: new Vector3(-2, 4, 1),
    appliedDeltaScale: NO_SCALE,
    candidates: [
      {
        id: "correct",
        label: "Translação (2, -4, -1)",
        deltaTranslation: new Vector3(2, -4, -1),
        deltaScale: NO_SCALE,
      },
      {
        id: "repeats-a",
        label: "Translação (-2, 4, 1)",
        deltaTranslation: new Vector3(-2, 4, 1),
        deltaScale: NO_SCALE,
      },
      {
        id: "one-axis-wrong",
        label: "Translação (2, -4, 1)",
        deltaTranslation: new Vector3(2, -4, 1),
        deltaScale: NO_SCALE,
      },
    ],
  },

  // Nível 2: escala pura — testa que a inversa é o inverso multiplicativo, não o negativo
  {
    originalTranslation: NO_TRANSLATION,
    originalScale: new Vector3(1, 1, 1),
    transformDescription: "escala (2, 2, 2)",
    appliedDeltaTranslation: NO_TRANSLATION,
    appliedDeltaScale: new Vector3(2, 2, 2),
    candidates: [
      {
        id: "correct",
        label: "Escala (0.5, 0.5, 0.5)",
        deltaTranslation: NO_TRANSLATION,
        deltaScale: new Vector3(0.5, 0.5, 0.5),
      },
      {
        id: "repeats-a",
        label: "Escala (2, 2, 2)",
        deltaTranslation: NO_TRANSLATION,
        deltaScale: new Vector3(2, 2, 2),
      },
      {
        id: "one-axis-wrong",
        label: "Escala (0.5, 0.5, 1)",
        deltaTranslation: NO_TRANSLATION,
        deltaScale: new Vector3(0.5, 0.5, 1),
      },
    ],
  },

  // Nível 3: translação + escala combinadas — a opção certa precisa acertar as duas partes
  {
    originalTranslation: new Vector3(1, -1, 0),
    originalScale: new Vector3(1, 1, 1),
    transformDescription: "translação (2, 0, 0) e escala (1, 2, 1)",
    appliedDeltaTranslation: new Vector3(2, 0, 0),
    appliedDeltaScale: new Vector3(1, 2, 1),
    candidates: [
      {
        id: "correct",
        label: "Translação (-2, 0, 0) e escala (1, 0.5, 1)",
        deltaTranslation: new Vector3(-2, 0, 0),
        deltaScale: new Vector3(1, 0.5, 1),
      },
      {
        id: "scale-wrong",
        label: "Translação (-2, 0, 0) e escala (1, 2, 1)",
        deltaTranslation: new Vector3(-2, 0, 0),
        deltaScale: new Vector3(1, 2, 1),
      },
      {
        id: "translation-wrong",
        label: "Translação (2, 0, 0) e escala (1, 0.5, 1)",
        deltaTranslation: new Vector3(2, 0, 0),
        deltaScale: new Vector3(1, 0.5, 1),
      },
    ],
  },
];

export const matrixInverseVisualIdentification3DAssignmentList =
  matrixInverseVisualIdentification3DProps.map((props, index) =>
    createMatrixInverseVisualIdentification3DAssignment({
      ...props,
      order: index + 1,
    })
  );
