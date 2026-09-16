import { useScene3DStore } from "@/store/scene3DStore";
import { Canvas } from "@react-three/fiber";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Scene3D } from "./scene-3d";

export default function ObjectivePanel3D() {
  const { objectiveCubes } = useScene3DStore();
  const [isOpen, setIsOpen] = useState(true);

  if (!objectiveCubes.length) return null;

  return (
    <div className="absolute top-4 right-4 border-2 border-gray-400 bg-black rounded-sm overflow-hidden w-[30%]">
      <div
        className={`${
          isOpen && "border-b-2"
        } border-gray-400 text-white px-4 py-2 bg-zinc-900 flex items-center justify-between`}
      >
        <h1 className="font-semibold">Objetivo</h1>
        <ChevronDown
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer"
        />
      </div>
      {isOpen && (
        <div className="w-full h-56">
          <Canvas>
            <Scene3D cubes={objectiveCubes} cameraPosition={[4, 4, 4]} />
          </Canvas>
        </div>
      )}
    </div>
  );
}
