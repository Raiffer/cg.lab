import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";

interface ScaleMoveCubeProps {
  order: number;
  title?: string;
  instructions?: string;
  showGoal?: boolean;
  initialPosition: Vector3;
  initialSize: Vector3;
  targetTranslation: Vector3;
  targetScale: Vector3;
}

// Remove ruído de ponto flutuante (ex.: 2.0000000000000004, -0)
const cleanVector = (v: Vector3) => {
  const snap = (n: number) => {
    const rounded = Math.round(n * 1e6) / 1e6;
    return Object.is(rounded, -0) ? 0 : rounded;
  };
  return new Vector3(snap(v.x), snap(v.y), snap(v.z));
};

function createsScaleMoveCubeAssignment({
  order,
  title,
  instructions,
  showGoal,
  initialPosition,
  initialSize,
  targetTranslation,
  targetScale,
}: ScaleMoveCubeProps): Assignment {
  // ---------------------------------------------------------------------
  // CUBO-OBJETIVO: única fonte de verdade do alvo.
  // posição = p0 · S   e   translação = t_alvo
  // (posição visível = posição + translação). O ShowGoal e o validate()
  // usam este mesmo cubo, então o que é desenhado e o que é validado
  // nunca divergem.
  // ---------------------------------------------------------------------
  const goalCube: TCube = {
    id: "objective-scene-cube",
    position: initialPosition.clone().multiply(targetScale),
    size: initialSize.clone(),
    scale: targetScale.clone(),
    rotation: new Vector3(0, 0, 0),
    translation: targetTranslation.clone(),
    color: "white",
    opacity: 0.5,
  };

  const goalWorldPosition = goalCube.position.clone().add(goalCube.translation);

  return {
    assisted: false,
    id: `scale-move-cube-${order}`,
    title: title || "Escale o cubo no ambiente 3D",
    instructions:
      instructions ||
      `Aplique a escala de ${targetScale.x} e a translação (${targetTranslation.x}, ${targetTranslation.y}, ${targetTranslation.z}) ao cubo.`,
    order,
    type: AssignmentType.SLIDER,
    subjectCategory: "scaling",
    showObjective: true,
    slider: {
      min: 0.5,
      max: 5,
      step: 0.5,
      initialValue: 1,
      onChange: value => {
        const store = useScene3DStore.getState();
        const sceneCube = store.getCube("scene-cube");
        if (!sceneCube) return;

        // Escala atual real do cubo na cena (evita manter estado paralelo)
        const currentScale = sceneCube.scale.x;
        const ratio = value / currentScale;

        // A escala atua em torno da origem do mundo e, portanto, sobre a
        // posição visível inteira (position + translation):
        //   position    = p0 · S
        //   translation = translation · (S_nova / S_antiga)
        // Assim, um cubo cuja posição visível é (0,0,0) permanece na origem,
        // e um cubo fora da origem se afasta/aproxima dela proporcionalmente.
        store.updateCube("scene-cube", {
          ...sceneCube,
          position: cleanVector(initialPosition.clone().multiplyScalar(value)),
          translation: cleanVector(
            sceneCube.translation.clone().multiplyScalar(ratio)
          ),
          scale: new Vector3(value, value, value),
        });
      },
    },
    setup() {
      const { addCube, addObjectiveCube } = useScene3DStore.getState();

      addCube({
        id: "scene-cube",
        position: initialPosition.clone(),
        size: initialSize.clone(),
        scale: new Vector3(1, 1, 1),
        rotation: new Vector3(0, 0, 0),
        translation: new Vector3(0, 0, 0),
        color: "red",
        displayCustomAxes: true,
        interaction: { mode: "move", allowModeSwitch: false },
      });

      if (showGoal) {
        addObjectiveCube({
          ...goalCube,
          position: goalCube.position.clone(),
          size: goalCube.size.clone(),
          scale: goalCube.scale.clone(),
          rotation: goalCube.rotation.clone(),
          translation: goalCube.translation.clone(),
        });
      }
    },
    validate() {
      const sceneCube = useScene3DStore.getState().getCube("scene-cube");
      if (!sceneCube) return false;

      const currentWorldPosition = sceneCube.position
        .clone()
        .add(sceneCube.translation);

      // Tolerância em vez de igualdade exata: a translação agora é reescalada
      // a cada mudança do slider e pode carregar pequenos erros numéricos.
      const EPSILON = 0.01;

      return (
        sceneCube.scale.distanceTo(targetScale) < EPSILON &&
        sceneCube.translation.distanceTo(targetTranslation) < EPSILON &&
        currentWorldPosition.distanceTo(goalWorldPosition) < EPSILON
      );
    },
  };
}

// Os alvos assumem a ordem "escala, depois translada":
//   posição final = S · p0 + t
// Se o aluno transladar primeiro e escalar depois, a translação também é
// escalada: posição final = S · (p0 + t'), com t' = t / S.
const scaleMoveCubeAssignmentsProps: ScaleMoveCubeProps[] = [
  {
    order: 1,
    title: "Aumentar a escala para 2",
    initialPosition: new Vector3(-3, 0, -4),
    initialSize: new Vector3(1, 1, 1),
    targetTranslation: new Vector3(3, 0, 4),
    targetScale: new Vector3(2, 2, 2),
    showGoal: true,
  },
  {
    order: 2,
    title: "Reduzir a escala para 0.5",
    initialPosition: new Vector3(0, 2, 0),
    initialSize: new Vector3(1, 1, 1),
    targetTranslation: new Vector3(2, 2, 3),
    targetScale: new Vector3(0.5, 0.5, 0.5),
    showGoal: true,
  },
  {
    order: 3,
    title: "Aumentar a escala para 3",
    initialPosition: new Vector3(1.5, 0.5, -3),
    initialSize: new Vector3(1, 1, 1),
    targetTranslation: new Vector3(0, 0, 0),
    targetScale: new Vector3(3, 3, 3),
    showGoal: true,
  },
  {
    order: 4,
    title: "Aumentar a escala para 4",
    initialPosition: new Vector3(2, 0.5, 2),
    initialSize: new Vector3(1, 1, 1),
    targetTranslation: new Vector3(-7, 0, -3),
    targetScale: new Vector3(4, 4, 4),
    showGoal: true,
  },
  {
    order: 5,
    title: "Aumentar a escala para 3.5",
    initialPosition: new Vector3(1.5, 0.5, -1.5),
    initialSize: new Vector3(1, 1, 1),
    targetTranslation: new Vector3(0, 0, 0),
    targetScale: new Vector3(3.5, 3.5, 3.5),
    showGoal: true,
  },
];

export const scaleMoveCubeAssignmentList = scaleMoveCubeAssignmentsProps.map(
  createsScaleMoveCubeAssignment
);