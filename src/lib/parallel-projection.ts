import { Vector3 } from "three";
import {
  getCubeCorners,
  getProjectionVolumeQuaternion,
  toProjectionVolumeLocal,
} from "./projection-volume";

// O volume de projeção paralela é uma caixa, que pode estar girada em torno
// do próprio centro (rotação em graus). Os cubos comparados com ela são
// alinhados aos eixos do mundo (centro + tamanho).

const EPSILON = 1e-6;

function getHalfSize(size: Vector3) {
  return new Vector3(
    Math.abs(size.x),
    Math.abs(size.y),
    Math.abs(size.z)
  ).multiplyScalar(0.5);
}

// O cubo está inteiro dentro do volume
export function isCubeInsideParallelProjection(
  position: Vector3,
  size: Vector3,
  volumePosition: Vector3,
  volumeSize: Vector3,
  volumeRotation?: Vector3
): boolean {
  const volumeHalfSize = getHalfSize(volumeSize);

  // O volume é convexo: basta que todos os vértices do cubo estejam dentro
  return getCubeCorners(position, size).every(corner => {
    const local = toProjectionVolumeLocal(
      corner,
      volumePosition,
      volumeRotation
    );
    return [0, 1, 2].every(
      axis =>
        Math.abs(local.getComponent(axis)) <=
        volumeHalfSize.getComponent(axis) + EPSILON
    );
  });
}

// Alguma parte do cubo está dentro do volume (encostar na face não conta).
// Usa o teorema do eixo separador entre as duas caixas.
export function doesCubeIntersectParallelProjection(
  position: Vector3,
  size: Vector3,
  volumePosition: Vector3,
  volumeSize: Vector3,
  volumeRotation?: Vector3
): boolean {
  const quaternion = getProjectionVolumeQuaternion(volumeRotation);
  const worldAxes = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1),
  ];
  const volumeAxes = worldAxes.map(axis =>
    axis.clone().applyQuaternion(quaternion)
  );
  const cubeHalfSize = getHalfSize(size);
  const volumeHalfSize = getHalfSize(volumeSize);
  const centerOffset = position.clone().sub(volumePosition);

  const candidateAxes = [
    ...worldAxes,
    ...volumeAxes,
    ...worldAxes.flatMap(worldAxis =>
      volumeAxes.map(volumeAxis => worldAxis.clone().cross(volumeAxis))
    ),
  ].filter(axis => axis.lengthSq() > EPSILON);

  const isSeparatedBy = (axis: Vector3) => {
    const cubeRadius = worldAxes.reduce(
      (sum, cubeAxis, index) =>
        sum + cubeHalfSize.getComponent(index) * Math.abs(cubeAxis.dot(axis)),
      0
    );
    const volumeRadius = volumeAxes.reduce(
      (sum, volumeAxis, index) =>
        sum +
        volumeHalfSize.getComponent(index) * Math.abs(volumeAxis.dot(axis)),
      0
    );
    return (
      Math.abs(centerOffset.dot(axis)) >=
      cubeRadius + volumeRadius - EPSILON * axis.length()
    );
  };

  return !candidateAxes.some(isSeparatedBy);
}
