import { useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";
import { isCubeInsidePerspectiveProjection } from "@/lib/perspective-projection";

interface PerspectiveAssignmentGoal {
  name: string;
  cubePosition: Vector3;
  color: string;
}

interface PerspectiveAssignmentProps {
  order: number;
  title?: string;
  instructions?: string;
  goals: PerspectiveAssignmentGoal[];
}

interface SinglePerspectiveAssignmentProps
  extends Omit<PerspectiveAssignmentProps, "goals"> {
  goal: PerspectiveAssignmentGoal;
}

const initialVolumePosition = new Vector3(0, 3, -8);
const projectionNear = 21;
const projectionFar = 55;
const projectionLeft = -5;
const projectionRight = 5;
const projectionBottom = -2;
const projectionTop = 3;

function createPerspectiveAssignment({
  order,
  title,
  instructions,
  goal,
}: SinglePerspectiveAssignmentProps): Assignment {
  const cubeId = `projection-perspective-v2-cube-${order}`;
  const volumeId = `projection-perspective-v2-volume-${order}`;
  const assignmentId =
    order === 3
      ? "projection-perspective-v2"
      : `projection-perspective-v2-${order}`;
  const cubeSize = new Vector3(1, 1, 1);

  return {
    id: assignmentId,
    order,
    title: title ?? "Projeção em perspectiva V2",
    instructions:
      instructions ??
      `Use os handles para redimensionar o volume de projeção até que o cubo ${goal.name} fique completamente visível dentro dele.`,
    assisted: false,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "projection",
    projectionMode: "perspective",
    setup() {
      const { addCube, addPerspectiveCubeFromBounds } =
        useScene3DStore.getState();

      addCube({
        id: cubeId,
        position: goal.cubePosition.clone(),
        size: cubeSize.clone(),
        color: goal.color,
        translation: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
        scale: new Vector3(1, 1, 1),
      });

      addPerspectiveCubeFromBounds(
        {
          id: volumeId,
          position: initialVolumePosition.clone(),
          color: "#38bdf8",
        },
        projectionNear,
        projectionFar,
        projectionLeft,
        projectionRight,
        projectionBottom,
        projectionTop
      );
    },
    validate() {
      const projectionCube = useScene3DStore
        .getState()
        .projectionCubes.perspective.find(cube => cube.id === volumeId);
      if (!projectionCube?.perspectiveProjection) return false;

      return isCubeInsidePerspectiveProjection(
        goal.cubePosition,
        cubeSize,
        projectionCube.perspectiveProjection,
        projectionCube.position.clone().add(projectionCube.translation)
      );
    },
  };
}

function createPerspectiveAssignments({
  order,
  title,
  instructions,
  goals,
}: PerspectiveAssignmentProps): Assignment[] {
  return goals.map((goal, index) =>
    createPerspectiveAssignment({
      order: order + index,
      title,
      instructions,
      goal,
    })
  );
}

const perspectiveAssignmentGoals: PerspectiveAssignmentGoal[] = [
  {
    name: "vermelho",
    cubePosition: new Vector3(10, 3, -8),
    color: "red",
  },
  {
    name: "amarelo",
    cubePosition: new Vector3(-10, 3, -8),
    color: "yellow",
  },
  {
    name: "verde",
    cubePosition: new Vector3(0, 9, -8),
    color: "green",
  },
];

export const perspectiveAssignmentV2AssignmentList =
  createPerspectiveAssignments({
    order: 3,
    goals: perspectiveAssignmentGoals,
  });

export const perspectiveAssignmentV2 = perspectiveAssignmentV2AssignmentList[0];
