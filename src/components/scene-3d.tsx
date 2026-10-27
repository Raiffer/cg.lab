"use client";

import {
  OrthographicCamera,
  PerspectiveCamera,
  OrbitControls,
  Text,
  Billboard,
  Line,
} from "@react-three/drei";
import Cube from "./cube";
import CustomPlane3D from "./custom-plane-3d";
import ParallelCube from "./parallel-cube";
import PerspectiveCube from "./perspective-cube";
import { useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import {
  ProjectionMode,
  TCube,
  TPlane,
  TProjectionCube,
} from "@/store/scene3DStore";
import { MOUSE, Vector3 } from "three";

const SECONDARY_CAMERA_POSITION: [number, number, number] = [12, 12, 12];
const SECONDARY_CAMERA_POLAR_ANGLE = Math.acos(
  SECONDARY_CAMERA_POSITION[1] /
    new Vector3(...SECONDARY_CAMERA_POSITION).length()
);

interface Props {
  cubes: TCube[];
  planes?: TPlane[];
  projectionCubes?: TProjectionCube[];
  cameraPosition?: [number, number, number];
  minimalView?: boolean;
  showGrid?: boolean;
  showProjectionCube?: boolean;
  projectionCubeInteractive?: boolean;
  projectionMode?: ProjectionMode;
  extendNegativeZGrid?: boolean;
  parallelProjection?: boolean;
  perspectiveProjection?: boolean;
}

export function Scene3D({
  cubes,
  planes,
  projectionCubes = [],
  cameraPosition,
  minimalView = false,
  showGrid = false,
  showProjectionCube = false,
  projectionCubeInteractive = false,
  projectionMode = "parallel",
  extendNegativeZGrid = false,
  parallelProjection = false,
  perspectiveProjection = false,
}: Props) {
  const [isDraggingCube, setIsDraggingCube] = useState(false);
  const hasExtendedNegativeZGrid = extendNegativeZGrid;
  const viewportSize = useThree(state => state.size);
  const cameraAspect =
    Math.max(viewportSize.width, 1) / Math.max(viewportSize.height, 1);
  const fixedCameraTarget = useRef(new Vector3()).current;
  const projectionCube =
    parallelProjection || perspectiveProjection
      ? projectionCubes[0]
      : undefined;
  const cameraTarget = fixedCameraTarget;
  const volumeWidth = projectionCube
    ? Math.abs(projectionCube.size.x * projectionCube.scale.x)
    : 16;
  const volumeHeight = projectionCube
    ? Math.abs(projectionCube.size.y * projectionCube.scale.y)
    : 16;
  const volumeDepth = projectionCube
    ? Math.abs(projectionCube.size.z * projectionCube.scale.z)
    : 16;
  const volumeCenter = projectionCube
    ? projectionCube.position.clone().add(projectionCube.translation)
    : { x: 0, y: 0, z: 0 };
  const near = 0.1;
  const cameraOffset = near * 2;
  const far = volumeDepth + near * 3;
  const perspectiveNearFaceWidth = projectionCube
    ? Math.abs(
        (projectionCube.perspectiveProjection
          ? projectionCube.perspectiveProjection.right -
            projectionCube.perspectiveProjection.left
          : projectionCube.size.x / 2) * projectionCube.scale.x
      )
    : volumeWidth / 2;
  const perspectiveNearFaceHeight = projectionCube
    ? Math.abs(
        (projectionCube.perspectiveProjection
          ? projectionCube.perspectiveProjection.top -
            projectionCube.perspectiveProjection.bottom
          : projectionCube.size.y / 2) * projectionCube.scale.y
      )
    : volumeHeight / 2;
  const perspectiveScale = Math.max(
    volumeWidth / Math.max(perspectiveNearFaceWidth, 0.001),
    volumeHeight / Math.max(perspectiveNearFaceHeight, 0.001)
  );
  const perspectiveFrontDistance =
    volumeDepth / Math.max(perspectiveScale - 1, 0.001);
  const perspectiveNear =
    projectionCube?.perspectiveProjection?.near ??
    Math.max(perspectiveFrontDistance - 0.001, 0.001);
  const perspectiveFar =
    projectionCube?.perspectiveProjection?.far ??
    perspectiveFrontDistance + volumeDepth + 0.001;
  const perspectiveFov =
    projectionCube?.perspectiveProjection?.fov ??
    (2 *
      Math.atan(
        perspectiveNearFaceHeight /
          (2 * Math.max(perspectiveFrontDistance, 0.001))
      ) *
      180) /
      Math.PI;
  const perspectiveCameraDistance = projectionCube?.perspectiveProjection
    ? (perspectiveNear + perspectiveFar) / 2
    : volumeDepth / 2 + perspectiveFrontDistance;
  const perspectiveCameraAspect =
    projectionCube?.perspectiveProjection?.definition === "bounds"
      ? (projectionCube.perspectiveProjection.right -
          projectionCube.perspectiveProjection.left) /
        (projectionCube.perspectiveProjection.top -
          projectionCube.perspectiveProjection.bottom)
      : cameraAspect;

  return (
    <>
      {/* Floor Grid */}
      <group visible={!minimalView || showGrid}>
        <gridHelper args={[16, 16]} position={[0, 0, 0]} />

        {hasExtendedNegativeZGrid && (
          <>
            {Array.from({ length: 8 }, (_, index) => index + 1).map(
              distance => (
                <Line
                  key={`floor-negative-z-row-${distance}`}
                  points={[
                    [-8, 0, -8 - distance],
                    [8, 0, -8 - distance],
                  ]}
                  color="#888888"
                />
              )
            )}
            {Array.from({ length: 17 }, (_, index) => index - 8).map(x => (
              <Line
                key={`floor-negative-z-column-${x}`}
                points={[
                  [x, 0, -8],
                  [x, 0, -16],
                ]}
                color="#888888"
              />
            ))}
          </>
        )}

        {/* Vertical Grid Wall */}
        <gridHelper
          args={[16, 16]}
          position={[0, 8, hasExtendedNegativeZGrid ? -16 : -8]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <gridHelper
          args={[16, 16]}
          position={[-8, 8, 0]}
          rotation={[0, 0, Math.PI / 2]}
        />
        {hasExtendedNegativeZGrid && (
          <>
            {Array.from({ length: 17 }, (_, index) => index).map(y => (
              <Line
                key={`wall-negative-z-row-${y}`}
                points={[
                  [-8, y, -8],
                  [-8, y, -16],
                ]}
                color="#888888"
              />
            ))}
            {Array.from({ length: 8 }, (_, index) => index + 1).map(
              distance => (
                <Line
                  key={`wall-negative-z-column-${distance}`}
                  points={[
                    [-8, 0, -8 - distance],
                    [-8, 16, -8 - distance],
                  ]}
                  color="#888888"
                />
              )
            )}
          </>
        )}
      </group>

      <group visible={!minimalView}>
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
      </group>

      {parallelProjection ? (
        <OrthographicCamera
          makeDefault
          left={-volumeWidth / 2}
          right={volumeWidth / 2}
          top={volumeHeight / 2}
          bottom={-volumeHeight / 2}
          near={near}
          far={far}
          up={[0, 1, 0]}
          rotation={[0, 0, 0]}
          position={[
            volumeCenter.x,
            volumeCenter.y,
            volumeCenter.z + volumeDepth / 2 + cameraOffset,
          ]}
        />
      ) : perspectiveProjection ? (
        <PerspectiveCamera
          makeDefault
          manual
          aspect={perspectiveCameraAspect}
          fov={perspectiveFov}
          near={perspectiveNear}
          far={perspectiveFar}
          up={[0, 1, 0]}
          rotation={[0, 0, 0]}
          position={[
            volumeCenter.x,
            volumeCenter.y,
            volumeCenter.z + perspectiveCameraDistance,
          ]}
        />
      ) : (
        <PerspectiveCamera
          makeDefault
          position={
            minimalView
              ? SECONDARY_CAMERA_POSITION
              : (cameraPosition ?? [10, 10, 10])
          }
        />
      )}
      {!parallelProjection && !perspectiveProjection && (
        <OrbitControls
          enabled={!isDraggingCube}
          target={cameraTarget}
          enableZoom
          enableRotate
          enablePan={!minimalView}
          mouseButtons={minimalView ? { RIGHT: MOUSE.ROTATE } : undefined}
          minPolarAngle={minimalView ? SECONDARY_CAMERA_POLAR_ANGLE : 0}
          maxPolarAngle={minimalView ? SECONDARY_CAMERA_POLAR_ANGLE : Math.PI}
          minDistance={1}
          maxDistance={100}
        />
      )}

      {/* Example Mesh */}
      {cubes.map(cube => (
        <Cube key={cube.id} cube={cube} onDraggingChange={setIsDraggingCube} />
      ))}
      {showProjectionCube &&
        projectionCubes.map(cube => (
          projectionMode === "perspective" ? (
            <PerspectiveCube
              key={cube.id}
              cube={cube}
              interactive={projectionCubeInteractive}
              onDraggingChange={setIsDraggingCube}
            />
          ) : (
            <ParallelCube
              key={cube.id}
              cube={cube}
              interactive={projectionCubeInteractive}
              onDraggingChange={setIsDraggingCube}
            />
          )
        ))}

      {planes?.map(plane => (
        <CustomPlane3D key={plane.id} plane={plane} />
      ))}

      <group visible={!minimalView}>
        {/* Render X-axis labels */}
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

        {/* Render Y-axis labels */}
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

        {/* Render Z-axis labels, including the extended negative range */}
        {Array.from(
          { length: hasExtendedNegativeZGrid ? 25 : 17 },
          (_, i) => i + (hasExtendedNegativeZGrid ? -16 : -8)
        ).map(i => (
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

        {Array.from(
          { length: hasExtendedNegativeZGrid ? 25 : 17 },
          (_, i) => i + (hasExtendedNegativeZGrid ? -16 : -8)
        ).map(i => (
          <mesh key={i} position={[0, 0, i]}>
            <lineBasicMaterial color="blue" />
            <boxGeometry args={[0.05, 0.2, 0.05]} />
          </mesh>
        ))}
      </group>

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[2, 5, 1]} intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </>
  );
}
