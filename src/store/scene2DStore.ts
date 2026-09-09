import {
  Scene2DConfig,
  TPoint,
  TPolygon,
  TVector,
} from "@/types/Scene2DConfig";
import { Matrix3 } from "three";
import { create } from "zustand";

type Scene2DStore = {
  config: Scene2DConfig;
  setConfig: (config: Scene2DConfig) => void;
  setPoints: (points: Scene2DConfig["points"]) => void;
  setPointTranslation: (id: string, translation: [number, number]) => void;
  setPointScale: (id: string, scale: [number, number]) => void;
  setVectors: (vectors: Scene2DConfig["vectors"]) => void;
  addVector: (vector: TVector) => void;
  setPolygons: (polygons: Scene2DConfig["polygons"]) => void;
  addPolygon: (polygon: TPolygon) => void;
  setPolygonScale: (id: string, scale: [number, number]) => void;
  setPolygonRotation: (id: string, rotation: number) => void;
  setPolygonTranslation: (id: string, translation: [number, number]) => void;
  setPolygonPoints: (id: string, points: TPolygon["points"]) => void;
  setPolygonRotationMatrix: (id: string, rotationMatrix?: Matrix3) => void;
  setObjectivePolygons: (polygons: Scene2DConfig["objectivePolygons"]) => void;
  getObjectivePolygon: (id: string) => TPolygon | undefined;
  setAnnotations: (annotations: Scene2DConfig["annotations"]) => void;
  movePoint: (id: string, position: [number, number]) => void;
  movePolygonPoint: (
    polygonId: string,
    pointId: string,
    position: [number, number]
  ) => void;
  movePolygon: (polygonId: string, delta: [number, number]) => void;
  moveVector: (
    id: string,
    tail: [number, number],
    tip: [number, number]
  ) => void;
  setVectorTail: (id: string, tail: [number, number]) => void;
  setVectorTip: (id: string, tip: [number, number]) => void;
  setVectorLabel: (id: string, label: string) => void;
  getPoint: (id: string) => TPoint | undefined;
  getVector: (id: string) => TVector | undefined;
  getPolygon: (id: string) => TPolygon | undefined;
  setViewBox: (viewBox: Scene2DConfig["viewBox"]) => void;
  reset: () => void;
};

const initialState: Scene2DConfig = {
  pan: true,
  viewBox: {
    x: [-10, 10],
    y: [-7, 7],
  },
  grid: {
    subdivisions: 2,
  },
};

export const useScene2DStore = create<Scene2DStore>((set, get) => ({
  config: initialState,
  setConfig: config => set({ config }),
  setPoints: points => set(state => ({ config: { ...state.config, points } })),
  setPointTranslation: (id, translation) =>
    set(state => ({
      config: {
        ...state.config,
        points: state.config.points?.map(point =>
          point.id === id ? { ...point, translation } : point
        ),
      },
    })),
  setPointScale: (id, scale) =>
    set(state => ({
      config: {
        ...state.config,
        points: state.config.points?.map(point =>
          point.id === id ? { ...point, scale } : point
        ),
      },
    })),
  setVectors: vectors =>
    set(state => ({ config: { ...state.config, vectors } })),
  addVector: vector =>
    set(state => ({
      config: {
        ...state.config,
        vectors: [...(state.config.vectors || []), vector],
      },
    })),
  setPolygons: polygons =>
    set(state => ({
      config: {
        ...state.config,
        polygons: polygons?.map(p => ({ ...p, originalPoints: p.points })),
      },
    })),
  addPolygon: polygon =>
    set(state => ({
      config: {
        ...state.config,
        polygons: [
          ...(state.config.polygons || []),
          { ...polygon, originalPoints: polygon.points },
        ],
      },
    })),
  setPolygonScale: (id, scale) =>
    set(state => ({
      config: {
        ...state.config,
        polygons: state.config.polygons?.map(polygon =>
          polygon.id === id ? { ...polygon, scale } : polygon
        ),
      },
    })),
  setPolygonRotation: (id, rotation) =>
    set(state => ({
      config: {
        ...state.config,
        polygons: state.config.polygons?.map(polygon =>
          polygon.id === id ? { ...polygon, rotation } : polygon
        ),
      },
    })),
  setPolygonTranslation: (id, translation) =>
    set(state => ({
      config: {
        ...state.config,
        polygons: state.config.polygons?.map(polygon =>
          polygon.id === id ? { ...polygon, translation } : polygon
        ),
      },
    })),
  setPolygonPoints: (id, points) =>
    set(state => ({
      config: {
        ...state.config,
        polygons: state.config.polygons?.map(polygon =>
          polygon.id === id ? { ...polygon, points } : polygon
        ),
      },
    })),
  setPolygonRotationMatrix: (id, rotationMatrix) =>
    set(state => ({
      config: {
        ...state.config,
        polygons: state.config.polygons?.map(polygon =>
          polygon.id === id ? { ...polygon, rotationMatrix } : polygon
        ),
      },
    })),
  setObjectivePolygons: objectivePolygons =>
    set(state => ({ config: { ...state.config, objectivePolygons } })),
  getObjectivePolygon: id =>
    get().config.objectivePolygons?.find(polygon => polygon.id === id),
  setAnnotations: annotations =>
    set(state => ({ config: { ...state.config, annotations } })),
  movePoint: (id, position) =>
    set(state => ({
      config: {
        ...state.config,
        points: state.config.points?.map(point =>
          point.id === id ? { ...point, position: position } : point
        ),
      },
    })),
  movePolygonPoint: (polygonId, pointId, position) => {
    set(state => ({
      config: {
        ...state.config,
        polygons: state.config.polygons?.map(polygon =>
          polygon.id === polygonId
            ? {
                ...polygon,
                points: polygon.points.map(point =>
                  point.id === pointId ? { ...point, position } : point
                ),
              }
            : polygon
        ),
      },
    }));
  },
  movePolygon: (polygonId, delta) => {
    set(state => ({
      config: {
        ...state.config,
        polygons: state.config.polygons?.map(polygon =>
          polygon.id === polygonId
            ? {
                ...polygon,
                points: polygon.points.map(point => ({
                  ...point,
                  position: [
                    point.position[0] + delta[0],
                    point.position[1] + delta[1],
                  ] as [number, number],
                })),
              }
            : polygon
        ),
      },
    }));
  },
  moveVector: (id, tail, tip) =>
    set(state => ({
      config: {
        ...state.config,
        vectors: state.config.vectors?.map(vector =>
          vector.id === id ? { ...vector, tail, tip } : vector
        ),
      },
    })),
  setVectorTail: (id, tail) =>
    set(state => ({
      config: {
        ...state.config,
        vectors: state.config.vectors?.map(vector =>
          vector.id === id ? { ...vector, tail } : vector
        ),
      },
    })),
  setVectorTip: (id, tip) =>
    set(state => ({
      config: {
        ...state.config,
        vectors: state.config.vectors?.map(vector =>
          vector.id === id ? { ...vector, tip } : vector
        ),
      },
    })),
  setVectorLabel: (id, label) => {
    set(state => ({
      config: {
        ...state.config,
        vectors: state.config.vectors?.map(vector =>
          vector.id === id ? { ...vector, label } : vector
        ),
      },
    }));
  },
  getPoint: id => get().config.points?.find(point => point.id === id),
  getVector: id => get().config.vectors?.find(vector => vector.id === id),
  getPolygon: id => get().config.polygons?.find(polygon => polygon.id === id),
  setViewBox: viewBox =>
    set(state => ({ config: { ...state.config, viewBox } })),
  reset: () => set({ config: initialState }),
}));
