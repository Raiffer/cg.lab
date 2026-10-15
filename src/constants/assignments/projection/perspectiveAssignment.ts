import { useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";

export const perspectiveAssignment: Assignment = {
  id: "projection-perspective",
  order: 2,
  title: "Projeção em perspectiva (placeholder)",
  instructions: "Placeholder para a configuração de projeção em perspectiva.",
  assisted: false,
  type: AssignmentType.INTERACTIVE,
  subjectCategory: "projection",
  projectionMode: "perspective",
  setup() {
    const { addCube, addPerspectiveCube } = useScene3DStore.getState();

    addCube({
      id: "projection-test-red-cube",
      position: new Vector3(-2, 1, -5),
      size: new Vector3(1.5, 1.5, 1.5),
      color: "red",
      translation: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0),
      scale: new Vector3(1, 1, 1),
    });

    addCube({
      id: "projection-test-yellow-cube",
      position: new Vector3(1, 1.75, 6),
      size: new Vector3(1, 1, 1),
      color: "yellow",
      translation: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0),
      scale: new Vector3(1, 1, 1),
    });

    addPerspectiveCube(
      {
        id: "projection-perspective-cube",
        position: new Vector3(0, 3, 0),
        color: "#38bdf8",
      },
      19,
      40,
      15
    );
  },
  validate: () => false,
};
