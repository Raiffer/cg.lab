import { useScene3DStore } from "@/store/scene3DStore";
import { Canvas } from "@react-three/fiber";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Scene3D } from "./scene-3d";

interface ObjectivePanel3DProps {
  minimalView?: boolean;
  mirrorMainScene?: boolean;
  projectionMode?: "parallel" | "perspective";
  extendNegativeZGrid?: boolean;
}

export default function ObjectivePanel3D({
  minimalView = false,
  mirrorMainScene = false,
  projectionMode = "parallel",
  extendNegativeZGrid = false,
}: ObjectivePanel3DProps) {
  const { cubes, objectiveCubes, projectionCubes } = useScene3DStore();
  const displayCubes = mirrorMainScene ? cubes : objectiveCubes;
  const displayProjectionCubes = mirrorMainScene
    ? projectionCubes[projectionMode]
    : [];
  const [isOpen, setIsOpen] = useState(true);

  if (!displayCubes.length && !displayProjectionCubes.length) return null;

  return (
    <div
      className={`absolute top-4 right-4 border-2 border-gray-400 bg-black rounded-sm overflow-hidden w-[30%] transition-[max-height] duration-300 ${
        isOpen ? "max-h-72" : "max-h-14"
      }`}
    >
      <div
        className={`${
          isOpen && "border-b-2"
        } border-gray-400 text-white px-4 py-2 bg-zinc-900 flex items-center justify-between`}
      >
        <h1 className="font-semibold">
          {mirrorMainScene ? "Cena principal" : "Objetivo"}
        </h1>
        <button
          type="button"
          aria-label={isOpen ? "Minimizar janela" : "Expandir janela"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(open => !open)}
          className="rounded p-1 transition-transform"
          style={{ transform: isOpen ? "rotate(0deg)" : "rotate(180deg)" }}
        >
          <ChevronDown aria-hidden="true" className="cursor-pointer" />
        </button>
      </div>
      <div
        className={`w-full h-56 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <Canvas>
          <Scene3D
            cubes={displayCubes}
            projectionCubes={displayProjectionCubes}
            cameraPosition={[4, 4, 4]}
            minimalView={minimalView}
            showGrid={minimalView}
            showProjectionCube={mirrorMainScene}
            projectionCubeInteractive={minimalView && isOpen}
            projectionMode={projectionMode}
            extendNegativeZGrid={extendNegativeZGrid}
          />
        </Canvas>
      </div>
    </div>
  );
}
