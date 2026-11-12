import { useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";
import {
  doesCubeIntersectPerspectiveProjection,
  isCubeInsidePerspectiveProjection,
} from "@/lib/perspective-projection";

interface PerspectiveAssignmentObject {
  position: Vector3;
  color: string;
  // Tamanho do cubo; padrão 1 × 1 × 1
  size?: Vector3;
}

// Parâmetros do volume em perspectiva. left/right/bottom/top são medidos
// no plano near.
interface PerspectiveVolumeBounds {
  near: number;
  far: number;
  left: number;
  right: number;
  bottom: number;
  top: number;
}

interface PerspectiveAssignmentConfig {
  // Comando da questão mostrado ao aluno
  instructions: string;
  // Objetos que precisam terminar inteiros dentro do volume
  include: PerspectiveAssignmentObject[];
  // Objetos que precisam terminar totalmente fora do volume
  exclude?: PerspectiveAssignmentObject[];
  // Volume inicial; o que não for informado usa o padrão
  volume?: Partial<PerspectiveVolumeBounds>;
}

interface PerspectiveAssignmentsProps {
  order: number;
  title?: string;
  assignments: PerspectiveAssignmentConfig[];
}

interface SinglePerspectiveAssignmentProps extends PerspectiveAssignmentConfig {
  order: number;
  title?: string;
}

// Volume padrão: centro em (0, 3, -8), câmera (ápice) em (0, 3, 30).
// Plano near em z = 9 e far em z = -25.
// A uma distância d da câmera (d = 30 - z), o volume cobre
// x ∈ [-5d/21, 5d/21] e y ∈ [3 - 2d/21, 3 + 3d/21].
// Os handles mantêm a câmera fixa: mudam near/far e a abertura em x e y
// (ao redimensionar, a abertura fica simétrica em torno de x = 0 e y = 3).
const initialVolumePosition = new Vector3(0, 3, -8);
const defaultVolume: PerspectiveVolumeBounds = {
  near: 21,
  far: 55,
  left: -5,
  right: 5,
  bottom: -2,
  top: 3,
};
const defaultCubeSize = new Vector3(1, 1, 1);

function createPerspectiveAssignment({
  order,
  title,
  instructions,
  include,
  exclude = [],
  volume,
}: SinglePerspectiveAssignmentProps): Assignment {
  const volumeId = `projection-perspective-v2-volume-${order}`;
  // A primeira questão mantém o id antigo para preservar conclusões salvas
  const assignmentId =
    order === 3
      ? "projection-perspective-v2"
      : `projection-perspective-v2-${order}`;
  const bounds = { ...defaultVolume, ...volume };

  const cubes = [
    ...include.map((object, index) => ({
      ...object,
      id: `projection-perspective-v2-${order}-include-${index}`,
    })),
    ...exclude.map((object, index) => ({
      ...object,
      id: `projection-perspective-v2-${order}-exclude-${index}`,
    })),
  ];

  return {
    id: assignmentId,
    order,
    title: title ?? "Projeção em perspectiva",
    instructions,
    assisted: false,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "projection",
    projectionMode: "perspective",
    setup() {
      const { addCube, addPerspectiveCubeFromBounds } =
        useScene3DStore.getState();

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

      addPerspectiveCubeFromBounds(
        {
          id: volumeId,
          position: initialVolumePosition.clone(),
          color: "#38bdf8",
        },
        bounds.near,
        bounds.far,
        bounds.left,
        bounds.right,
        bounds.bottom,
        bounds.top
      );
    },
    validate() {
      const projectionCube = useScene3DStore
        .getState()
        .projectionCubes.perspective.find(cube => cube.id === volumeId);
      if (!projectionCube?.perspectiveProjection) return false;

      const projection = projectionCube.perspectiveProjection;
      const volumePosition = projectionCube.position
        .clone()
        .add(projectionCube.translation);

      const allIncludedInside = include.every(object =>
        isCubeInsidePerspectiveProjection(
          object.position,
          object.size ?? defaultCubeSize,
          projection,
          volumePosition
        )
      );
      const allExcludedOutside = exclude.every(
        object =>
          !doesCubeIntersectPerspectiveProjection(
            object.position,
            object.size ?? defaultCubeSize,
            projection,
            volumePosition
          )
      );

      return allIncludedInside && allExcludedOutside;
    },
  };
}

function createPerspectiveAssignments({
  order,
  title,
  assignments,
}: PerspectiveAssignmentsProps): Assignment[] {
  return assignments.map((assignment, index) =>
    createPerspectiveAssignment({
      ...assignment,
      order: order + index,
      title,
    })
  );
}

// Nos comentários, d é a distância do cubo até a câmera (d = 30 - z)
const perspectiveAssignmentConfigs: PerspectiveAssignmentConfig[] = [
  {
    // d = 38: precisa abrir o volume em x
    instructions:
      "Use os handles para redimensionar o volume de projeção até que o cubo vermelho fique completamente visível dentro dele.",
    include: [{ position: new Vector3(10, 3, -8), color: "red" }],
  },
  {
    instructions:
      "Use os handles para redimensionar o volume de projeção até que o cubo amarelo fique completamente visível dentro dele.",
    include: [{ position: new Vector3(-10, 3, -8), color: "yellow" }],
  },
  {
    // d = 38: precisa abrir o volume em y
    instructions:
      "Use os handles para redimensionar o volume de projeção até que o cubo verde fique completamente visível dentro dele.",
    include: [{ position: new Vector3(0, 9, -8), color: "green" }],
  },
  {
    // Laranja: d = 60, além do plano far (55) -> afastar o far.
    // Roxo: d = 18, antes do plano near (21) -> não aproximar o near.
    instructions:
      "O cubo laranja está além do plano far. Inclua-o no volume de projeção, sem incluir o cubo roxo.",
    include: [{ position: new Vector3(0, 3, -30), color: "orange" }],
    exclude: [{ position: new Vector3(0, 3, 12), color: "purple" }],
  },
  {
    // Roxo: d = 18 -> near ≤ 17,5. Laranja: d = 10 -> near > 10,5.
    instructions:
      "Aproxime o plano near da câmera para incluir o cubo roxo, sem incluir o cubo laranja.",
    include: [{ position: new Vector3(0, 3, 12), color: "purple" }],
    exclude: [{ position: new Vector3(0, 3, 20), color: "orange" }],
  },
  {
    // d = 38. Vermelho e amarelo (|x| = 12) pedem right ≥ 6,9;
    // o verde (x = 16) sai do volume enquanto right < 8,57.
    instructions:
      "Abra o volume de projeção na horizontal para incluir os cubos vermelho e amarelo, sem incluir o cubo verde.",
    include: [
      { position: new Vector3(12, 3, -8), color: "red" },
      { position: new Vector3(-12, 3, -8), color: "yellow" },
    ],
    exclude: [{ position: new Vector3(16, 3, -8), color: "green" }],
  },
  {
    // Azul: d = 50, y = 12 -> top ≥ 4. Vermelho: d = 38, y = 15 -> top < 6,36.
    instructions:
      "Inclua o cubo azul no volume de projeção, sem incluir o cubo vermelho, que está mais alto.",
    include: [{ position: new Vector3(0, 12, -20), color: "blue" }],
    exclude: [{ position: new Vector3(0, 15, -8), color: "red" }],
  },
  {
    // Amarelo: d = 16 -> near ≤ 15,5. Azul: d = 60 -> far ≥ 60,5.
    // Vermelho: d = 5 -> near > 5,5.
    instructions:
      "Ajuste os planos near e far para incluir os cubos amarelo e azul, sem incluir o cubo vermelho.",
    include: [
      { position: new Vector3(-4, 3, 14), color: "yellow" },
      { position: new Vector3(0, 3, -30), color: "blue" },
    ],
    exclude: [{ position: new Vector3(0, 3, 25), color: "red" }],
  },
];

export const perspectiveAssignmentV2AssignmentList =
  createPerspectiveAssignments({
    order: 3,
    assignments: perspectiveAssignmentConfigs,
  });

export const perspectiveAssignmentV2 = perspectiveAssignmentV2AssignmentList[0];
