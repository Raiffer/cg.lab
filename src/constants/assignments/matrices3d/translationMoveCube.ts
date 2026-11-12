import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";

interface TranslationMoveCubeProps {
  order: number;
  title?: string;
  instructions?: string;
  initialCubeProps: Partial<TCube>;
  targetTranslation: Vector3;
}

// Dica mostrada quando a questão exige mover o cubo no eixo Y
const yAxisHint = (translation: Vector3) =>
  translation.y !== 0 ? " Segure Shift para mover no eixo Y." : "";

function createTranslationMoveCubeAssignment({
  order,
  title,
  instructions,
  initialCubeProps,
  targetTranslation,
}: TranslationMoveCubeProps): Assignment {
  return {
    assisted: false,
    id: `translation-move-cube-${order}`,
    title: title || "Mova o cubo no ambiente 3D",
    instructions:
      instructions ||
      `Aplique a translação (${targetTranslation.x}, ${targetTranslation.y}, ${targetTranslation.z}).${yAxisHint(targetTranslation)}`,
    order,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "translation",
    showObjective: false,
    setup() {
      const { addCube } = useScene3DStore.getState();

      addCube({
        id: "initial-scene-cube",
        position: initialCubeProps.position || new Vector3(0, 0, 0),
        size: initialCubeProps.size || new Vector3(0.9, 0.9, 0.9),
        scale: initialCubeProps.scale || new Vector3(1, 1, 1),
        rotation: initialCubeProps.rotation || new Vector3(0, 0, 0),
        translation: new Vector3(0, 0, 0),
        color: "white",
        opacity: 0.3,
        displayPosition: false,
      });

      addCube({
        id: "scene-cube",
        label: "A",
        position: initialCubeProps.position || new Vector3(0, 0, 0),
        size: initialCubeProps.size || new Vector3(1, 1, 1),
        scale: initialCubeProps.scale || new Vector3(1, 1, 1),
        rotation: initialCubeProps.rotation || new Vector3(0, 0, 0),
        translation: initialCubeProps.translation || new Vector3(0, 0, 0),
        color: initialCubeProps.color || "red",
        displayCustomAxes: true,
        interaction: {
          mode: "move",
          allowModeSwitch: false,
        },
      });
    },
    validate() {
      const sceneCube = useScene3DStore.getState().getCube("scene-cube");
      return sceneCube?.translation.equals(targetTranslation) ?? false;
    },
  };
}

const translationMoveCubeAssignmentsProps: TranslationMoveCubeProps[] = [
  {
    order: 1,
    title: "Mover no eixo X",
    initialCubeProps: { position: new Vector3(0, 0, 0) },
    targetTranslation: new Vector3(1, 0, 0),
  },
  {
    order: 2,
    title: "Mover no eixo Z",
    initialCubeProps: { position: new Vector3(0, 0, 0) },
    targetTranslation: new Vector3(0, 0, 2),
  },
  {
    order: 3,
    title: "Mover nos eixos X e Z",
    initialCubeProps: { position: new Vector3(0, 0, 0) },
    targetTranslation: new Vector3(2, 0, 2),
  },
  {
    order: 4,
    title: "Translação negativa nos eixos X e Z",
    initialCubeProps: { position: new Vector3(1, 0, 1) },
    targetTranslation: new Vector3(-1, 0, -1),
  },
  {
    order: 5,
    title: "Mover no eixo Y",
    initialCubeProps: { position: new Vector3(0, 0, 0) },
    targetTranslation: new Vector3(0, 2, 0),
  },
  {
    order: 6,
    title: "Mover nos três eixos",
    initialCubeProps: { position: new Vector3(0, 0, 0) },
    targetTranslation: new Vector3(2, 1, -3),
  },
  {
    order: 7,
    title: "Translação longa e negativa",
    // posição final = (-3, 0, -2)
    initialCubeProps: { position: new Vector3(3, 0, 3) },
    targetTranslation: new Vector3(-6, 0, -5),
  },
  {
    order: 8,
    title: "Translação com valores fracionários",
    initialCubeProps: { position: new Vector3(0, 0, 0) },
    targetTranslation: new Vector3(1.5, 0, -2.5),
  },
  {
    order: 9,
    title: "Descer o cubo até o chão",
    // posição final = (1, 0, 3)
    initialCubeProps: { position: new Vector3(1, 3, 1) },
    targetTranslation: new Vector3(0, -3, 2),
  },
];

export const translationMoveCubeAssignmentList =
  translationMoveCubeAssignmentsProps.map(createTranslationMoveCubeAssignment);
