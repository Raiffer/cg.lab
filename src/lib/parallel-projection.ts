import { Vector3 } from "three";

// O volume de projeção paralela é uma caixa alinhada aos eixos.
// Estas funções comparam essa caixa com cubos (centro + tamanho).

function getBounds(center: Vector3, size: Vector3) {
  const halfSize = new Vector3(
    Math.abs(size.x),
    Math.abs(size.y),
    Math.abs(size.z)
  ).multiplyScalar(0.5);

  return {
    min: center.clone().sub(halfSize),
    max: center.clone().add(halfSize),
  };
}

// O cubo está inteiro dentro do volume
export function isCubeInsideParallelProjection(
  position: Vector3,
  size: Vector3,
  volumePosition: Vector3,
  volumeSize: Vector3
): boolean {
  const cube = getBounds(position, size);
  const volume = getBounds(volumePosition, volumeSize);

  return [0, 1, 2].every(
    axis =>
      cube.min.getComponent(axis) >= volume.min.getComponent(axis) &&
      cube.max.getComponent(axis) <= volume.max.getComponent(axis)
  );
}

// Alguma parte do cubo está dentro do volume (encostar na face não conta)
export function doesCubeIntersectParallelProjection(
  position: Vector3,
  size: Vector3,
  volumePosition: Vector3,
  volumeSize: Vector3
): boolean {
  const cube = getBounds(position, size);
  const volume = getBounds(volumePosition, volumeSize);

  return [0, 1, 2].every(
    axis =>
      cube.min.getComponent(axis) < volume.max.getComponent(axis) &&
      cube.max.getComponent(axis) > volume.min.getComponent(axis)
  );
}
