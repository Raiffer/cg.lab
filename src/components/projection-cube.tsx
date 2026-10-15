import { Edges } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import {
  type ProjectionMode,
  type TProjectionCube,
  useScene3DStore,
} from "@/store/scene3DStore";
import { useRef } from "react";
import { BufferGeometry, DoubleSide, Plane, Vector3 } from "three";

type ResizeAxis = "x" | "y" | "z";

export interface ProjectionCubeResizeContext {
  cube: TProjectionCube;
  axis: ResizeAxis;
  side: -1 | 1;
  faceDelta: number;
  fixedFace: number;
  movingFace: number;
  startPosition: Vector3;
  startSize: Vector3;
  resizeProjectionCube: (
    mode: ProjectionMode,
    id: string,
    size: Vector3,
    position: Vector3,
    perspectiveProjection?: TProjectionCube["perspectiveProjection"]
  ) => void;
}

interface ProjectionCubeProps {
  cube: TProjectionCube;
  mode: ProjectionMode;
  interactive?: boolean;
  onDraggingChange?: (dragging: boolean) => void;
  geometry?: BufferGeometry;
  sideHandlesDepth?: number;
  positionOffset?: Vector3;
  onResize?: (context: ProjectionCubeResizeContext) => void;
}

interface ActiveResize {
  axis: ResizeAxis;
  side: -1 | 1;
  plane: Plane;
  startPoint: Vector3;
  axisDirection: Vector3;
  fixedFace: number;
  movingFace: number;
  startPosition: Vector3;
  startSize: Vector3;
}

const MIN_DIMENSION = 0.5;
const snapToHalf = (value: number) => Math.round(value * 2) / 2;

function getAxisIndex(axis: ResizeAxis) {
  return axis === "x" ? 0 : axis === "y" ? 1 : 2;
}

function getParallelResize(
  context: ProjectionCubeResizeContext
) {
  const {
    cube,
    axis,
    side,
    faceDelta,
    fixedFace,
    startPosition,
    startSize,
    resizeProjectionCube,
  } = context;
  const axisIndex = getAxisIndex(axis);
  const scale = cube.scale.getComponent(axisIndex);
  const dimension = Math.max(
    MIN_DIMENSION,
    snapToHalf(
      startSize.getComponent(axisIndex) + (2 * faceDelta * side) / scale
    )
  );
  const nextSize = startSize.clone().setComponent(axisIndex, dimension);
  const nextMovingFace = fixedFace + side * dimension * scale;
  const nextPosition = startPosition.clone();
  nextPosition.setComponent(
    axisIndex,
    (fixedFace + nextMovingFace) / 2 - cube.translation.getComponent(axisIndex)
  );
  resizeProjectionCube("parallel", cube.id, nextSize, nextPosition);
  resizeProjectionCube("parallel", cube.id, nextSize, nextPosition);
}

export default function ProjectionCube({
  cube,
  mode,
  interactive = false,
  onDraggingChange,
  geometry,
  sideHandlesDepth,
  positionOffset = new Vector3(),
  onResize,
}: ProjectionCubeProps) {
  const resizeProjectionCube = useScene3DStore(
    state => state.resizeProjectionCube
  );
  const activeResize = useRef<ActiveResize | null>(null);
  const position = cube.position
    .clone()
    .add(cube.translation)
    .add(positionOffset);

  const beginResize = (
    event: ThreeEvent<PointerEvent>,
    axis: ResizeAxis,
    side: -1 | 1,
    handlePosition: Vector3
  ) => {
    if (!interactive) return;
    event.stopPropagation();

    const axisIndex = getAxisIndex(axis);
    const axisDirection = new Vector3().setComponent(axisIndex, 1);
    const scaledHalfSize =
      (cube.size.getComponent(axisIndex) *
        cube.scale.getComponent(axisIndex)) /
      2;
    const fixedFace = position.getComponent(axisIndex) - side * scaledHalfSize;
    const movingFace =
      position.getComponent(axisIndex) + side * scaledHalfSize;
    const plane = new Plane().setFromNormalAndCoplanarPoint(
      event.camera.getWorldDirection(new Vector3()),
      handlePosition
    );

    activeResize.current = {
      axis,
      side,
      plane,
      startPoint: event.point.clone(),
      axisDirection,
      fixedFace,
      movingFace,
      startPosition: cube.position.clone(),
      startSize: cube.size.clone(),
    };
    onDraggingChange?.(true);
    (event.target as PointerCaptureTarget).setPointerCapture(event.pointerId);
  };

  const resize = (event: ThreeEvent<PointerEvent>) => {
    const active = activeResize.current;
    if (!interactive || !active) return;
    event.stopPropagation();

    const point = new Vector3();
    if (!event.ray.intersectPlane(active.plane, point)) return;
    const faceDelta = point
      .sub(active.startPoint)
      .dot(active.axisDirection);
    const context: ProjectionCubeResizeContext = {
      cube,
      ...active,
      faceDelta,
      resizeProjectionCube,
    };

    if (onResize) {
      onResize(context);
    } else if (mode === "parallel") {
      getParallelResize(context);
    } else {
      throw new Error(
        `Perspective projection cube "${cube.id}" requires a resize handler.`
      );
    }
  };

  const endResize = (event: ThreeEvent<PointerEvent>) => {
    if (!activeResize.current) return;
    event.stopPropagation();
    activeResize.current = null;
    onDraggingChange?.(false);
    (event.target as PointerCaptureTarget).releasePointerCapture(event.pointerId);
    document.body.style.cursor = "default";
  };

  const handles = (["x", "y", "z"] as const).flatMap(axis => {
    const axisIndex = getAxisIndex(axis);
    const halfDimension =
      (cube.size.getComponent(axisIndex) *
        cube.scale.getComponent(axisIndex)) /
      2;

    return ([-1, 1] as const).map(side => {
      const handlePosition = position.clone();
      handlePosition.setComponent(
        axisIndex,
        position.getComponent(axisIndex) + side * halfDimension
      );
      if (axis !== "z" && sideHandlesDepth !== undefined) {
        handlePosition.z = position.z + sideHandlesDepth * cube.scale.z;
      }

      const localPosition = handlePosition.clone().sub(position);
      const color =
        axis === "x" ? "#ef4444" : axis === "y" ? "#22c55e" : "#3b82f6";

      return (
        <mesh
          key={`${axis}-${side}`}
          position={localPosition}
          visible={interactive}
          onPointerDown={event =>
            beginResize(event, axis, side, handlePosition)
          }
          onPointerMove={resize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          onPointerOver={() => {
            if (interactive) document.body.style.cursor = "grab";
          }}
          onPointerOut={() => {
            if (!activeResize.current) document.body.style.cursor = "default";
          }}
        >
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color={color} depthTest={false} />
        </mesh>
      );
    });
  });

  return (
    <group position={position}>
      <mesh
        userData={{ id: cube.id }}
        geometry={geometry}
      >
        {!geometry && (
          <boxGeometry args={[cube.size.x, cube.size.y, cube.size.z]} />
        )}
        {Array.from({ length: 6 }, (_, index) => (
          <meshPhongMaterial
            key={index}
            color={cube.color}
            transparent
            opacity={0.22}
            side={DoubleSide}
            depthWrite={false}
          />
        ))}
        <Edges threshold={1} color={cube.color} />
      </mesh>
      {handles}
    </group>
  );
}

type PointerCaptureTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void;
  releasePointerCapture: (pointerId: number) => void;
};
