import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { TetrisPiece3Type } from "@/types/TetrisPiece3d";
import { createTetrisPiece3 } from "@/utils/cube";
import { Euler, Vector3 } from "three";

type RotationAxis = "X" | "Y" | "Z";

interface RotateCubeProps {
  order: number;
  title?: string;
  instructions?: string;
  initialCubeProps?: Partial<TCube>;
  pieceType: TetrisPiece3Type;
  targetRotation: Vector3;
  initialAxis?: RotationAxis;
}

function createRotateCubeAssignment({
  order,
  title,
  instructions,
  initialCubeProps,
  pieceType,
  targetRotation,
  initialAxis = "X",
}: RotateCubeProps): Assignment {
  const pieceId = `rotate-piece-${order}`;
  const pieceCubeIds = Array.from(
    { length: 4 },
    (_, index) => `${pieceId}-${index + 1}`
  );
  const pieceOrigin =
    initialCubeProps?.position?.clone() || new Vector3(0, 0, 0);
  const initialPiecePositions = new Map<string, Vector3>();
  let selectedAxis = initialAxis;
  const initialRotation = initialCubeProps?.rotation || new Vector3(0, 0, 0);
  const axisAngles: Record<RotationAxis, number> = {
    X: initialRotation.x,
    Y: initialRotation.y,
    Z: initialRotation.z,
  };

  const getRotation = () =>
    new Vector3(axisAngles.X, axisAngles.Y, axisAngles.Z);

  const getRotatedPosition = (position: Vector3) => {
    const relativePosition = position.clone().sub(pieceOrigin);
    const rotation = getRotation();
    relativePosition.applyEuler(
      new Euler(
        (rotation.x * Math.PI) / 180,
        (rotation.y * Math.PI) / 180,
        (rotation.z * Math.PI) / 180
      )
    );
    return pieceOrigin.clone().add(relativePosition);
  };

  return {
    assisted: false,
    id: `rotate-cube-${order}`,
    title: title || "Rotacione o cubo no ambiente 3D",
    instructions:
      instructions || "Selecione o eixo e ajuste o ângulo de rotação do cubo.",
    order,
    type: AssignmentType.SLIDER,
    subjectCategory: "rotation",
    slider: {
      min: -360,
      max: 360,
      step: 5,
      initialValue: 0,
      onChange: value => {
        axisAngles[selectedAxis] = value;
        const { getCube, updateCube } = useScene3DStore.getState();
        const rotation = getRotation();

        pieceCubeIds.forEach(id => {
          const cube = getCube(id);
          const initialPosition = initialPiecePositions.get(id);
          if (!cube) return;
          updateCube(id, {
            ...cube,
            position: initialPosition
              ? getRotatedPosition(initialPosition)
              : cube.position,
            rotation,
          });
        });
      },
    },
    buttons: (["X", "Y", "Z"] as RotationAxis[]).map(axis => ({
      label: axis,
      variant: axis === initialAxis ? "default" : "outline",
      selectable: true,
      onClick: () => {
        selectedAxis = axis;
        const angle = axisAngles[axis];
        const { getCube, updateCube } = useScene3DStore.getState();
        const rotation = getRotation();
        pieceCubeIds.forEach(id => {
          const cube = getCube(id);
          const initialPosition = initialPiecePositions.get(id);
          if (!cube) return;
          updateCube(id, {
            ...cube,
            position: initialPosition
              ? getRotatedPosition(initialPosition)
              : cube.position,
            rotation,
          });
        });
        return angle;
      },
    })) as unknown as [
      {
        label: string;
        onClick: () => number | void;
        variant?: "default" | "outline";
        selectable?: boolean;
      },
      {
        label: string;
        onClick: () => number | void;
        variant?: "default" | "outline";
        selectable?: boolean;
      },
      {
        label: string;
        onClick: () => number | void;
        variant?: "default" | "outline";
        selectable?: boolean;
      },
    ],
    setup() {
      const { addCube } = useScene3DStore.getState();
      const piece = createTetrisPiece3(
        pieceId,
        initialCubeProps?.color || "red",
        initialCubeProps?.position || new Vector3(0, 0, 0),
        pieceType,
        initialCubeProps?.size || new Vector3(1, 1, 1)
      );

      piece.forEach(cube => {
        initialPiecePositions.set(cube.id, cube.position.clone());
        addCube({
          ...cube,
          scale: initialCubeProps?.scale || cube.scale,
          rotation: initialCubeProps?.rotation || cube.rotation,
          translation: initialCubeProps?.translation || cube.translation,
        });
      });
    },
    validate() {
      const { getCube } = useScene3DStore.getState();
      return pieceCubeIds.every(id =>
        getCube(id)?.rotation.equals(targetRotation)
      );
    },
  };
}

const rotateCubeAssignmentProps: RotateCubeProps[] = [
  {
    order: 1,
    title: "Rotação livre do cubo",
    pieceType: TetrisPiece3Type.T,
    targetRotation: new Vector3(90, 0, 0),
  },
];

export const rotateCubeAssignmentList = rotateCubeAssignmentProps.map(
  createRotateCubeAssignment
);
