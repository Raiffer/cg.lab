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
