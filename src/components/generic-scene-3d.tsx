import { useScene3DStore } from "@/store/scene3DStore";
import { Canvas } from "@react-three/fiber";
import React from "react";
import { Scene3D } from "./scene-3d";

export default function GenericScene3D() {
  const { cubes, objectiveCubes } = useScene3DStore();

  return (
    <div className="w-full h-screen bg-black">
      <Canvas>
        <Scene3D cubes={[...cubes, ...objectiveCubes]} />
      </Canvas>
    </div>
  );
}
