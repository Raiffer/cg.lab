import { TCube, useScene3DStore } from "@/store/scene3DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { TetrisPiece3Type } from "@/types/TetrisPiece3d";
import { createTetrisPiece3 } from "@/utils/cube";
import { Euler, Matrix4, Vector3 } from "three";

type RotationAxis = "X" | "Y" | "Z";

interface MoveRotateCubeProps {
  order: number;
  title?: string;
  instructions?: string;
  initialCubeProps?: Partial<TCube>;
  pieceType: TetrisPiece3Type;
  // O alvo é definido SOMENTE por rotação + translação.
  // A posição final esperada (targetPosition) não é mais informada à mão:
  // ela é derivada da mesma peça-objetivo que o ShowGoal desenha.
  targetRotation: Vector3;
  targetTranslation: Vector3;
  showGoal?: boolean;
  initialAxis?: RotationAxis;
}

// Remove ruído de ponto flutuante (ex.: 1.2e-16, -0) para não poluir a UI
const cleanVector = (v: Vector3) => {
  const snap = (n: number) => {
    const rounded = Math.round(n * 1e6) / 1e6;
    return Object.is(rounded, -0) ? 0 : rounded;
  };
  return new Vector3(snap(v.x), snap(v.y), snap(v.z));
};

// Matriz de rotação em torno de (0,0,0) do mundo
const getRotationMatrix = (rot: Vector3) => {
  const euler = new Euler(
    (rot.x * Math.PI) / 180,
    (rot.y * Math.PI) / 180,
    (rot.z * Math.PI) / 180,
    "XYZ"
  );
  return new Matrix4().makeRotationFromEuler(euler);
};

// A translação só é alcançável se estiver na grade de 0.5 usada pelo moveCubeXZ/moveCubeY
const isOnHalfGrid = (n: number) => Math.abs(n * 2 - Math.round(n * 2)) < 1e-6;

function createMoveRotateCubeAssignment({
  order,
  title,
  instructions,
  initialCubeProps,
  pieceType,
  targetRotation,
  targetTranslation,
  showGoal = false,
  initialAxis = "X",
}: MoveRotateCubeProps): Assignment {
  const pieceId = `move-rotate-piece-${order}`;
  const pieceCubeIds = Array.from(
    { length: 4 },
    (_, index) => `${pieceId}-${index + 1}`
  );
  const initialPosition =
    initialCubeProps?.position?.clone() || new Vector3(0, 0, 0);
  const initialRotation =
    initialCubeProps?.rotation?.clone() || new Vector3(0, 0, 0);
  const size = initialCubeProps?.size || new Vector3(1, 1, 1);
  const scale = initialCubeProps?.scale || new Vector3(1, 1, 1);
  const color = initialCubeProps?.color || "red";

  // ---------------------------------------------------------------------
  // PEÇA-OBJETIVO: única fonte de verdade do alvo.
  // Cada bloco fica em:  posição = R_alvo · base   e   translação = t_alvo
  // (posição visível = posição + translação, igual à peça do aluno).
  // Tanto o ShowGoal (setup) quanto o validate() usam estes mesmos dados,
  // então o que é desenhado e o que é validado nunca divergem.
  // ---------------------------------------------------------------------
  const goalRotMatrix = getRotationMatrix(targetRotation);

  const goalCubes: TCube[] = createTetrisPiece3(
    `objective-${pieceId}`,
    "white",
    initialPosition,
    pieceType,
    size
  ).map(cube => ({
    ...cube,
    position: cleanVector(cube.position.clone().applyMatrix4(goalRotMatrix)),
    rotation: targetRotation.clone(),
    translation: targetTranslation.clone(),
    opacity: 0.5,
  }));

  const goalCentralCube = goalCubes.find(cube => cube.isCentral)!;

  // Posição final esperada do bloco central = posição orbitada + translação
  const targetPosition = goalCentralCube.position
    .clone()
    .add(goalCentralCube.translation);

  // Avisos em tempo de desenvolvimento: alvo impossível de alcançar pelo aluno
  if (![targetTranslation.x, targetTranslation.y, targetTranslation.z].every(isOnHalfGrid)) {
    console.warn(
      `[${pieceId}] targetTranslation (${targetTranslation.x}, ${targetTranslation.y}, ${targetTranslation.z}) não está na grade de 0.5; o aluno não conseguirá alcançá-lo.`
    );
  }
  if (
    Math.abs(targetPosition.x) > 8 ||
    Math.abs(targetPosition.z) > 8 ||
    Math.abs(targetPosition.y) > 7.5
  ) {
    console.warn(
      `[${pieceId}] a posição final (${targetPosition.x}, ${targetPosition.y}, ${targetPosition.z}) está fora dos limites de movimento da cena.`
    );
  }

  // ---------------------------------------------------------------------
  // PEÇA DO ALUNO
  // ---------------------------------------------------------------------
  let selectedAxis: RotationAxis = initialAxis;

  const axisAngles: Record<RotationAxis, number> = {
    X: initialRotation.x,
    Y: initialRotation.y,
    Z: initialRotation.z,
  };

  // Posição de cada bloco ANTES de qualquer rotação e SEM nenhuma translação
  const baseWorldPositionsMap = new Map<string, Vector3>();

  // Rotação atualmente aplicada na cena. Serve para calcular a rotação
  // incremental (delta) que também é aplicada ao vetor de translação.
  let lastRotMatrix = new Matrix4();

  const getRotation = () =>
    new Vector3(axisAngles.X, axisAngles.Y, axisAngles.Z);

  const updatePieceRotation = () => {
    const { getCube, updateCube } = useScene3DStore.getState();
    const rotation = getRotation();
    const rotMatrix = getRotationMatrix(rotation);

    // Rotação incremental: R_nova · R_antiga⁻¹
    const delta = rotMatrix.clone().multiply(lastRotMatrix.clone().invert());

    pieceCubeIds.forEach(id => {
      const cube = getCube(id);
      const basePos = baseWorldPositionsMap.get(id);
      if (!cube || !basePos) return;

      // Posição visível = position + translation.
      // Para o objeto inteiro orbitar a origem, giramos as duas partes:
      //   position    = R · base
      //   translation = delta · translation   (o deslocamento do usuário também gira)
      updateCube(id, {
        ...cube,
        position: cleanVector(basePos.clone().applyMatrix4(rotMatrix)),
        translation: cleanVector(cube.translation.clone().applyMatrix4(delta)),
        rotation: rotation.clone(),
      });
    });

    lastRotMatrix = rotMatrix;
  };

  return {
    assisted: false,
    id: `move-rotate-cube-${order}`,
    title: title || "Mova e rotacione a peça no ambiente 3D",
    instructions:
      instructions ||
      `Aplique a rotação (${targetRotation.x}, ${targetRotation.y}, ${targetRotation.z}) e a translação (${targetTranslation.x}, ${targetTranslation.y}, ${targetTranslation.z}).`,
    order,
    type: AssignmentType.SLIDER,
    subjectCategory: "rotation",
    showObjective: showGoal,
    slider: {
      min: -360,
      max: 360,
      step: 5,
      initialValue: 0,
      onChange: value => {
        axisAngles[selectedAxis] = value;
        updatePieceRotation();
      },
    },
    buttons: (["X", "Y", "Z"] as RotationAxis[]).map(axis => ({
      label: axis,
      variant: axis === initialAxis ? "default" : "outline",
      selectable: true,
      onClick: () => {
        selectedAxis = axis;
        updatePieceRotation();
        return axisAngles[axis];
      },
    })) as unknown as [
      {
        label: string;
        onClick: () => number;
        variant?: "default" | "outline";
        selectable?: boolean;
      },
      {
        label: string;
        onClick: () => number;
        variant?: "default" | "outline";
        selectable?: boolean;
      },
      {
        label: string;
        onClick: () => number;
        variant?: "default" | "outline";
        selectable?: boolean;
      },
    ],
    setup() {
      const { addCube, addObjectiveCube } = useScene3DStore.getState();

      // Ressincroniza o estado local com a cena recém-criada
      // (evita "saltos" se o exercício for reaberto)
      axisAngles.X = initialRotation.x;
      axisAngles.Y = initialRotation.y;
      axisAngles.Z = initialRotation.z;
      selectedAxis = initialAxis;
      lastRotMatrix = getRotationMatrix(initialRotation);
      baseWorldPositionsMap.clear();

      const piece = createTetrisPiece3(
        pieceId,
        color,
        initialPosition,
        pieceType,
        size,
        true
      );

      piece.forEach(cube => {
        // Armazena a posição sem rotação e sem translação
        baseWorldPositionsMap.set(cube.id, cube.position.clone());

        addCube({
          ...cube,
          groupId: pieceId,
          // A posição inicial já respeita a rotação inicial (e não só o mesh)
          position: cleanVector(
            cube.position.clone().applyMatrix4(lastRotMatrix)
          ),
          scale: scale.clone(),
          rotation: initialRotation.clone(),
          translation: new Vector3(0, 0, 0),
          displayCustomAxes: true,
        });
      });

      if (showGoal) {
        // Usa exatamente os mesmos blocos que o validate() considera como alvo
        goalCubes.forEach(cube => {
          addObjectiveCube({
            ...cube,
            position: cube.position.clone(),
            rotation: cube.rotation.clone(),
            translation: cube.translation.clone(),
          });
        });
      }
    },
    validate() {
      const { getCube } = useScene3DStore.getState();
      const centralCube = pieceCubeIds
        .map(id => getCube(id))
        .find(cube => cube?.isCentral);

      if (!centralCube) return false;

      // Posição final na cena = (posição orbitada em torno do 0,0,0) + (translação do usuário)
      const finalCenterPosition = centralCube.position
        .clone()
        .add(centralCube.translation);

      const EPSILON = 0.01;

      // targetPosition vem do bloco central da peça-objetivo (mesma do ShowGoal)
      const isPositionCorrect =
        finalCenterPosition.distanceTo(targetPosition) < EPSILON;

      const isRotationCorrect =
        Math.abs(centralCube.rotation.x - targetRotation.x) < EPSILON &&
        Math.abs(centralCube.rotation.y - targetRotation.y) < EPSILON &&
        Math.abs(centralCube.rotation.z - targetRotation.z) < EPSILON;

      return isPositionCorrect && isRotationCorrect;
    },
  };
}

// Os alvos assumem a ordem "rotaciona, depois translada":
//   posição final = R · base + t
// Se o aluno transladar primeiro e rotacionar depois, o resultado é
// R · (base + t), que é outro ponto (R·T ≠ T·R).
//
// Exemplo (exercício 1), calculado automaticamente:
//   base do bloco central = (2, 0.5, 2)
//   R(0, 90°, 0) · base   = (2, 0.5, -2)
//   + t (2, 0, -1)        = (4, 0.5, -3)
const moveRotateCubeAssignmentProps: MoveRotateCubeProps[] = [
  {
    order: 1,
    title: "Rotacione no eixo Y e mova a peça",
    pieceType: TetrisPiece3Type.T,
    initialCubeProps: {
      position: new Vector3(2, 0.5, 2),
    },
    targetRotation: new Vector3(0, 90, 0),
    targetTranslation: new Vector3(2, 0, -1),
    showGoal: true,
    initialAxis: "Y",
  },
  {
    order: 2,
    title: "Rotacione no eixo Y e mova a peça",
    pieceType: TetrisPiece3Type.T,
    initialCubeProps: {
      position: new Vector3(2, 0.5, 2),
    },
    targetRotation: new Vector3(0, 90, 0),
    // posição final derivada = R·(2, 0.5, 2) + (4, 0, -1) = (6, 0.5, -3)
    targetTranslation: new Vector3(4, 0, -1),
    showGoal: true,
    initialAxis: "Y",
  },
];

export const moveRotateCubeAssignmentList = moveRotateCubeAssignmentProps.map(
  createMoveRotateCubeAssignment
);