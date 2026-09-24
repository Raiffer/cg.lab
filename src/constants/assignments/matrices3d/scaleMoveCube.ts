import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";

interface ScaleMoveCubeProps {
  order: number;
  title?: string;
  instructions?: string;
  initialCubeProps: Partial<TCube>;
  targets: Vector3;
}

function createsScaleMoveCubeAssignment({
  order,
  title,
  instructions,
  initialCubeProps,
  targets,
}: ScaleMoveCubeProps): Assignment {
  return {
    assisted: false,
    id: `scale-move-cube-${order}`,
    title: title || "Escale o cubo no ambiente 3D",
    instructions: instructions || `Aplique a escala de ${targets.x} ao cubo.`,
    order,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "scaling",
    showObjective: false,
    setup() {
      const { addCube } = useScene3DStore.getState();
      addCube({
        id: "scene-cube",
        position: initialCubeProps.position || new Vector3(0, 0, 0),
        size: initialCubeProps.size || new Vector3(1, 1, 1),
        scale: initialCubeProps.scale || new Vector3(1, 1, 1),
        rotation: initialCubeProps.rotation || new Vector3(0, 0, 0),
        translation: initialCubeProps.translation || new Vector3(0, 0, 0),
        color: initialCubeProps.color || "red",
        displayCustomAxes: true,
        interaction: {
          mode: "scale",
          allowModeSwitch: false,
        },
      });
    },
    validate() {
      const sceneCube = useScene3DStore.getState().getCube("scene-cube");
      return sceneCube?.scale.equals(targets) ?? false;
    },
  };
}

const scaleMoveCubeAssignmentsProps: ScaleMoveCubeProps[] = [
  {
    order: 1,
    title: "Aumentar a escala para 2",
    initialCubeProps: { position: new Vector3(1, 0.5, 1) },
    targets: new Vector3(2, 2, 2),
  },
  {
    order: 2,
    title: "Reduzir a escala para 0.5",
    initialCubeProps: { position: new Vector3(0.5, 0.5, 0.5) },
    targets: new Vector3(0.5, 0.5, 0.5),
  },
  {
    order: 3,
    title: "Aumentar a escala para 3",
    initialCubeProps: { position: new Vector3(1.5, 0.5, 1.5) },
    targets: new Vector3(3, 3, 3),
  },
  {
    order: 4,
    title: "Aumentar a escala para 4",
    initialCubeProps: { position: new Vector3(2, 0.5, 2) },
    targets: new Vector3(4, 4, 4),
  },
];

export const scaleMoveCubeAssignmentList = scaleMoveCubeAssignmentsProps.map(
  createsScaleMoveCubeAssignment
);
