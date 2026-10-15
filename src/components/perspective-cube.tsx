import type { TProjectionCube } from "@/store/scene3DStore";
import {
  createPerspectiveProjectionFromBounds,
  createPerspectiveProjectionParameters,
  getPerspectiveFrustumSize,
  type PerspectiveProjectionParameters,
} from "@/lib/perspective-projection";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import ProjectionCube, {
  type ProjectionCubeResizeContext,
} from "./projection-cube";

interface PerspectiveCubeProps {
  cube: TProjectionCube;
  interactive?: boolean;
  onDraggingChange?: (dragging: boolean) => void;
}

function createPerspectiveFrustumGeometry(
  projection: PerspectiveProjectionParameters
) {
  const size = getPerspectiveFrustumSize(projection);
  const halfWidth = size.x / 2;
  const halfHeight = size.y / 2;
  const halfDepth = size.z / 2;
  const nearHalfWidth = (projection.right - projection.left) / 2;
  const nearHalfHeight = (projection.top - projection.bottom) / 2;
  const vertices = {
    farLeftBottom: [-halfWidth, -halfHeight, -halfDepth],
    farRightBottom: [halfWidth, -halfHeight, -halfDepth],
    farRightTop: [halfWidth, halfHeight, -halfDepth],
    farLeftTop: [-halfWidth, halfHeight, -halfDepth],
    nearLeftBottom: [-nearHalfWidth, -nearHalfHeight, halfDepth],
    nearRightBottom: [nearHalfWidth, -nearHalfHeight, halfDepth],
    nearRightTop: [nearHalfWidth, nearHalfHeight, halfDepth],
    nearLeftTop: [-nearHalfWidth, nearHalfHeight, halfDepth],
  } satisfies Record<string, [number, number, number]>;
  const faces = [
    [
      vertices.farRightBottom,
      vertices.farRightTop,
      vertices.nearRightTop,
      vertices.nearRightBottom,
    ],
    [
      vertices.farLeftBottom,
      vertices.nearLeftBottom,
      vertices.nearLeftTop,
      vertices.farLeftTop,
    ],
    [
      vertices.farLeftTop,
      vertices.nearLeftTop,
      vertices.nearRightTop,
      vertices.farRightTop,
    ],
    [
      vertices.farLeftBottom,
      vertices.farRightBottom,
      vertices.nearRightBottom,
      vertices.nearLeftBottom,
    ],
    [
      vertices.nearLeftBottom,
      vertices.nearRightBottom,
      vertices.nearRightTop,
      vertices.nearLeftTop,
    ],
    [
      vertices.farLeftBottom,
      vertices.farLeftTop,
      vertices.farRightTop,
      vertices.farRightBottom,
    ],
  ];
  const positions: number[] = [];
  const geometry = new BufferGeometry();

  faces.forEach((face, materialIndex) => {
    const start = positions.length / 3;
    for (const vertexIndex of [0, 1, 2, 0, 2, 3]) {
      positions.push(...face[vertexIndex]);
    }
    geometry.addGroup(start, 6, materialIndex);
  });

  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return { geometry, size };
}

function resizePerspectiveCube(
  context: ProjectionCubeResizeContext,
  aspect: number
) {
  const {
    cube,
    axis,
    side,
    faceDelta,
    fixedFace,
    movingFace,
    startPosition,
    startSize,
    resizeProjectionCube,
  } = context;
  const projection = cube.perspectiveProjection;
  if (!projection) {
    throw new Error(
      `Perspective cube "${cube.id}" is missing its projection parameters.`
    );
  }

  let nextProjection = projection;
  const nextPosition = startPosition.clone();

  if (axis === "z") {
    const axisIndex = 2;
    const requestedFace = movingFace + faceDelta;
    const requestedDepth =
      Math.round(
        ((side * (requestedFace - fixedFace)) /
          cube.scale.getComponent(axisIndex)) *
          2
      ) / 2;
    const maxDepth = side > 0 ? projection.far - 0.1 : Infinity;
    const nextDepth = Math.max(0.5, Math.min(maxDepth, requestedDepth));
    const nextMovingFace =
      fixedFace + side * nextDepth * cube.scale.getComponent(axisIndex);
    const nextCenter = (fixedFace + nextMovingFace) / 2;
    nextPosition.setZ(nextCenter - cube.translation.z);
    const nextNear =
      side > 0 ? Math.max(0.1, projection.far - nextDepth) : projection.near;
    const nextFar =
      side < 0 ? projection.near + nextDepth : projection.far;

    nextProjection =
      projection.definition === "bounds"
        ? createPerspectiveProjectionFromBounds(
            nextNear,
            nextFar,
            projection.left,
            projection.right,
            projection.bottom,
            projection.top
          )
        : createPerspectiveProjectionParameters(
            nextNear,
            nextFar,
            projection.fov,
            aspect
          );
  } else {
    const axisIndex = axis === "x" ? 0 : 1;
    if (projection.definition === "bounds") {
      const depthScale = projection.far / projection.near;
      const nextDimension = Math.max(
        0.5,
        Math.round(
          (startSize.getComponent(axisIndex) +
            (2 * faceDelta * side) / cube.scale.getComponent(axisIndex)) *
            2
        ) / 2
      );
      const nearDimension = nextDimension / depthScale;
      nextProjection =
        axis === "x"
          ? createPerspectiveProjectionFromBounds(
              projection.near,
              projection.far,
              -nearDimension / 2,
              nearDimension / 2,
              projection.bottom,
              projection.top
            )
          : createPerspectiveProjectionFromBounds(
              projection.near,
              projection.far,
              projection.left,
              projection.right,
              -nearDimension / 2,
              nearDimension / 2
            );
    } else {
      const nextDimension = Math.max(
        0.5,
        Math.round(
          (startSize.getComponent(axisIndex) +
            (2 * faceDelta * side) / cube.scale.getComponent(axisIndex)) *
            2
        ) / 2
      );
      const nextFarHeight =
        axis === "x" ? nextDimension / aspect : nextDimension;
      const fov = Math.min(
        179,
        (2 * Math.atan(nextFarHeight / (2 * projection.far)) * 180) / Math.PI
      );

      nextProjection = createPerspectiveProjectionParameters(
        projection.near,
        projection.far,
        fov,
        aspect
      );
    }
  }

  resizeProjectionCube(
    "perspective",
    cube.id,
    getPerspectiveFrustumSize(nextProjection),
    nextPosition,
    nextProjection
  );
}

export default function PerspectiveCube({
  cube,
  interactive = false,
  onDraggingChange,
}: PerspectiveCubeProps) {
  const viewportSize = useThree(state => state.size);
  const aspect =
    Math.max(viewportSize.width, 1) / Math.max(viewportSize.height, 1);
  const storedProjection = cube.perspectiveProjection;
  if (!storedProjection) {
    throw new Error(
      `Perspective cube "${cube.id}" is missing its projection parameters.`
    );
  }
  const { near, far, fov } = storedProjection;
  const projection = useMemo(
    () =>
      storedProjection.definition === "bounds"
        ? storedProjection
        : createPerspectiveProjectionParameters(near, far, fov, aspect),
    [storedProjection, near, far, fov, aspect]
  );
  const frustum = useMemo(
    () => createPerspectiveFrustumGeometry(projection),
    [projection]
  );
  const displayCube = {
    ...cube,
    size: frustum.size,
    perspectiveProjection: projection,
  };

  return (
    <ProjectionCube
      cube={displayCube}
      mode="perspective"
      interactive={interactive}
      onDraggingChange={onDraggingChange}
      geometry={frustum.geometry}
      sideHandlesDepth={-frustum.size.z / 2}
      onResize={context => resizePerspectiveCube(context, aspect)}
    />
  );
}
