import { useScene3DStore } from "@/store/scene3DStore";
import {
  TMultipleChoiceOption,
  useMultipleChoiceStore,
} from "@/store/multipleChoiceStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Vector3 } from "three";

// Questões fechadas de projeção (AssignmentType.PROJECTION_MULTIPLE_CHOICE).
// A página mostra apenas a cena principal, vista através do volume de
// projeção, sem interação. O aluno responde escolhendo uma alternativa.

interface ProjectionSceneObject {
  position: Vector3;
  color: string;
  // Tamanho do cubo; padrão 1 × 1 × 1
  size?: Vector3;
}

// Volume que define a câmera da cena principal
type ProjectionVolume =
  | {
      mode: "parallel";
      position: Vector3;
      size: Vector3;
    }
  | {
      mode: "perspective";
      position: Vector3;
      near: number;
      far: number;
      left: number;
      right: number;
      bottom: number;
      top: number;
    };

interface ProjectionMultipleChoiceAssignmentProps {
  id: string;
  order: number;
  title?: string;
  // Enunciado da questão
  instructions: string;
  volume: ProjectionVolume;
  objects: ProjectionSceneObject[];
  // Alternativas; apenas uma deve ter correct: true
  options: TMultipleChoiceOption[];
}

const defaultCubeSize = new Vector3(1, 1, 1);

export function createProjectionMultipleChoiceAssignment({
  id,
  order,
  title,
  instructions,
  volume,
  objects,
  options,
}: ProjectionMultipleChoiceAssignmentProps): Assignment {
  const volumeId = `${id}-volume`;

  return {
    id,
    order,
    title: title ?? "Questão de projeção",
    instructions,
    assisted: false,
    type: AssignmentType.PROJECTION_MULTIPLE_CHOICE,
    subjectCategory: "projection",
    projectionMode: volume.mode,
    setup() {
      const { addCube, addProjectionCube, addPerspectiveCubeFromBounds } =
        useScene3DStore.getState();

      objects.forEach((object, index) => {
        addCube({
          id: `${id}-object-${index}`,
          position: object.position.clone(),
          size: (object.size ?? defaultCubeSize).clone(),
          color: object.color,
          translation: new Vector3(0, 0, 0),
          rotation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
        });
      });

      if (volume.mode === "parallel") {
        addProjectionCube("parallel", {
          id: volumeId,
          position: volume.position.clone(),
          size: volume.size.clone(),
          color: "#38bdf8",
          translation: new Vector3(0, 0, 0),
          scale: new Vector3(1, 1, 1),
        });
      } else {
        addPerspectiveCubeFromBounds(
          { id: volumeId, position: volume.position.clone(), color: "#38bdf8" },
          volume.near,
          volume.far,
          volume.left,
          volume.right,
          volume.bottom,
          volume.top
        );
      }

      useMultipleChoiceStore.getState().setOptions(options);
    },
    validate() {
      return useMultipleChoiceStore.getState().getSelectedOption()?.correct ?? false;
    },
  };
}

// --- Volumes reutilizados pelas questões ---

// Perspectiva: câmera em (0, 2, 10) olhando para -z.
// Plano near em z = 6 e far em z = -14. A uma distância d da câmera, a
// imagem cobre x ∈ [-0.625·d, 0.625·d] e y ∈ [2 - 0.25·d, 2 + 0.25·d].
const perspectiveVolume: ProjectionVolume = {
  mode: "perspective",
  position: new Vector3(0, 2, -4),
  near: 4,
  far: 24,
  left: -2.5,
  right: 2.5,
  bottom: -1,
  top: 1,
};

// Paralela: caixa x ∈ [-5, 5], y ∈ [0, 4], z ∈ [-9, 5]; câmera olhando para -z
const parallelVolume: ProjectionVolume = {
  mode: "parallel",
  position: new Vector3(0, 2, -2),
  size: new Vector3(10, 4, 14),
};

const projectionTypeOptions: TMultipleChoiceOption[] = [
  { id: "parallel", label: "Projeção paralela", correct: false },
  { id: "perspective", label: "Projeção em perspectiva", correct: false },
];

function projectionTypeOptionsWithAnswer(
  answer: "parallel" | "perspective"
): TMultipleChoiceOption[] {
  return projectionTypeOptions.map(option => ({
    ...option,
    correct: option.id === answer,
  }));
}

// --- Questões ---

// 1. Duas fileiras de cubos iguais, cada vez mais longe da câmera.
// Na perspectiva, os cubos distantes parecem menores.
export const projectionTypeIdentificationAssignment =
  createProjectionMultipleChoiceAssignment({
    id: "projection-type-identification-1",
    order: 1,
    title: "Identifique a projeção",
    instructions:
      "Observe a cena. Os cubos têm todos o mesmo tamanho. Que tipo de projeção está sendo usada?",
    volume: perspectiveVolume,
    objects: [3, -1, -5, -9].flatMap(z => [
      { position: new Vector3(-1.5, 1, z), color: "red" },
      { position: new Vector3(1.5, 1, z), color: "yellow" },
    ]),
    options: projectionTypeOptionsWithAnswer("perspective"),
  });

// 2. Cubos iguais em diagonal, cada um mais longe que o anterior.
// Na paralela, todos aparecem com o mesmo tamanho.
const projectionTypeIdentificationParallel =
  createProjectionMultipleChoiceAssignment({
    id: "projection-type-identification-2",
    order: 2,
    title: "Identifique a projeção",
    instructions:
      "Os quatro cubos têm o mesmo tamanho e estão a distâncias diferentes da câmera. Que tipo de projeção está sendo usada?",
    volume: parallelVolume,
    objects: [
      { position: new Vector3(-3, 1, 4), color: "red" },
      { position: new Vector3(-1, 1, 0), color: "yellow" },
      { position: new Vector3(1, 1, -4), color: "green" },
      { position: new Vector3(3, 1, -8), color: "blue" },
    ],
    options: projectionTypeOptionsWithAnswer("parallel"),
  });

// 3. Recorte pelo volume: só aparece o que está dentro dele.
// Volume x ∈ [-4, 4], y ∈ [0, 4], z ∈ [-4, 4]; câmera em z ≈ 4,2.
// Dentro: vermelho, amarelo e verde. Fora: azul (x = 6) e laranja (atrás da câmera).
const projectionClippingCount = createProjectionMultipleChoiceAssignment({
  id: "projection-clipping-count",
  order: 3,
  title: "Recorte pelo volume",
  instructions:
    "A cena tem 5 cubos, mas a imagem mostra apenas o que está dentro do volume de projeção. Quantos cubos estão dentro do volume?",
  volume: {
    mode: "parallel",
    position: new Vector3(0, 2, 0),
    size: new Vector3(8, 4, 8),
  },
  objects: [
    { position: new Vector3(-2, 1, 2), color: "red" },
    { position: new Vector3(2, 2.5, -2), color: "yellow" },
    { position: new Vector3(0, 1.5, -3), color: "green" },
    { position: new Vector3(6, 1, 0), color: "blue" },
    { position: new Vector3(0, 1, 7), color: "orange" },
  ],
  options: [
    { id: "2", label: "2 cubos", correct: false },
    { id: "3", label: "3 cubos", correct: true },
    { id: "4", label: "4 cubos", correct: false },
    { id: "5", label: "5 cubos", correct: false },
  ],
});

// 4. Linhas paralelas na cena convergem na perspectiva (ponto de fuga).
const projectionVanishingPoint = createProjectionMultipleChoiceAssignment({
  id: "projection-vanishing-point",
  order: 4,
  title: "Linhas paralelas",
  instructions:
    "As duas fileiras de cubos são paralelas na cena. O que acontece com elas na imagem desta projeção em perspectiva?",
  volume: perspectiveVolume,
  objects: [3, -1, -5, -9, -13].flatMap(z => [
    { position: new Vector3(-1.5, 1, z), color: "red" },
    { position: new Vector3(1.5, 1, z), color: "yellow" },
  ]),
  options: [
    { id: "parallel", label: "Continuam paralelas", correct: false },
    {
      id: "converge",
      label: "Convergem para um ponto de fuga",
      correct: true,
    },
    { id: "diverge", label: "Se afastam uma da outra", correct: false },
  ],
});

// 5. Na paralela, o tamanho na imagem é o tamanho real.
// O vermelho (menor) está mais perto; o amarelo (maior) está mais longe.
const projectionParallelSizeComparison =
  createProjectionMultipleChoiceAssignment({
    id: "projection-parallel-size",
    order: 5,
    title: "Tamanho na projeção paralela",
    instructions:
      "Nesta projeção paralela, qual é o maior cubo da cena?",
    volume: parallelVolume,
    objects: [
      {
        position: new Vector3(-3, 0.6, 4),
        size: new Vector3(1.2, 1.2, 1.2),
        color: "red",
      },
      {
        position: new Vector3(0, 0.9, -6),
        size: new Vector3(1.8, 1.8, 1.8),
        color: "yellow",
      },
      {
        position: new Vector3(3, 0.75, -2),
        size: new Vector3(1.5, 1.5, 1.5),
        color: "green",
      },
    ],
    options: [
      { id: "red", label: "Vermelho", correct: false },
      { id: "yellow", label: "Amarelo", correct: true },
      { id: "green", label: "Verde", correct: false },
      { id: "same", label: "Todos têm o mesmo tamanho", correct: false },
    ],
  });

// 6. Na perspectiva, tamanho aparente = tamanho real / distância.
// Vermelho: lado 1 a 6 unidades da câmera. Amarelo: lado 2 a 12 unidades.
// Os dois aparecem com o mesmo tamanho na imagem.
const projectionPerspectiveSizeIllusion =
  createProjectionMultipleChoiceAssignment({
    id: "projection-perspective-size",
    order: 6,
    title: "Tamanho na perspectiva",
    instructions:
      "Na imagem, os cubos vermelho e amarelo parecem ter o mesmo tamanho. Sabendo que a projeção é em perspectiva e que o amarelo está mais longe da câmera, o que se pode concluir?",
    volume: perspectiveVolume,
    objects: [
      { position: new Vector3(-1.5, 2, 4), color: "red" },
      {
        position: new Vector3(3, 2, -2),
        size: new Vector3(2, 2, 2),
        color: "yellow",
      },
    ],
    options: [
      { id: "yellow", label: "O cubo amarelo é maior", correct: true },
      { id: "red", label: "O cubo vermelho é maior", correct: false },
      { id: "same", label: "Os dois têm o mesmo tamanho", correct: false },
    ],
  });

export const projectionMultipleChoiceAssignmentList = [
  projectionTypeIdentificationAssignment,
  projectionTypeIdentificationParallel,
  projectionClippingCount,
  projectionVanishingPoint,
  projectionParallelSizeComparison,
  projectionPerspectiveSizeIllusion,
];
