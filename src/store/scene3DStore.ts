import { Matrix4, Vector3 } from "three";
import { create } from "zustand";
import {
  createPerspectiveProjectionFromBounds,
  createPerspectiveProjectionParameters,
  getPerspectiveFrustumSize,
  type PerspectiveProjectionParameters,
} from "@/lib/perspective-projection";

export type CubeInteractionMode = "none" | "move" | "scale";

export type CubeInteraction = {
  mode: CubeInteractionMode;
  allowModeSwitch?: boolean;
};

export type TCube = {
  id: string;
  groupId?: string;
  isCentral?: boolean;
  label?: string;
  position: Vector3;
  size: Vector3;
  color: string;
  opacity?: number;
  displayPosition?: boolean;
  translation: Vector3;
  rotation: Vector3;
  scale: Vector3;
  customXRotationMatrix?: Matrix4 | null;
  customYRotationMatrix?: Matrix4 | null;
  customZRotationMatrix?: Matrix4 | null;
  displayCustomAxes?: boolean;
  interaction?: CubeInteraction;
};

export type TProjectionCube = {
  id: string;
  position: Vector3;
  translation: Vector3;
  size: Vector3;
  perspectiveProjection?: PerspectiveProjectionParameters;
  scale: Vector3;
  color: string;
};

export type ProjectionMode = "parallel" | "perspective";

export type TProjectionCubeState = Record<ProjectionMode, TProjectionCube[]>;

export type TMovableCube = TCube & {
  interaction: {
    mode: "move";
    allowModeSwitch?: boolean;
  };
};

/** A plane ax + by + cz = d, rendered as a large flat quad oriented by its
 * normal vector (a, b, c) — the 3D equivalent of TLine, for showing a linear
 * equation in 3 variables as what it actually is geometrically. */
export type TPlane = {
  id: string;
  a: number;
  b: number;
  c: number;
  d: number;
  color: string;
  opacity?: number;
  label?: string;
  /** Where to place the label in 3D space. Defaults to the plane's closest
   * point to the origin — pass this explicitly when multiple planes share
   * that point (e.g. all passing through the origin) so labels don't stack
   * on top of each other. */
  labelPosition?: [number, number, number];
};

interface Scene3DStore {
  cubes: TCube[];
  objectiveCubes: TCube[];
  planes: TPlane[];
  /** Overrides the default [10, 10, 10] camera position — for exercises
   * whose geometry looks edge-on / hard to read from the default angle. */
  cameraPosition: [number, number, number] | null;
  projectionCubes: TProjectionCubeState;
  addCube: (cube: TCube) => void;
  addObjectiveCube: (cube: TCube) => void;
  addProjectionCube: (
    mode: ProjectionMode,
    cube: TProjectionCube
  ) => void;
  addPerspectiveCube: (
    cube: Pick<TProjectionCube, "id" | "position" | "color">,
    near: number,
    far: number,
    fovDegrees: number
  ) => void;
  addPerspectiveCubeFromBounds: (
    cube: Pick<TProjectionCube, "id" | "position" | "color">,
    near: number,
    far: number,
    left: number,
    right: number,
    bottom: number,
    top: number
  ) => void;
  getCube: (id: string) => TCube | undefined;
  updateCube: (id: string, cube: TCube) => void;
  moveCubeXZ: (id: string, x: number, z: number) => void;
  moveCubeY: (id: string, y: number) => void;
  scaleCubeUniform: (id: string, scale: number) => void;
  resizeProjectionCube: (
    mode: ProjectionMode,
    id: string,
    size: Vector3,
    position: Vector3,
    perspectiveProjection?: PerspectiveProjectionParameters
  ) => void;
  setCubeInteractionMode: (id: string, mode: CubeInteractionMode) => void;
  setCubeCustomYRotationMatrix: (id: string, matrix: Matrix4 | null) => void;
  setCubeCustomXRotationMatrix: (id: string, matrix: Matrix4 | null) => void;
  setCubeCustomZRotationMatrix: (id: string, matrix: Matrix4 | null) => void;
  setPlanes: (planes: TPlane[]) => void;
  setCameraPosition: (position: [number, number, number] | null) => void;
  reset: () => void;
}

const initialState = {
  cubes: [],
  objectiveCubes: [],
  planes: [],
  cameraPosition: null,
  projectionCubes: {
    parallel: [],
    perspective: [],
  },
};

export const useScene3DStore = create<Scene3DStore>((set, get) => ({
  ...initialState,
  addCube: cube => {
    set(state => ({
      ...state,
      cubes: [...state.cubes, cube],
    }));
  },
  addObjectiveCube: cube => {
    set(state => ({
      ...state,
      objectiveCubes: [...state.objectiveCubes, cube],
    }));
  },
  addProjectionCube: (mode, cube) => {
    set(state => ({
      ...state,
      projectionCubes: {
        ...state.projectionCubes,
        [mode]: [...state.projectionCubes[mode], cube],
      },
    }));
  },
  addPerspectiveCube: (cube, near, far, fovDegrees) => {
    const aspect =
      Math.max(window.innerWidth, 1) / Math.max(window.innerHeight, 1);
    const projection = createPerspectiveProjectionParameters(
      near,
      far,
      fovDegrees,
      aspect
    );
    const perspectiveCube: TProjectionCube = {
      ...cube,
      translation: new Vector3(0, 0, 0),
      scale: new Vector3(1, 1, 1),
      size: getPerspectiveFrustumSize(projection),
      perspectiveProjection: projection,
    };

    set(state => ({
      ...state,
      projectionCubes: {
        ...state.projectionCubes,
        perspective: [...state.projectionCubes.perspective, perspectiveCube],
      },
    }));
  },
  addPerspectiveCubeFromBounds: (
    cube,
    near,
    far,
    left,
    right,
    bottom,
    top
  ) => {
    const projection = createPerspectiveProjectionFromBounds(
      near,
      far,
      left,
      right,
      bottom,
      top
    );
    const perspectiveCube: TProjectionCube = {
      ...cube,
      translation: new Vector3(0, 0, 0),
      scale: new Vector3(1, 1, 1),
      size: getPerspectiveFrustumSize(projection),
      perspectiveProjection: projection,
    };

    set(state => ({
      ...state,
      projectionCubes: {
        ...state.projectionCubes,
        perspective: [...state.projectionCubes.perspective, perspectiveCube],
      },
    }));
  },
  getCube: id => {
    return get().cubes.find(cube => cube.id === id);
  },
  updateCube: (id, cube) => {
    set(state => {
      const index = state.cubes.findIndex(cube => cube.id === id);
      if (index === -1) return state;
      const newCubes = [...state.cubes];
      newCubes[index] = cube;
      return {
        ...state,
        cubes: newCubes,
      };
    });
  },
  moveCubeXZ: (id, x, z) => {
    set(state => {
      const cube = state.cubes.find(currentCube => currentCube.id === id);
      if (!cube) return state;

      const nextX = Math.max(-8, Math.min(8, x));
      const nextZ = Math.max(-8, Math.min(8, z));
      const delta = new Vector3(
        Math.round((nextX - cube.position.x - cube.translation.x) * 2) / 2,
        0,
        Math.round((nextZ - cube.position.z - cube.translation.z) * 2) / 2
      );
      const groupId = cube.groupId;

      return {
        ...state,
        cubes: state.cubes.map(currentCube =>
          currentCube.id === id || (groupId && currentCube.groupId === groupId)
            ? {
                ...currentCube,
                translation: currentCube.translation.clone().add(delta),
              }
            : currentCube
        ),
      };
    });
  },
  moveCubeY: (id, y) => {
    set(state => {
      const cube = state.cubes.find(currentCube => currentCube.id === id);
      if (!cube) return state;

      const nextY = Math.max(-7.5, Math.min(7.5, y));
      const deltaY =
        Math.round((nextY - cube.position.y - cube.translation.y) * 2) / 2;
      const groupId = cube.groupId;

      return {
        ...state,
        cubes: state.cubes.map(currentCube =>
          currentCube.id === id || (groupId && currentCube.groupId === groupId)
            ? {
                ...currentCube,
                translation: currentCube.translation
                  .clone()
                  .set(
                    currentCube.translation.x,
                    currentCube.translation.y + deltaY,
                    currentCube.translation.z
                  ),
              }
            : currentCube
        ),
      };
    });
  },
  scaleCubeUniform: (id, scale) => {
    set(state => ({
      ...state,
      cubes: state.cubes.map(cube =>
        cube.id === id
          ? { ...cube, scale: new Vector3(scale, scale, scale) }
          : cube
      ),
      objectiveCubes: state.objectiveCubes.map(cube =>
        cube.id === id
          ? { ...cube, scale: new Vector3(scale, scale, scale) }
          : cube
      ),
    }));
  },
  resizeProjectionCube: (mode, id, size, position, perspectiveProjection) => {
    set(state => ({
      ...state,
      projectionCubes: {
        ...state.projectionCubes,
        [mode]: state.projectionCubes[mode].map(cube =>
          cube.id === id
            ? {
                ...cube,
                size: size.clone(),
                position: position.clone(),
                ...(perspectiveProjection && { perspectiveProjection }),
              }
            : cube
        ),
      },
    }));
  },
  setCubeInteractionMode: (id, mode) => {
    set(state => ({
      ...state,
      cubes: state.cubes.map(cube =>
        cube.id === id && cube.interaction
          ? { ...cube, interaction: { ...cube.interaction, mode } }
          : cube
      ),
    }));
  },
  setCubeCustomYRotationMatrix: (id, matrix) => {
    set(state => {
      const index = state.cubes.findIndex(cube => cube.id === id);
      if (index === -1) return state;
      const newCubes = [...state.cubes];
      newCubes[index] = { ...newCubes[index], customYRotationMatrix: matrix };
      return {
        ...state,
        cubes: newCubes,
      };
    });
  },
  setCubeCustomXRotationMatrix: (id, matrix) => {
    set(state => {
      const index = state.cubes.findIndex(cube => cube.id === id);
      if (index === -1) return state;
      const newCubes = [...state.cubes];
      newCubes[index] = { ...newCubes[index], customXRotationMatrix: matrix };
      return {
        ...state,
        cubes: newCubes,
      };
    });
  },
  setCubeCustomZRotationMatrix: (id, matrix) => {
    set(state => {
      const index = state.cubes.findIndex(cube => cube.id === id);
      if (index === -1) return state;
      const newCubes = [...state.cubes];
      newCubes[index] = { ...newCubes[index], customZRotationMatrix: matrix };
      return {
        ...state,
        cubes: newCubes,
      };
    });
  },
  setPlanes: planes => {
    set(state => ({ ...state, planes }));
  },
  setCameraPosition: cameraPosition => {
    set(state => ({ ...state, cameraPosition }));
  },
  reset: () => {
    set(initialState);
  },
}));
