import { Polygon, Polyline } from "mafs";
import { TArc } from "@/types/Scene2DConfig";

const ARC_SEGMENTS = 24;
const ARROWHEAD_LENGTH = 0.22;
const ARROWHEAD_WIDTH = 0.09;

/** Resolves `toAngle` onto the correct side of `fromAngle` for the given
 * sweep direction, wrapping by 360° as needed — so callers can pass any two
 * angles and the arc still sweeps the intended way, not just the raw
 * numeric difference. */
function resolveSweepEnd(
  fromAngle: number,
  toAngle: number,
  direction: TArc["direction"]
): number {
  let end = toAngle;
  if (direction === "counterclockwise") {
    while (end <= fromAngle) end += 360;
  } else {
    while (end >= fromAngle) end -= 360;
  }
  return end;
}

export default function CustomArc({ arc }: { arc: TArc }) {
  const { center, radius, fromAngle, direction, color = "black" } = arc;
  const toAngle = resolveSweepEnd(fromAngle, arc.toAngle, direction);

  const points: [number, number][] = Array.from(
    { length: ARC_SEGMENTS + 1 },
    (_, i) => {
      const t = i / ARC_SEGMENTS;
      const angleDeg = fromAngle + (toAngle - fromAngle) * t;
      const angleRad = (angleDeg * Math.PI) / 180;
      return [
        center[0] + radius * Math.cos(angleRad),
        center[1] + radius * Math.sin(angleRad),
      ];
    }
  );

  const endAngleRad = (toAngle * Math.PI) / 180;
  const tip = points[points.length - 1];
  // Direction of travel at the arc's end (tangent to the circle).
  const travelAngleRad =
    endAngleRad + (direction === "counterclockwise" ? Math.PI / 2 : -Math.PI / 2);
  const back: [number, number] = [
    tip[0] - ARROWHEAD_LENGTH * Math.cos(travelAngleRad),
    tip[1] - ARROWHEAD_LENGTH * Math.sin(travelAngleRad),
  ];
  const perpendicular = [-Math.sin(travelAngleRad), Math.cos(travelAngleRad)];
  const base1: [number, number] = [
    back[0] + ARROWHEAD_WIDTH * perpendicular[0],
    back[1] + ARROWHEAD_WIDTH * perpendicular[1],
  ];
  const base2: [number, number] = [
    back[0] - ARROWHEAD_WIDTH * perpendicular[0],
    back[1] - ARROWHEAD_WIDTH * perpendicular[1],
  ];

  return (
    <>
      <Polyline points={points} color={color} weight={2.5} />
      <Polygon points={[tip, base1, base2]} color={color} fillOpacity={1} />
    </>
  );
}
