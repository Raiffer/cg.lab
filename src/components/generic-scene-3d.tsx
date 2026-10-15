import { ProjectionMode, useScene3DStore } from "@/store/scene3DStore";
import { Canvas } from "@react-three/fiber";
import React from "react";
import { Scene3D } from "./scene-3d";

interface GenericScene3DProps {
  parallelProjection?: boolean;
  perspectiveProjection?: boolean;
  projectionMode?: ProjectionMode;
  extendNegativeZGrid?: boolean;
}

export default function GenericScene3D({
  parallelProjection = false,
  perspectiveProjection = false,
  projectionMode = "parallel",
  extendNegativeZGrid = false,
}: GenericScene3DProps) {
  const { cubes, projectionCubes } = useScene3DStore();

  return (
    <div className="w-full h-screen bg-black">
      <Canvas>
        <Scene3D
          cubes={cubes}
          projectionCubes={projectionCubes[projectionMode]}
          parallelProjection={parallelProjection}
          perspectiveProjection={perspectiveProjection}
          extendNegativeZGrid={extendNegativeZGrid}
        />
      </Canvas>
    </div>
  );
}
