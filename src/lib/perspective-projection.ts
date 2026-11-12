import { MathUtils, Vector3 } from "three";

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

export function isCubeInsidePerspectiveProjection(
  position: Vector3,
  size: Vector3,
  projection: PerspectiveProjectionParameters,
  volumePosition: Vector3
): boolean {
  const halfSize = size.clone().multiplyScalar(0.5);
  const localPosition = position.clone().sub(volumePosition);
  const halfDepth = (projection.far - projection.near) / 2;

  for (const xSide of [-1, 1]) {
    for (const ySide of [-1, 1]) {
      for (const zSide of [-1, 1]) {
        const x = localPosition.x + xSide * halfSize.x;
        const y = localPosition.y + ySide * halfSize.y;
        const z = localPosition.z + zSide * halfSize.z;

        if (z < -halfDepth || z > halfDepth) return false;

        const distanceFromCamera = projection.near + halfDepth - z;
        const scale = distanceFromCamera / projection.near;
        if (
          x < projection.left * scale ||
          x > projection.right * scale ||
          y < projection.bottom * scale ||
          y > projection.top * scale
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

// Alguma parte do cubo pode estar dentro do volume em perspectiva.
// Retorna false quando todos os vértices do cubo ficam do lado de fora de um
// mesmo plano do volume (near, far, esquerda, direita, baixo ou cima).
export function doesCubeIntersectPerspectiveProjection(
  position: Vector3,
  size: Vector3,
  projection: PerspectiveProjectionParameters,
  volumePosition: Vector3
): boolean {
  const halfSize = size.clone().multiplyScalar(0.5);
  const localPosition = position.clone().sub(volumePosition);
  const halfDepth = (projection.far - projection.near) / 2;

  const corners: Vector3[] = [];
  for (const xSide of [-1, 1]) {
    for (const ySide of [-1, 1]) {
      for (const zSide of [-1, 1]) {
        corners.push(
          new Vector3(
            localPosition.x + xSide * halfSize.x,
            localPosition.y + ySide * halfSize.y,
            localPosition.z + zSide * halfSize.z
          )
        );
      }
    }
  }

  // Cada teste retorna true quando o vértice está fora daquele plano
  const scaleAt = (z: number) => (projection.near + halfDepth - z) / projection.near;
  const outsideTests: ((corner: Vector3) => boolean)[] = [
    corner => corner.z > halfDepth, // antes do plano near
    corner => corner.z < -halfDepth, // depois do plano far
    corner => corner.x < projection.left * scaleAt(corner.z),
    corner => corner.x > projection.right * scaleAt(corner.z),
    corner => corner.y < projection.bottom * scaleAt(corner.z),
    corner => corner.y > projection.top * scaleAt(corner.z),
  ];

  return !outsideTests.some(isOutside => corners.every(isOutside));
}
