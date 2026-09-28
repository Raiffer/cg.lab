"use client";

import {
  PerspectiveCamera,
  OrbitControls,
  Text,
  Billboard,
} from "@react-three/drei";
import Cube from "./cube";
import CustomPlane3D from "./custom-plane-3d";
import { useState } from "react";
import { TCube, TPlane } from "@/store/scene3DStore";

interface Props {
  cubes: TCube[];
  planes?: TPlane[];
  cameraPosition?: [number, number, number];
}

export function Scene3D({ cubes, planes, cameraPosition }: Props) {
  const [isDraggingCube, setIsDraggingCube] = useState(false);

  return (
    <>
      {/* Floor Grid */}
      <gridHelper args={[16, 16]} position={[0, 0, 0]} />

      {/* Vertical Grid Wall */}
      <gridHelper
        args={[16, 16]}
        position={[0, 8, -8]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <gridHelper
        args={[16, 16]}
        position={[-8, 8, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />

      <Billboard follow position={[9, 0, 0]}>
        <Text
          color="white"
          fontSize={1}
          outlineColor="black"
          outlineWidth={0.02}
        >
          X+
        </Text>
      </Billboard>
      <Billboard follow position={[0, 9, 0]}>
        <Text
          color="white"
          fontSize={1}
          outlineColor="black"
          outlineWidth={0.02}
        >
          Y+
        </Text>
      </Billboard>
      <Billboard follow position={[0, 0, 9]}>
        <Text
          color="white"
          fontSize={1}
          outlineColor="black"
          outlineWidth={0.02}
        >
          Z+
        </Text>
      </Billboard>

      <axesHelper args={[8]} />

      <PerspectiveCamera
        makeDefault
        position={cameraPosition ?? [10, 10, 10]}
      />
      <OrbitControls enabled={!isDraggingCube} />

      {/* Example Mesh */}
      {cubes.map(cube => (
        <Cube key={cube.id} cube={cube} onDraggingChange={setIsDraggingCube} />
      ))}

      {planes?.map(plane => (
        <CustomPlane3D key={plane.id} plane={plane} />
      ))}

      {/* Render a Billboard text for each position in each axis from -8 to 8*/}
      {Array.from({ length: 17 }, (_, i) => i - 8).map(i => (
        <Billboard key={i} follow position={[i, 0.3, 0]}>
          <Text
            color="white"
            fontSize={0.3}
            outlineColor="black"
            outlineWidth={0.02}
          >
            {i}
          </Text>
        </Billboard>
      ))}

      {/* Render a Billboard text for each position in each axis from -8 to 8*/}
      {Array.from({ length: 9 }, (_, i) => i).map(i => (
        <Billboard key={i} follow position={[0.3, i, 0]}>
          <Text
            color="white"
            fontSize={0.3}
            outlineColor="black"
            outlineWidth={0.02}
          >
            {i}
          </Text>
        </Billboard>
      ))}

      {/* Render a Billboard text for each position in each axis from -8 to 8*/}
      {Array.from({ length: 17 }, (_, i) => i - 8).map(i => (
        <Billboard key={i} follow position={[0, 0.3, i]}>
          <Text
            color="white"
            fontSize={0.3}
            outlineColor="black"
            outlineWidth={0.02}
          >
            {i}
          </Text>
        </Billboard>
      ))}

      {/* Render a tick line for each position in each axis */}
      {Array.from({ length: 17 }, (_, i) => i - 8).map(i => (
        <mesh key={i} position={[i, 0, 0]}>
          <lineBasicMaterial color="red" />
          <boxGeometry args={[0.05, 0.2, 0.05]} />
        </mesh>
      ))}

      {Array.from({ length: 9 }, (_, i) => i).map(i => (
        <mesh key={i} position={[0, i, 0]}>
          <lineBasicMaterial color="green" />
          <boxGeometry args={[0.2, 0.05, 0.01]} />
        </mesh>
      ))}

      {Array.from({ length: 17 }, (_, i) => i - 8).map(i => (
        <mesh key={i} position={[0, 0, i]}>
          <lineBasicMaterial color="blue" />
          <boxGeometry args={[0.05, 0.2, 0.05]} />
        </mesh>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[2, 5, 1]} intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </>
  );
}
