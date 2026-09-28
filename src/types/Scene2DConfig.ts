import { Matrix3 } from "three";

export type TPoint = {
  id: string;
  position: [number, number];
  translation?: [number, number];
  scale?: [number, number];
  movable: boolean;
  constraints?: {
    roundCoordinates?: boolean;
  };
  label?: string;
  color?: string;
};

export type TVector = {
  id: string;
  tail: [number, number];
  tip: [number, number];
  followPolygonId?: string;
  tailMovable?: boolean;
  tipMovable?: boolean;
  middleMovable?: boolean;
  color?: string;
  label?: string;
  /** Where the label sits relative to the vector. Defaults to "middle"
   * (existing behavior everywhere) — "tip" places it right next to the
   * arrowhead, for exercises where distinguishing which vector is which
   * matters more than reading its magnitude at a glance. */
  labelPosition?: "middle" | "tip";
  showValue?: boolean;
};

/** A curved arrow showing the rotation from one direction to another
 * (e.g. "turning L1 until it lines up with L2") — the arc always sweeps
 * the SHORT way between the two angles, in the given direction. */
export type TArc = {
  id: string;
  center: [number, number];
  radius: number;
  fromAngle: number; // degrees
  toAngle: number; // degrees
  direction: "clockwise" | "counterclockwise";
  color?: string;
};

/** An infinite line through two points (extends to the edges of the view,
 * not just the segment between them) — for showing a linear equation
 * ax + by = c as what it actually is geometrically, not just a segment. */
export type TLine = {
  id: string;
  point1: [number, number];
  point2: [number, number];
  color?: string;
  style?: "solid" | "dashed";
  /** Stroke thickness. Useful for telling two lines apart when they land
   * exactly on top of each other (a thick solid line under a thin dashed
   * one still shows both colors, striped, instead of one hiding the other). */
  weight?: number;
  label?: string;
};

export type TPolygon = {
  id: string;
  points: TPoint[];
  originalPoints?: TPoint[];
  color?: string;
  opacity?: number;
  strokeStyle?: "solid" | "dashed";
  movable?: boolean;
  fullMovable?: boolean;
  scale?: [number, number];
  rotation?: number;
  translation?: [number, number];
  rotationMatrix?: Matrix3;
  displayAxes?: boolean;
};

export type Annotation = {
  type: "LaTeX";
  position: "relative" | "absolute";
  text: string;
  point_reference: string;
  offset?: [number, number];
};

export type Scene2DConfig = {
  pan?: boolean;
  viewBox: {
    x: [number, number];
    y: [number, number];
  };
  grid: {
    subdivisions: number;
  };
  points?: TPoint[];
  vectors?: TVector[];
  polygons?: TPolygon[];
  objectivePolygons?: TPolygon[];
  annotations?: Annotation[];
  arcs?: TArc[];
  lines?: TLine[];
};
