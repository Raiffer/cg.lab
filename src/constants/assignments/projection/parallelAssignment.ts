import { useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";
import {
  doesCubeIntersectParallelProjection,
  isCubeInsideParallelProjection,
} from "@/lib/parallel-projection";

interface ParallelAssignmentObject {
  position: Vector3;
  color: string;
  // Tamanho do cubo; padrão 1 × 1 × 1
  size?: Vector3;
}

interface ParallelAssignmentConfig {
  // Comando da questão mostrado ao aluno
  instructions: string;
  // Objetos que precisam terminar inteiros dentro do volume
  include: ParallelAssignmentObject[];
  // Objetos que precisam terminar totalmente fora do volume
  exclude?: ParallelAssignmentObject[];
  // Proporção inicial (largura, altura, profundidade) do volume
  volumeSize?: Vector3;
}

interface ParallelAssignmentsProps {
  order: number;
  title?: string;
  // Proporção inicial usada quando a questão não define a sua
  volumeSize?: Vector3;
  assignments: ParallelAssignmentConfig[];
}

interface SingleParallelAssignmentProps extends ParallelAssignmentConfig {
  order: number;
  title?: string;
}

const initialVolumePosition = new Vector3(0, 2, 0);
const defaultVolumeSize = new Vector3(6, 4, 6);
const defaultCubeSize = new Vector3(1, 1, 1);

function createParallelAssignment({
  order,
  title,
  instructions,
  include,
  exclude = [],
  volumeSize = defaultVolumeSize,
}: SingleParallelAssignmentProps): Assignment {
  const volumeId = `projection-parallel-volume-${order}`;
  // A primeira questão mantém o id antigo para preservar conclusões salvas
  const assignmentId =
    order === 1 ? "projection-parallel" : `projection-parallel-${order}`;

  const cubes = [
    ...include.map((object, index) => ({
      ...object,
      id: `projection-parallel-${order}-include-${index}`,
    })),
    ...exclude.map((object, index) => ({
      ...object,
      id: `projection-parallel-${order}-exclude-${index}`,
    })),
  ];

  return {
    id: assignmentId,
    order,
    title: title ?? "Projeção paralela",
    instructions,
    assisted: false,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "projection",
    projectionMode: "parallel",
    setup() {
      const { addCube, addProjectionCube } = useScene3DStore.getState();

      for (const cube of cubes) {
        addCube({
          id: cube.id,
          position: cube.position.clone(),
          size: (cube.size ?? defaultCubeSize).clone(),
          color: cube.color,
          translation: new Vector3(0, 0, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
        });
      }

      addProjectionCube("parallel", {
        id: volumeId,
        position: initialVolumePosition.clone(),
        size: volumeSize.clone(),
        color: "#38bdf8",
        translation: new Vector3(0, 0, 0),
        scale: new Vector3(1, 1, 1),
      });
    },
    validate() {
      const projectionCube = useScene3DStore
        .getState()
        .projectionCubes.parallel.find(cube => cube.id === volumeId);
      if (!projectionCube) return false;

      const volumePosition = projectionCube.position
        .clone()
        .add(projectionCube.translation);
      const volumeSize = projectionCube.size
        .clone()
        .multiply(projectionCube.scale);

      const allIncludedInside = include.every(object =>
        isCubeInsideParallelProjection(
          object.position,
          object.size ?? defaultCubeSize,
          volumePosition,
          volumeSize
        )
      );
      const allExcludedOutside = exclude.every(
        object =>
          !doesCubeIntersectParallelProjection(
            object.position,
            object.size ?? defaultCubeSize,
            volumePosition,
            volumeSize
          )
      );

      return allIncludedInside && allExcludedOutside;
    },
  };
}

function createParallelAssignments({
  order,
  title,
  volumeSize,
  assignments,
}: ParallelAssignmentsProps): Assignment[] {
  return assignments.map((assignment, index) =>
    createParallelAssignment({
      volumeSize,
      ...assignment,
      order: order + index,
      title,
    })
  );
}

// Os intervalos dos comentários consideram o centro do volume em (0, 2, 0)
const parallelAssignmentConfigs: ParallelAssignmentConfig[] = [
  {
    // Largo e raso: x ∈ [-5, 5], y ∈ [0, 4], z ∈ [-2, 2]
    instructions:
      "Redimensione o volume de projeção até que o cubo vermelho fique completamente dentro dele.",
    volumeSize: new Vector3(10, 4, 4),
    include: [{ position: new Vector3(-2, 1, -6), color: "red" }],
  },
  {
    // Alto e estreito: x ∈ [-1, 1], y ∈ [-2, 6], z ∈ [-2, 2]
    instructions:
      "Coloque o cubo amarelo dentro do volume de projeção, deixando o cubo vermelho de fora.",
    volumeSize: new Vector3(2, 8, 4),
    include: [{ position: new Vector3(1, 2, 6), color: "yellow" }],
    exclude: [{ position: new Vector3(-3, 2, -4), color: "red" }],
  },
  {
    // Achatado e profundo: x ∈ [-2, 2], y ∈ [1, 3], z ∈ [-6, 6]
    // O cubo vermelho começa dentro e precisa sair
    instructions:
      "Inclua os cubos verde e azul no volume de projeção e retire o cubo vermelho.",
    volumeSize: new Vector3(4, 2, 12),
    include: [
      { position: new Vector3(6, 6, 0), color: "green" },
      { position: new Vector3(-4, 2, 0), color: "blue" },
    ],
    exclude: [{ position: new Vector3(0, 2, 5), color: "red" }],
  },
  {
    // Cubo pequeno: x ∈ [-1.5, 1.5], y ∈ [0.5, 3.5], z ∈ [-1.5, 1.5]
    instructions:
      "Inclua os cubos azul e laranja no volume de projeção, sem incluir os cubos vermelho e verde.",
    volumeSize: new Vector3(3, 3, 3),
    include: [
      { position: new Vector3(-5, 3, 3), color: "blue" },
      { position: new Vector3(5, 3, 3), color: "orange" },
    ],
    exclude: [
      { position: new Vector3(0, 3, -3), color: "red" },
      { position: new Vector3(0, 6, 3), color: "green" },
    ],
  },
  {
    // Placa fina: x ∈ [-6, 6], y ∈ [-1, 5], z ∈ [-1, 1]
    // O cubo amarelo começa dentro e precisa sair
    instructions:
      "Deixe apenas o cubo laranja dentro do volume de projeção. Os cubos amarelo e azul devem ficar de fora.",
    volumeSize: new Vector3(12, 6, 2),
    include: [{ position: new Vector3(4, 2, -4), color: "orange" }],
    exclude: [
      { position: new Vector3(0, 2, 0), color: "yellow" },
      { position: new Vector3(-4, 2, -4), color: "blue" },
    ],
  },
];

export const parallelAssignmentList = createParallelAssignments({
  order: 1,
  assignments: parallelAssignmentConfigs,
});

export const parallelAssignment = parallelAssignmentList[0];
