import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { Matrix4, Vector3 } from "three";

/**
 * "Volume do Paralelepípedo" — a versão 3D de determinantSignPrediction.ts
 * (transformation/matrices/): três vetores-coluna de A geram um
 * paralelepípedo; o aluno julga, só olhando a forma, se ele tem volume ou
 * "achatou" numa superfície plana (as três colunas ficaram coplanares —
 * det = 0), sem calcular nada.
 *
 * Não existe nenhum primitivo de "paralelepípedo genérico" no app — só
 * `Cube` (uma caixa reta, com translação/rotação/escala próprias). Em vez de
 * criar um componente novo, reaproveitamos `customXRotationMatrix`: esse
 * campo aceita qualquer Matrix4, não só rotações de verdade (é só um fator
 * a mais multiplicado no model matrix — ver Cube.tsx). Construímos uma
 * Matrix4 cuja parte linear tem v1, v2, v3 como colunas, e cuja parte de
 * translação recentraliza o cubo unitário (que o three.js sempre desenha
 * com o centro na origem local) para que um canto caia exatamente na
 * origem do mundo — assim o cubo 1×1×1 vira, literalmente, o paralelepípedo
 * gerado por v1, v2, v3 a partir da origem, do mesmo jeito que o
 * paralelogramo 2D já faz.
 *
 * Progressão: 1–2 volumes claramente não nulos (caixa "torta" mas cheia);
 * 3 três vetores coplanares — achata visivelmente numa superfície plana;
 * 4 caso sutil, quase coplanar mas não é.
 */

function parallelepipedMatrix(
  v1: Vector3,
  v2: Vector3,
  v3: Vector3
): Matrix4 {
  // Translation part re-centers the unit box (three.js draws it centered at
  // its local origin) so its corner lands on the world origin: local point
  // (0.5, 0.5, 0.5) → the box's center → must map to v1/2 + v2/2 + v3/2 so
  // that local corner (-0.5,-0.5,-0.5) maps to (0,0,0), and (0.5,0.5,0.5)
  // maps to v1+v2+v3.
  const half = new Vector3(0.5, 0.5, 0.5);
  const translation = new Vector3()
    .addScaledVector(v1, half.x)
    .addScaledVector(v2, half.y)
    .addScaledVector(v3, half.z);

  // three.js Matrix4.set() takes elements row-major.
  return new Matrix4().set(
    v1.x, v2.x, v3.x, translation.x,
    v1.y, v2.y, v3.y, translation.y,
    v1.z, v2.z, v3.z, translation.z,
    0, 0, 0, 1
  );
}

function determinant3(v1: Vector3, v2: Vector3, v3: Vector3): number {
  return (
    v1.x * (v2.y * v3.z - v2.z * v3.y) -
    v2.x * (v1.y * v3.z - v1.z * v3.y) +
    v3.x * (v1.y * v2.z - v1.z * v2.y)
  );
}

interface DeterminantVolumePrediction3DAssignmentProps {
  order: number;
  title?: string;
  columns: [Vector3, Vector3, Vector3];
}

function createDeterminantVolumePrediction3DAssignment({
  order,
  title,
  columns,
}: DeterminantVolumePrediction3DAssignmentProps): Assignment {
  const [v1, v2, v3] = columns;
  const determinant = determinant3(v1, v2, v3);
  const hasVolume = Math.abs(determinant) > 1e-6;
  const customMatrix = parallelepipedMatrix(v1, v2, v3);

  const options: TOption[] = [
    { id: "tem-volume", value: "Tem volume", correct: hasVolume },
    {
      id: "achatou",
      value: "Achatou numa superfície plana",
      correct: !hasVolume,
    },
  ];

  return {
    id: `determinant-volume-prediction-3d-${order}`,
    order,
    title: title || "Esse Paralelepípedo Tem Volume?",
    instructions:
      "As três colunas de A geram o paralelepípedo mostrado. Sem calcular nada: ele tem volume, ou os três vetores ficaram no mesmo plano (achatou)?",
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "determinants",
    setup() {
      const { addCube } = useScene3DStore.getState();
      const cube: TCube = {
        id: "parallelepiped",
        label: "A",
        position: new Vector3(0, 2, 0),
        size: new Vector3(1, 1, 1),
        color: "purple",
        translation: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
        scale: new Vector3(1, 1, 1),
        customXRotationMatrix: customMatrix,
      };
      addCube(cube);

      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("O paralelepípedo: {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      return answer ? answer.correct : false;
    },
  };
}

const determinantVolumePrediction3DProps: Omit<
  DeterminantVolumePrediction3DAssignmentProps,
  "order"
>[] = [
  // Nível 1: caixa "torta" mas claramente com volume
  {
    columns: [
      new Vector3(3, 0, 0),
      new Vector3(1, 3, 0),
      new Vector3(0, 1, 3),
    ],
  },
  // Nível 1: outra combinação com volume, eixos bem separados
  {
    columns: [
      new Vector3(2, 1, 0),
      new Vector3(0, 2, 1),
      new Vector3(1, 0, 3),
    ],
  },
  // Nível 2: três vetores coplanares (v3 = v1 + v2) — achata numa superfície
  {
    columns: [
      new Vector3(3, 0, 0),
      new Vector3(0, 3, 0),
      new Vector3(3, 3, 0),
    ],
  },
  // Nível 3: quase coplanar, mas não é — testa se o aluno olha com cuidado
  {
    columns: [
      new Vector3(3, 0, 0),
      new Vector3(0, 3, 0),
      new Vector3(3, 3, 0.4),
    ],
  },
];

export const determinantVolumePrediction3DAssignmentList =
  determinantVolumePrediction3DProps.map((props, index) =>
    createDeterminantVolumePrediction3DAssignment({
      ...props,
      order: index + 1,
    })
  );
