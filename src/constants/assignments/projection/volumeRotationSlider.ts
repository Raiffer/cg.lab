import { type ProjectionMode, useScene3DStore } from "@/store/scene3DStore";
import type { SliderConfig } from "@/types/Assignment";
import { Vector3 } from "three";

// Barra que gira o volume de projeção apenas em torno do eixo Y.
// As rotações iniciais em X e Z do volume são mantidas.
export function createVolumeYRotationSlider(
  mode: ProjectionMode,
  volumeId: string,
  initialRotation: Vector3
): SliderConfig {
  return {
    min: -180,
    max: 180,
    step: 5,
    initialValue: initialRotation.y,
    onChange: angle => {
      useScene3DStore
        .getState()
        .rotateProjectionCube(
          mode,
          volumeId,
          new Vector3(initialRotation.x, angle, initialRotation.z)
        );
    },
  };
}
