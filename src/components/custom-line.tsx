import { Line, LaTeX } from "mafs";
import { TLine } from "@/types/Scene2DConfig";

/**
 * Where `pointsOnLine` (in the exercises that call `setLines`) samples
 * point1/point2 at x=±8 (or y=±6 for a vertical line) so `Line.ThroughPoints`
 * has two points to infer direction from — NOT because that range is
 * actually visible. Placing the label at the raw midpoint of those samples
 * lands it at x=0 (or y=0), exactly where Mafs draws the axis tick numbers.
 * A single fixed offset isn't enough either: a line can cross the OTHER
 * axis at that same offset (e.g. x+y=4 crosses the x-axis near x=4), and a
 * steep line's point at a given x can fall way outside the visible y range
 * (or vice-versa for a shallow line and a given y).
 *
 * So instead, this searches a handful of candidate points ALONG the actual
 * line (solving its equation for a candidate x, then — if none of those
 * work — for a candidate y) and keeps the first one that both clears the
 * axes and stays within the app's default visible viewBox. Any point that
 * satisfies the line's own direction vector is still a valid point on the
 * (infinite) line, so every candidate is "correct", just some read better.
 */
const CANDIDATE_OFFSETS = [2, -2, 4, -4, 1.5, -1.5, 6, -6, 3, -3];
const MIN_AXIS_DISTANCE = 1.2;
// A bit inside the app's default viewBox ([-10, 10] x [-7, 7]) so the label
// never sits right at the edge of what's visible.
const VISIBLE_HALF_WIDTH = 8.5;
const VISIBLE_HALF_HEIGHT = 5.5;

function isClearOfAxes(x: number, y: number): boolean {
  return Math.abs(x) >= MIN_AXIS_DISTANCE && Math.abs(y) >= MIN_AXIS_DISTANCE;
}

function isOnScreen(x: number, y: number): boolean {
  return Math.abs(x) <= VISIBLE_HALF_WIDTH && Math.abs(y) <= VISIBLE_HALF_HEIGHT;
}

/** Rotates the candidate order per line (seeded by its id) so two lines
 * that happen to cross exactly at a candidate offset don't both plant
 * their label on that same intersection point. */
function candidateOrderFor(id: string): number[] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % CANDIDATE_OFFSETS.length;
  }
  const start = Math.abs(hash) % CANDIDATE_OFFSETS.length;
  return [
    ...CANDIDATE_OFFSETS.slice(start),
    ...CANDIDATE_OFFSETS.slice(0, start),
  ];
}

function chooseLabelAnchor(
  id: string,
  point1: [number, number],
  point2: [number, number]
): [number, number] {
  const dx = point2[0] - point1[0];
  const dy = point2[1] - point1[1];
  const offsets = candidateOrderFor(id);

  // Pick a candidate x (within the visible range) and solve the line for y.
  if (Math.abs(dx) > 1e-9) {
    const slope = dy / dx;
    for (const x of offsets) {
      const y = point1[1] + slope * (x - point1[0]);
      if (isClearOfAxes(x, y) && isOnScreen(x, y)) return [x, y];
    }
  }

  // Covers vertical lines, and steep lines where every x candidate above
  // landed off-screen: pick a candidate y instead and solve for x.
  if (Math.abs(dy) > 1e-9) {
    const inverseSlope = dx / dy;
    for (const y of offsets) {
      const x = point1[0] + inverseSlope * (y - point1[1]);
      if (isClearOfAxes(x, y) && isOnScreen(x, y)) return [x, y];
    }
  }

  // Degenerate fallback (shouldn't normally trigger) — still a valid point
  // on the line, just not guaranteed to be well placed.
  return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
}

export default function CustomLine({ line }: { line: TLine }) {
  const { id, point1, point2, color = "white", style = "solid", weight, label } = line;

  const labelAnchor = chooseLabelAnchor(id, point1, point2);

  return (
    <>
      <Line.ThroughPoints
        point1={point1}
        point2={point2}
        color={color}
        style={style}
        weight={weight}
      />
      {label && <LaTeX at={labelAnchor} tex={label} />}
    </>
  );
}
