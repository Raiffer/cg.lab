import { useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";

export const parallelAssignment: Assignment = {
  id: "projection-parallel",
  order: 1,
  title: "Projeção paralela",
  instructions: "Observe a projeção paralela dos objetos dentro do volume.",
  assisted: false,
  type: AssignmentType.INTERACTIVE,
  subjectCategory: "projection",
  projectionMode: "parallel",
  setup() {
    const { addCube, addProjectionCube } = useScene3DStore.getState();

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

    addProjectionCube("parallel", {
      id: "projection-parallel-cube",
      position: new Vector3(0, 3, 0),
      size: new Vector3(16, 8, 17),
      color: "#38bdf8",
      translation: new Vector3(0, 0, 0),
      scale: new Vector3(1, 1, 1),
    });
  },
  validate: () => false,
};
