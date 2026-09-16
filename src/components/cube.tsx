import { degreesToRadians } from "@/lib/utils";
import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Billboard, Edges, Line, Text } from "@react-three/drei";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Color, Euler, Matrix4, Mesh, Plane, Vector3 } from "three";
import type { ThreeEvent } from "@react-three/fiber";

type PointerCaptureTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void;
  releasePointerCapture: (pointerId: number) => void;
};

interface Props {
  cube: TCube;
  onDraggingChange?: (dragging: boolean) => void;
}

export default function Cube({ cube, onDraggingChange }: Props) {
  const cubeRef = useRef<Mesh>(null);
  const labelRef = useRef<Mesh>(null);
  const positionLabelRef = useRef<Mesh>(null);
  const isDragging = useRef(false);
  const isScaling = useRef(false);
  const scalingStartDistance = useRef(1);
  const scalingStartValue = useRef(1);
  const moveCubeXZ = useScene3DStore(state => state.moveCubeXZ);
  const moveCubeY = useScene3DStore(state => state.moveCubeY);
  const scaleCubeUniform = useScene3DStore(state => state.scaleCubeUniform);
  const setCubeInteractionMode = useScene3DStore(
    state => state.setCubeInteractionMode
  );
  const {
    id,
    position,
    translation,
    rotation,
    scale,
    size,
    color,
    opacity = 1,
    displayPosition = true,
    customXRotationMatrix,
    customYRotationMatrix,
    customZRotationMatrix,
    displayCustomAxes,
    interaction,
  } = cube;
  const [worldPosition, setWorldPosition] = useState<Vector3>(
    position.clone().add(translation)
  );
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const isMovableMode = interaction?.mode === "move";
  const isScalableModeActive = interaction?.mode === "scale";
  const canSwitchMode = interaction?.allowModeSwitch === true;
  const highlightedColor = new Color(color).lerp(new Color("white"), 0.45);

  useEffect(() => {
    if (!interaction) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift" && isMovableMode) {
        setIsShiftPressed(true);
      }
      if (event.key.toLowerCase() === "e" && canSwitchMode) {
        if (isDragging.current || isScaling.current) return;
        const nextMode = interaction.mode === "move" ? "scale" : "move";
        setCubeInteractionMode(cube.id, nextMode);
        setIsShiftPressed(false);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") setIsShiftPressed(false);
    };
    const handleWindowBlur = () => setIsShiftPressed(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [cube.id, interaction, canSwitchMode, setCubeInteractionMode]);

  useLayoutEffect(() => {
    for (const textMesh of [labelRef.current, positionLabelRef.current]) {
      if (!textMesh) continue;

      textMesh.renderOrder = 9999;
      const materials = Array.isArray(textMesh.material)
        ? textMesh.material
        : [textMesh.material];

      for (const material of materials) {
        material.depthTest = false;
        material.depthWrite = false;
      }
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!isMovableMode) return;
    event.stopPropagation();
    isDragging.current = true;
    onDraggingChange?.(true);
    (event.target as PointerCaptureTarget).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isMovableMode || !isDragging.current) return;

    const intersection = new Vector3();
    const shiftPressed = event.nativeEvent.shiftKey;
    const movementPlane = shiftPressed
      ? new Plane().setFromNormalAndCoplanarPoint(
          event.camera.getWorldDirection(new Vector3()),
          worldPosition
        )
      : new Plane(new Vector3(0, 1, 0), -worldPosition.y);
    if (event.ray.intersectPlane(movementPlane, intersection)) {
      if (shiftPressed) {
        moveCubeY(cube.id, intersection.y);
      } else {
        moveCubeXZ(cube.id, intersection.x, intersection.z);
      }
    }
  };

  const stopDragging = (event: ThreeEvent<PointerEvent>) => {
    if (!isMovableMode) return;
    isDragging.current = false;
    onDraggingChange?.(false);
    (event.target as PointerCaptureTarget).releasePointerCapture(
      event.pointerId
    );
  };

  const handleScalePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!isScalableModeActive) return;
    event.stopPropagation();
    isScaling.current = true;
    const scalingPlane = new Plane().setFromNormalAndCoplanarPoint(
      event.camera.getWorldDirection(new Vector3()),
      worldPosition
    );
    const startPoint = new Vector3();
    if (!event.ray.intersectPlane(scalingPlane, startPoint)) return;
    scalingStartDistance.current = Math.max(
      startPoint.distanceTo(worldPosition),
      0.001
    );
    scalingStartValue.current = scale.x;
    onDraggingChange?.(true);
    (event.target as PointerCaptureTarget).setPointerCapture(event.pointerId);
  };

  const handleScalePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isScalableModeActive || !isScaling.current) return;

    const scalingPlane = new Plane().setFromNormalAndCoplanarPoint(
      event.camera.getWorldDirection(new Vector3()),
      worldPosition
    );
    const currentPoint = new Vector3();
    if (!event.ray.intersectPlane(scalingPlane, currentPoint)) return;

    const distance = currentPoint.distanceTo(worldPosition);
    const proportionalScale =
      scalingStartValue.current * (distance / scalingStartDistance.current);
    const steppedScale = Math.round(proportionalScale * 2) / 2;
    const clampedScale = Math.max(0.5, Math.min(4, steppedScale));
    scaleCubeUniform(cube.id, clampedScale);
  };

  const stopScaling = (event: ThreeEvent<PointerEvent>) => {
    if (!isScaling.current) return;
    isScaling.current = false;
    onDraggingChange?.(false);
    (event.target as PointerCaptureTarget).releasePointerCapture(
      event.pointerId
    );
  };

  useEffect(() => {
    if (!cubeRef.current) return;

    const worldP = position.clone().add(translation);
    setWorldPosition(worldP);

    // Create individual transformation matrices
    const translationMatrix = new Matrix4().makeTranslation(
      worldP.x,
      worldP.y,
      worldP.z
    );

    const rotationMatrix = new Matrix4().makeRotationFromEuler(
      new Euler(
        degreesToRadians(rotation.x),
        degreesToRadians(rotation.y),
        degreesToRadians(rotation.z)
      )
    );

    const scaleMatrix = new Matrix4().makeScale(scale.x, scale.y, scale.z);

    const modelMatrix = new Matrix4().identity();
    modelMatrix.multiply(translationMatrix);

    if (customXRotationMatrix) {
      modelMatrix.multiply(customXRotationMatrix);
    } else if (customYRotationMatrix) {
      modelMatrix.multiply(customYRotationMatrix);
    } else if (customZRotationMatrix) {
      modelMatrix.multiply(customZRotationMatrix);
    } else {
      modelMatrix.multiply(rotationMatrix);
    }

    modelMatrix.multiply(scaleMatrix);

    // Apply the resulting matrix to the mesh
    cubeRef.current.matrixAutoUpdate = false; // Disable Three.js auto-updates
    cubeRef.current.matrix.copy(modelMatrix); // Apply the custom model matrix
  }, [
    position,
    translation,
    rotation,
    scale,
    customXRotationMatrix,
    customYRotationMatrix,
    customZRotationMatrix,
  ]);

  return (
    <>
      {/* Cube Mesh */}
      <mesh ref={cubeRef} userData={{ id }}>
        <boxGeometry args={[size.x, size.y, size.z]} />
        <meshPhongMaterial
          color={isShiftPressed ? highlightedColor : color}
          opacity={opacity}
          transparent
        />
        <Edges threshold={1} color="white" scale={1.001} />

        {/* Interaction area limited to the cube geometry */}
        <mesh
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onPointerOver={() => {
            if (isMovableMode) document.body.style.cursor = "grab";
          }}
          onPointerOut={() => {
            if (isMovableMode && !isDragging.current) {
              document.body.style.cursor = "default";
            }
          }}
        >
          <boxGeometry args={[size.x, size.y, size.z]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Render arrows with cylinders and cones for each axis */}
        {isMovableMode && displayCustomAxes ? (
          <>
            {!isShiftPressed && (
              <group>
                <mesh
                  position={[size.x / 2, 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.05, 0.05, size.x, 8]} />
                  <meshStandardMaterial
                    color="#ff1a1a"
                    emissive="#ff0000"
                    emissiveIntensity={0.8}
                    opacity={1}
                  />
                </mesh>
                <mesh position={[size.x, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.1, 0.2, 8]} />
                  <meshStandardMaterial
                    color="#ff1a1a"
                    emissive="#ff0000"
                    emissiveIntensity={0.8}
                    opacity={1}
                  />
                </mesh>
              </group>
            )}
            {isShiftPressed && (
              <group>
                <mesh
                  position={[0, size.y / 2, 0]}
                  rotation={[0, Math.PI / 2, 0]}
                >
                  <cylinderGeometry args={[0.05, 0.05, size.y, 8]} />
                  <meshStandardMaterial
                    color="#19ff4f"
                    emissive="#00ff22"
                    emissiveIntensity={0.8}
                    opacity={1}
                  />
                </mesh>
                <mesh position={[0, size.y, 0]} rotation={[0, -Math.PI / 2, 0]}>
                  <coneGeometry args={[0.1, 0.2, 8]} />
                  <meshStandardMaterial
                    color="#19ff4f"
                    emissive="#00ff22"
                    emissiveIntensity={0.8}
                    opacity={1}
                  />
                </mesh>
              </group>
            )}
            {!isShiftPressed && (
              <group>
                <mesh
                  position={[0, 0, size.z / 2]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.05, 0.05, size.z, 8]} />
                  <meshStandardMaterial
                    color="#1a4dff"
                    emissive="#003cff"
                    emissiveIntensity={0.8}
                    opacity={1}
                  />
                </mesh>
                <mesh position={[0, 0, size.z]} rotation={[Math.PI / 2, 0, 0]}>
                  <coneGeometry args={[0.1, 0.2, 8]} />
                  <meshStandardMaterial
                    color="#1a4dff"
                    emissive="#003cff"
                    emissiveIntensity={0.8}
                    opacity={1}
                  />
                </mesh>
              </group>
            )}
          </>
        ) : isMovableMode ? (
          <axesHelper args={[2]} />
        ) : null}

        {isScalableModeActive && (
          <group>
            {[
              [-size.x / 2, -size.y / 2, size.z / 2],
              [-size.x / 2, size.y / 2, size.z / 2],
              [size.x / 2, -size.y / 2, size.z / 2],
              [size.x / 2, size.y / 2, size.z / 2],
              [-size.x / 2, -size.y / 2, -size.z / 2],
              [-size.x / 2, size.y / 2, -size.z / 2],
              [size.x / 2, -size.y / 2, -size.z / 2],
              [size.x / 2, size.y / 2, -size.z / 2],
            ].map((point, index) => (
              <mesh
                key={index}
                position={point as [number, number, number]}
                scale={[
                  1 / Math.max(Math.abs(scale.x), 0.001),
                  1 / Math.max(Math.abs(scale.y), 0.001),
                  1 / Math.max(Math.abs(scale.z), 0.001),
                ]}
                onPointerDown={handleScalePointerDown}
                onPointerMove={handleScalePointerMove}
                onPointerUp={stopScaling}
                onPointerCancel={stopScaling}
                onPointerOver={() => {
                  document.body.style.cursor = "grab";
                }}
                onPointerOut={() => {
                  if (!isScaling.current)
                    document.body.style.cursor = "default";
                }}
              >
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ))}
          </group>
        )}
      </mesh>

      {Math.abs(worldPosition.y) >= 1 && (
        <>
          <Line
            points={[
              [worldPosition.x, 0, worldPosition.z],
              [worldPosition.x, worldPosition.y, worldPosition.z],
            ]}
            color="#9ca3af"
            lineWidth={1}
          />
          <mesh
            position={[worldPosition.x, 0, worldPosition.z]}
            renderOrder={9998}
          >
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial
              color="#ff0000"
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* Label Text (Always faces the camera) */}
      <Billboard
        follow
        renderOrder={9999}
        position={[
          worldPosition.x,
          worldPosition.y + (size.y * scale.y) / 2 + 1,
          worldPosition.z,
        ]}
      >
        <Text
          ref={labelRef}
          color="white"
          fontSize={0.4}
          outlineWidth={0.02}
          outlineColor="black"
          renderOrder={9999}
          depthOffset={-9999}
          material-depthTest={false}
          material-depthWrite={false}
        >
          {cube.label}
        </Text>
      </Billboard>

      {displayPosition && isMovableMode && (
        <Billboard
          follow
          renderOrder={1000}
          position={[
            worldPosition.x,
            worldPosition.y - (size.y * scale.y) / 2 - 0.5,
            worldPosition.z,
          ]}
        >
          <Text
            ref={positionLabelRef}
            color="white"
            fontSize={0.5}
            outlineWidth={0.02}
            outlineColor="black"
            depthOffset={-1000}
            material-depthTest={false}
          >
            {`(${worldPosition.x.toFixed(2)}, ${worldPosition.y.toFixed(
              2
            )}, ${worldPosition.z.toFixed(2)})`}
          </Text>
        </Billboard>
      )}
    </>
  );
}
