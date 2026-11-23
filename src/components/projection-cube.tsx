import { Edges, Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import {
  type ProjectionMode,
  type TProjectionCube,
  useScene3DStore,
} from "@/store/scene3DStore";
import {
  getProjectionVolumeEuler,
  getProjectionVolumeQuaternion,
} from "@/lib/projection-volume";
import { useMemo, useRef } from "react";
import { BufferGeometry, DoubleSide, Plane, Vector3 } from "three";

type ResizeAxis = "x" | "y" | "z";

export interface ProjectionCubeResizeContext {
  cube: TProjectionCube;
  axis: ResizeAxis;
  side: -1 | 1;
  faceDelta: number;
  // Direção (no mundo) do eixo local do volume que está sendo redimensionado.
  // fixedFace/movingFace são medidos ao longo dela.
  axisDirection: Vector3;
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
  // Posição z (local, sem escala) da câmera. Padrão: logo à frente da face
  // de projeção, como numa projeção paralela.
  cameraDepth?: number;
  // Pontos locais ligados à câmera por linhas (ex.: cantos do plano near)
  cameraRayTargets?: Vector3[];
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
// Face de projeção (plano near, +Z local, do lado da câmera). É o material
// de índice 4 tanto na boxGeometry (+x, -x, +y, -y, +z, -z) quanto na
// geometria em perspectiva (direita, esquerda, cima, baixo, near, far).
const PROJECTION_FACE_INDEX = 4;
const PROJECTION_FACE_COLOR = "#ef4444";
const PARALLEL_CAMERA_GAP = 1.5;

// Câmera estilizada que olha para -Z local (em direção ao volume)
function CameraMarker({
  position,
  rayTargets,
}: {
  position: Vector3;
  rayTargets: Vector3[];
}) {
  return (
    <>
      <group position={position}>
        {/* Corpo atrás da lente */}
        <mesh position={[0, 0, 0.45]}>
          <boxGeometry args={[1, 0.7, 0.7]} />
          <meshPhongMaterial color={PROJECTION_FACE_COLOR} />
        </mesh>
        {/* Lente apontando para o volume */}
        <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.25, 0.4, 16]} />
          <meshPhongMaterial color="#7f1d1d" />
        </mesh>
      </group>
      {rayTargets.map((target, index) => (
        <Line
          key={index}
          points={[position, target]}
          color={PROJECTION_FACE_COLOR}
          lineWidth={1}
          dashed
          dashSize={0.4}
          gapSize={0.3}
        />
      ))}
    </>
  );
}
const snapToHalf = (value: number) => Math.round(value * 2) / 2;

function getAxisIndex(axis: ResizeAxis) {
  return axis === "x" ? 0 : axis === "y" ? 1 : 2;
}

// Desloca a posição inicial ao longo do eixo redimensionado para que o
// centro do volume fique em nextCenter (medido ao longo de axisDirection)
export function moveProjectionCubeCenter(
  context: ProjectionCubeResizeContext,
  nextCenter: number
) {
  const { axisDirection, fixedFace, movingFace, startPosition } = context;
  const startCenter = (fixedFace + movingFace) / 2;
  return startPosition
    .clone()
    .addScaledVector(axisDirection, nextCenter - startCenter);
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
  const nextPosition = moveProjectionCubeCenter(
    context,
    (fixedFace + nextMovingFace) / 2
  );
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
  cameraDepth,
  cameraRayTargets = [],
}: ProjectionCubeProps) {
  const resizeProjectionCube = useScene3DStore(
    state => state.resizeProjectionCube
  );
  const activeResize = useRef<ActiveResize | null>(null);
  const position = cube.position
    .clone()
    .add(cube.translation)
    .add(positionOffset);
  const { x: rotationX, y: rotationY, z: rotationZ } =
    cube.rotation ?? new Vector3();
  const quaternion = useMemo(
    () =>
      getProjectionVolumeQuaternion(
        new Vector3(rotationX, rotationY, rotationZ)
      ),
    [rotationX, rotationY, rotationZ]
  );
  const euler = useMemo(
    () =>
      getProjectionVolumeEuler(new Vector3(rotationX, rotationY, rotationZ)),
    [rotationX, rotationY, rotationZ]
  );

  const beginResize = (
    event: ThreeEvent<PointerEvent>,
    axis: ResizeAxis,
    side: -1 | 1,
    handlePosition: Vector3
  ) => {
    if (!interactive) return;
    event.stopPropagation();

    const axisIndex = getAxisIndex(axis);
    const axisDirection = new Vector3()
      .setComponent(axisIndex, 1)
      .applyQuaternion(quaternion);
    const scaledHalfSize =
      (cube.size.getComponent(axisIndex) *
        cube.scale.getComponent(axisIndex)) /
      2;
    const center = position.dot(axisDirection);
    const fixedFace = center - side * scaledHalfSize;
    const movingFace = center + side * scaledHalfSize;
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

  const cameraPosition = new Vector3(
    0,
    0,
    (cameraDepth ?? cube.size.z / 2 + PARALLEL_CAMERA_GAP) * cube.scale.z
  );

  const handles = (["x", "y", "z"] as const).flatMap(axis => {
    const axisIndex = getAxisIndex(axis);
    const halfDimension =
      (cube.size.getComponent(axisIndex) *
        cube.scale.getComponent(axisIndex)) /
      2;

    return ([-1, 1] as const).map(side => {
      // Posição no sistema local do volume (o grupo aplica a rotação)
      const localPosition = new Vector3().setComponent(
        axisIndex,
        side * halfDimension
      );
      if (axis !== "z" && sideHandlesDepth !== undefined) {
        localPosition.z = sideHandlesDepth * cube.scale.z;
      }
      const handlePosition = localPosition
        .clone()
        .applyQuaternion(quaternion)
        .add(position);
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
    <group position={position} rotation={euler}>
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
            color={
              index === PROJECTION_FACE_INDEX ? PROJECTION_FACE_COLOR : cube.color
            }
            transparent
            opacity={0.22}
            side={DoubleSide}
            depthWrite={false}
          />
        ))}
        <Edges threshold={1} color={cube.color} />
      </mesh>
      {handles}
      <CameraMarker
        position={cameraPosition}
        rayTargets={cameraRayTargets.map(target =>
          target.clone().multiply(cube.scale)
        )}
      />
    </group>
  );
}

type PointerCaptureTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void;
  releasePointerCapture: (pointerId: number) => void;
};
