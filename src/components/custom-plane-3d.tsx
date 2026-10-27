import { TPlane } from "@/store/scene3DStore";
import { Billboard, Edges, Text } from "@react-three/drei";
import { useMemo } from "react";
import { DoubleSide, Quaternion, Vector3 } from "three";

export default function CustomPlane3D({ plane }: { plane: TPlane }) {
  const { a, b, c, d, color, opacity = 0.35, label, labelPosition } = plane;

  const { position, quaternion } = useMemo(() => {
    const normal = new Vector3(a, b, c);
    const lengthSq = normal.lengthSq();
    // The point on the plane closest to the origin: k * normal, solved from
    // (k * normal) . normal = d.
    const k = lengthSq > 1e-9 ? d / lengthSq : 0;
    const position = normal.clone().multiplyScalar(k);
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 0, 1),
      normal.clone().normalize()
    );
    return { position, quaternion };
  }, [a, b, c, d]);

  const anchor = labelPosition
    ? new Vector3(...labelPosition)
    : position;

  return (
    <>
      <mesh position={position} quaternion={quaternion}>
        <planeGeometry args={[14, 14]} />
        <meshPhongMaterial
          color={color}
          opacity={opacity}
          transparent
          side={DoubleSide}
        />
        <Edges threshold={1} color={color} scale={1.001} />
      </mesh>
      {label && (
        <Billboard follow position={anchor}>
          <Text color={color} fontSize={0.5} outlineColor="black" outlineWidth={0.02}>
            {label}
          </Text>
        </Billboard>
      )}
    </>
  );
}
