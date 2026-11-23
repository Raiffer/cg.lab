import { Euler, MathUtils, Quaternion, Vector3 } from "three";

// Rotação do volume de projeção em graus (Euler XYZ), aplicada em torno do
// centro do volume.
export function getProjectionVolumeEuler(rotation?: Vector3) {
  return new Euler(
    MathUtils.degToRad(rotation?.x ?? 0),
    MathUtils.degToRad(rotation?.y ?? 0),
    MathUtils.degToRad(rotation?.z ?? 0)
  );
}

export function getProjectionVolumeQuaternion(rotation?: Vector3) {
  return new Quaternion().setFromEuler(getProjectionVolumeEuler(rotation));
}

// Converte um ponto do mundo para o sistema local do volume
// (origem no centro do volume, eixos girados junto com ele)
export function toProjectionVolumeLocal(
  point: Vector3,
  volumePosition: Vector3,
  rotation?: Vector3
) {
  const inverse = getProjectionVolumeQuaternion(rotation).invert();
  return point.clone().sub(volumePosition).applyQuaternion(inverse);
}

// Os 8 vértices de um cubo alinhado aos eixos do mundo
export function getCubeCorners(position: Vector3, size: Vector3) {
  const halfSize = new Vector3(
    Math.abs(size.x),
    Math.abs(size.y),
    Math.abs(size.z)
  ).multiplyScalar(0.5);
  const corners: Vector3[] = [];

  for (const xSide of [-1, 1]) {
    for (const ySide of [-1, 1]) {
      for (const zSide of [-1, 1]) {
        corners.push(
          new Vector3(
            position.x + xSide * halfSize.x,
            position.y + ySide * halfSize.y,
            position.z + zSide * halfSize.z
          )
        );
      }
    }
  }

  return corners;
}
