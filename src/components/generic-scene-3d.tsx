import { ProjectionMode, useScene3DStore } from "@/store/scene3DStore";
import { Canvas } from "@react-three/fiber";
import React from "react";
import { Scene3D } from "./scene-3d";

interface GenericScene3DProps {
  parallelProjection?: boolean;
  perspectiveProjection?: boolean;
  projectionMode?: ProjectionMode;
  extendNegativeZGrid?: boolean;
  // Classes do container; por padrão ocupa a tela inteira
  className?: string;
}

export default function GenericScene3D({
  parallelProjection = false,
  perspectiveProjection = false,
  projectionMode = "parallel",
  extendNegativeZGrid = false,
  className = "w-full h-screen",
}: GenericScene3DProps) {
  const { cubes, planes, cameraPosition, projectionCubes } =
    useScene3DStore();

  return (
    <div className={`${className} bg-black`}>
      <Canvas>
        <Scene3D
          cubes={cubes}
          planes={planes}
          cameraPosition={cameraPosition ?? undefined}
          projectionCubes={projectionCubes[projectionMode]}
          parallelProjection={parallelProjection}
          perspectiveProjection={perspectiveProjection}
          extendNegativeZGrid={extendNegativeZGrid}
        />
      </Canvas>
    </div>
  );
}
