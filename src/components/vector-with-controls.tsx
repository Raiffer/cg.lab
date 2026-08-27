import { TVector } from "@/types/Scene2DConfig";
import { LaTeX, MovablePoint, Transform, Vector } from "mafs";
import { useScene2DStore } from "@/store/scene2DStore";

const isValidPoint = (point: unknown): point is [number, number] =>
  Array.isArray(point) &&
  point.length === 2 &&
  point.every(value => typeof value === "number" && Number.isFinite(value));

export default function VectorWithControls({ vector }: { vector: TVector }) {
  const { setVectorTail, setVectorTip } = useScene2DStore();

  const validVector = isValidPoint(vector.tail) && isValidPoint(vector.tip);

  if (!validVector) {
    console.error("Coordenadas inválidas:", {
      id: vector.id,
      tail: vector.tail,
      tip: vector.tip,
    });
    return null;
  }

  const dx = vector.tip[0] - vector.tail[0];
  const dy = vector.tip[1] - vector.tail[1];
  const length = Math.hypot(dx, dy);

  const middle: [number, number] = [
    (vector.tail[0] + vector.tip[0]) / 2,
    (vector.tail[1] + vector.tip[1]) / 2,
  ];

  const translate: [number, number] =
    length > 0 && Number.isFinite(length)
      ? [(-dy / length) * 0.5, (dx / length) * 0.5]
      : [0, 0];

  const constrain = ([x, y]: [number, number]): [number, number] => [
    Math.round(x / 0.5) * 0.5,
    Math.round(y / 0.5) * 0.5,
  ];

  return (
    <>
      <Vector tail={vector.tail} tip={vector.tip} color={vector.color} />

      {vector.label && (
        <Transform translate={translate}>
          <LaTeX at={middle} tex={vector.label} />
        </Transform>
      )}

      {vector.tailMovable && (
        <MovablePoint
          point={vector.tail}
          constrain={constrain}
          onMove={position => {
            if (isValidPoint(position)) {
              setVectorTail(vector.id, position);
            }
          }}
        />
      )}

      {vector.tipMovable && (
        <MovablePoint
          point={vector.tip}
          constrain={constrain}
          onMove={position => {
            if (isValidPoint(position)) {
              setVectorTip(vector.id, position);
            }
          }}
        />
      )}
    </>
  );
}
