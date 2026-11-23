import { Vector3 } from "three";

type FeedbackText = string | (() => string);

/** Resolves a feedback field that may be a plain string or a function called
 * at render time (for feedback that depends on live store state, e.g. which
 * wrong option was picked). */
export function resolveFeedback(text: FeedbackText | undefined): string | undefined {
  if (typeof text === "function") return text();
  return text;
}

export function getRandomIntInRange(min: number, max: number): number {
  // Swap min and max if they're in the wrong order
  const [realMin, realMax] = min <= max ? [min, max] : [max, min];
  const value = Math.floor(Math.random() * (realMax - realMin + 1)) + realMin;
  return value;
}

export function getRandomFloatConstrained(min: number, max: number): number {
  // Swap min and max if they're in the wrong order
  const [realMin, realMax] = min <= max ? [min, max] : [max, min];
  const value = Math.random() * (realMax - realMin) + realMin;
  // Round to the nearest 0.5 and not allow 0.0
  const roundedValue = Math.round(value * 2) / 2;
  return roundedValue === 0 ? 0.5 : roundedValue;
}

export function getRandomVector(
  range: readonly [number, number]
): [number, number] {
  // make sure the vector is not the zero vector
  let x, y;
  do {
    x = getRandomIntInRange(range[0], range[1]);
    y = getRandomIntInRange(range[0], range[1]);
  } while (x === 0 && y === 0);
  return [x, y];
}

export function getRandomVectorWithTailAndTip(
  range: readonly [number, number]
): {
  tail: [number, number];
  tip: [number, number];
} {
  // make sure the vector tail and tip are not the same
  let tail, tip;
  do {
    tail = getRandomVector(range);
    tip = getRandomVector(range);
  } while (tail[0] === tip[0] && tail[1] === tip[1]);
  return { tail, tip };
}

export function getRandomCoords(
  range: readonly [number, number]
): [number, number] {
  return [
    getRandomIntInRange(range[0], range[1]),
    getRandomIntInRange(range[0], range[1]),
  ];
}

export function getRandomVector3(range: readonly [number, number]): Vector3 {
  return new Vector3(
    getRandomIntInRange(range[0], range[1]),
    getRandomIntInRange(range[0], range[1]),
    getRandomIntInRange(range[0], range[1])
  );
}

export const generateAssignmentId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).substring(7)}`;

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateSquarePoints = (
  centerPos: [number, number],
  size: [number, number]
): [number, number][] => {
  const centerX = centerPos[0];
  const centerY = centerPos[1];
  const sizeX = size[0];
  const sizeY = size[1];

  // Calculate square vertices based on the center and size
  return [
    [centerX - sizeX / 2, centerY - sizeY / 2],
    [centerX + sizeX / 2, centerY - sizeY / 2],
    [centerX + sizeX / 2, centerY + sizeY / 2],
    [centerX - sizeX / 2, centerY + sizeY / 2],
  ];
};

export type TriangleType = "equilateral" | "isosceles" | "scalene";

function roundToHalf(value: number): number {
  // Round to the nearest 0.5
  return Math.round(value * 2) / 2;
}

export function generateTrianglePoints(
  centerPos: [number, number],
  triangleType: TriangleType,
  size: number = 1
): [number, number][] {
  const [cx, cy] = centerPos;
  let points: [number, number][];

  switch (triangleType) {
    case "equilateral":
      // Equilateral triangle points
      points = [
        [cx, cy - (size * Math.sqrt(3)) / 3], // Top vertex
        [cx - size / 2, cy + (size * Math.sqrt(3)) / 6], // Bottom left vertex
        [cx + size / 2, cy + (size * Math.sqrt(3)) / 6], // Bottom right vertex
      ];
      break;

    case "isosceles":
      // Isosceles triangle points
      points = [
        [cx, cy - size / 2], // Top vertex
        [cx - size / 2, cy + size / 2], // Bottom left vertex
        [cx + size / 2, cy + size / 2], // Bottom right vertex
      ];
      break;

    case "scalene":
      // Scalene triangle points (arbitrary points)
      points = [
        [cx, cy - size / 2], // Top vertex
        [cx - size / 3, cy + size / 2], // Bottom left vertex
        [cx + size / 2, cy + size / 4], // Bottom right vertex
      ];
      break;

    default:
      throw new Error("Invalid triangle type");
  }

  // Round all points to the nearest 0.5
  return points.map(([x, y]) => [roundToHalf(x), roundToHalf(y)]);
}
