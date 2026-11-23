import { MathUtils, Vector3 } from "three";
import {
  getCubeCorners,
  getProjectionVolumeQuaternion,
  toProjectionVolumeLocal,
} from "./projection-volume";

export interface PerspectiveProjectionParameters {
  definition: "fov" | "bounds";
  near: number;
  far: number;
  left: number;
  right: number;
  bottom: number;
  top: number;
  fov: number;
}

export function createPerspectiveProjectionParameters(
  near: number,
  far: number,
  fovDegrees: number,
  aspect: number
): PerspectiveProjectionParameters {
  const halfFovRadians = MathUtils.degToRad(fovDegrees / 2);
  const halfHeight = near * Math.tan(halfFovRadians);
  const halfWidth = halfHeight * aspect;

  return {
    definition: "fov",
    near,
    far,
    left: -halfWidth,
    right: halfWidth,
    bottom: -halfHeight,
    top: halfHeight,
    fov: fovDegrees,
  };
}

export function createPerspectiveProjectionFromBounds(
  near: number,
  far: number,
  left: number,
  right: number,
  bottom: number,
  top: number
): PerspectiveProjectionParameters {
  if (near <= 0 || far <= near || left >= right || bottom >= top) {
    throw new Error("Invalid perspective projection bounds.");
  }

  return {
    definition: "bounds",
    near,
    far,
    left,
    right,
    bottom,
    top,
    fov:
      (2 *
        Math.atan((top - bottom) / (2 * near)) *
        180) /
      Math.PI,
  };
}

export function getPerspectiveFrustumSize(
  projection: PerspectiveProjectionParameters
) {
  const depthScale = projection.far / projection.near;
  return new Vector3(
    (projection.right - projection.left) * depthScale,
    (projection.top - projection.bottom) * depthScale,
    projection.far - projection.near
  );
}

const EPSILON = 1e-6;

// Vértices do cubo no sistema local do volume (que pode estar girado)
function getLocalCubeCorners(
  position: Vector3,
  size: Vector3,
  volumePosition: Vector3,
  volumeRotation?: Vector3
) {
  return getCubeCorners(position, size).map(corner =>
    toProjectionVolumeLocal(corner, volumePosition, volumeRotation)
  );
}

export function isCubeInsidePerspectiveProjection(
  position: Vector3,
  size: Vector3,
  projection: PerspectiveProjectionParameters,
  volumePosition: Vector3,
  volumeRotation?: Vector3
): boolean {
  const halfDepth = (projection.far - projection.near) / 2;

  return getLocalCubeCorners(
    position,
    size,
    volumePosition,
    volumeRotation
  ).every(({ x, y, z }) => {
    if (z < -halfDepth - EPSILON || z > halfDepth + EPSILON) return false;

    const distanceFromCamera = projection.near + halfDepth - z;
    const scale = distanceFromCamera / projection.near;
    return (
      x >= projection.left * scale - EPSILON &&
      x <= projection.right * scale + EPSILON &&
      y >= projection.bottom * scale - EPSILON &&
      y <= projection.top * scale + EPSILON
    );
  });
}

// Vértices do volume em perspectiva, no mundo
function getPerspectiveVolumeCorners(
  projection: PerspectiveProjectionParameters,
  volumePosition: Vector3,
  volumeRotation?: Vector3
) {
  const halfDepth = (projection.far - projection.near) / 2;
  const farScale = projection.far / projection.near;
  const quaternion = getProjectionVolumeQuaternion(volumeRotation);
  const corners: Vector3[] = [];

  for (const [z, scale] of [
    [halfDepth, 1],
    [-halfDepth, farScale],
  ]) {
    for (const x of [projection.left, projection.right]) {
      for (const y of [projection.bottom, projection.top]) {
        corners.push(
          new Vector3(x * scale, y * scale, z)
            .applyQuaternion(quaternion)
            .add(volumePosition)
        );
      }
    }
  }

  return corners;
}

// Alguma parte do cubo pode estar dentro do volume em perspectiva.
// Retorna false quando todos os vértices do cubo ficam do lado de fora de um
// mesmo plano do volume (near, far, esquerda, direita, baixo ou cima), ou
// quando todos os vértices do volume ficam do lado de fora de uma mesma face
// do cubo.
export function doesCubeIntersectPerspectiveProjection(
  position: Vector3,
  size: Vector3,
  projection: PerspectiveProjectionParameters,
  volumePosition: Vector3,
  volumeRotation?: Vector3
): boolean {
  const halfDepth = (projection.far - projection.near) / 2;
  const corners = getLocalCubeCorners(
    position,
    size,
    volumePosition,
    volumeRotation
  );

  // Cada teste retorna true quando o vértice está fora daquele plano
  const scaleAt = (z: number) =>
    (projection.near + halfDepth - z) / projection.near;
  const outsideTests: ((corner: Vector3) => boolean)[] = [
    corner => corner.z >= halfDepth - EPSILON, // antes do plano near
    corner => corner.z <= -halfDepth + EPSILON, // depois do plano far
    corner => corner.x <= projection.left * scaleAt(corner.z) + EPSILON,
    corner => corner.x >= projection.right * scaleAt(corner.z) - EPSILON,
    corner => corner.y <= projection.bottom * scaleAt(corner.z) + EPSILON,
    corner => corner.y >= projection.top * scaleAt(corner.z) - EPSILON,
  ];
  if (outsideTests.some(isOutside => corners.every(isOutside))) return false;

  // Faces do cubo (alinhadas aos eixos do mundo) como planos separadores
  const volumeCorners = getPerspectiveVolumeCorners(
    projection,
    volumePosition,
    volumeRotation
  );
  const halfSize = new Vector3(
    Math.abs(size.x),
    Math.abs(size.y),
    Math.abs(size.z)
  ).multiplyScalar(0.5);
  const separatedByCubeFace = [0, 1, 2].some(axis => {
    const min = position.getComponent(axis) - halfSize.getComponent(axis);
    const max = position.getComponent(axis) + halfSize.getComponent(axis);
    return (
      volumeCorners.every(corner => corner.getComponent(axis) <= min + EPSILON) ||
      volumeCorners.every(corner => corner.getComponent(axis) >= max - EPSILON)
    );
  });

  return !separatedByCubeFace;
}
