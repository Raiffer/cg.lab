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
  tailMovable?: boolean;
  tipMovable?: boolean;
  middleMovable?: boolean;
  color?: string;
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
};
