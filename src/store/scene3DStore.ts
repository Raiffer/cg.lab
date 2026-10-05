import { Matrix4, Vector3 } from "three";
import { create } from "zustand";

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

export type TMovableCube = TCube & {
  interaction: {
    mode: "move";
    allowModeSwitch?: boolean;
  };
};

interface Scene3DStore {
  cubes: TCube[];
  objectiveCubes: TCube[];
  addCube: (cube: TCube) => void;
  addObjectiveCube: (cube: TCube) => void;
  getCube: (id: string) => TCube | undefined;
  updateCube: (id: string, cube: TCube) => void;
  moveCubeXZ: (id: string, x: number, z: number) => void;
  moveCubeY: (id: string, y: number) => void;
  scaleCubeUniform: (id: string, scale: number) => void;
  setCubeInteractionMode: (id: string, mode: CubeInteractionMode) => void;
  setCubeCustomYRotationMatrix: (id: string, matrix: Matrix4 | null) => void;
  setCubeCustomXRotationMatrix: (id: string, matrix: Matrix4 | null) => void;
  setCubeCustomZRotationMatrix: (id: string, matrix: Matrix4 | null) => void;
  reset: () => void;
}

const initialState = {
  cubes: [],
  objectiveCubes: [],
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
  reset: () => {
    set(initialState);
  },
}));
