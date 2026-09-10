import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import {
  applyTransformationsToPolygon,
  create2DRotationMatrix,
  create2DScaleMatrix,
  create2DTranslationMatrix,
} from "@/utils/matrix";
import { createSquare } from "@/utils/polygon";
import { Matrix3 } from "three";

type TransformConfig =
  | { type: "translation"; values: [number, number] }
  | { type: "scale"; values: [number, number] }
  | { type: "rotation"; values: number };

function toMatrix(config: TransformConfig): Matrix3 {
  switch (config.type) {
    case "translation":
      return create2DTranslationMatrix(...config.values);
    case "scale":
      return create2DScaleMatrix(...config.values);
    case "rotation":
      return create2DRotationMatrix(config.values);
  }
}

function describeConfig(config: TransformConfig): string {
  switch (config.type) {
    case "translation":
      return `translação (${config.values[0]}, ${config.values[1]})`;
    case "scale":
      return `escala (${config.values[0]}, ${config.values[1]})`;
    case "rotation":
      return `rotação de ${config.values}°`;
  }
}

const POSITION_EPSILON = 1e-6;

interface MatrixCommutativityComparisonAssignmentProps {
  order: number;
  title?: string;
  matrixA: TransformConfig;
  matrixB: TransformConfig;
  squareCenter: [number, number];
  squareSize: [number, number];
}

function createMatrixCommutativityComparisonAssignment({
  order,
  title,
  matrixA,
  matrixB,
  squareCenter,
  squareSize,
}: MatrixCommutativityComparisonAssignmentProps): Assignment {
  const square = createSquare("polygon", "blue", squareCenter, squareSize);
  const A = toMatrix(matrixA);
  const B = toMatrix(matrixB);

  const resultAB = applyTransformationsToPolygon(square, [A, B]);
  const resultBA = applyTransformationsToPolygon(square, [B, A]);

  const resultsAreEqual = resultAB.points.every((point, index) => {
    const other = resultBA.points[index];
    return (
      Math.abs(point.position[0] - other.position[0]) < POSITION_EPSILON &&
      Math.abs(point.position[1] - other.position[1]) < POSITION_EPSILON
    );
  });

  const options: TOption[] = [
    { id: "sim", value: "Sim, o resultado é o mesmo", correct: resultsAreEqual },
    { id: "nao", value: "Não, os resultados são diferentes", correct: !resultsAreEqual },
  ];

  return {
    id: `matrix-commutativity-comparison-${order}`,
    order,
    title: title || "A·B é igual a B·A?",
    instructions: `Azul: A = ${describeConfig(matrixA)} depois B = ${describeConfig(matrixB)}. Painel: a mesma dupla, na ordem inversa. Os resultados são iguais?`,
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "multiplication",
    setup() {
      const { setPolygons, setObjectivePolygons } = useScene2DStore.getState();
      setPolygons([resultAB]);
      setObjectivePolygons([{ ...resultBA, id: "result-ba", color: "orange" }]);

      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("Invertendo a ordem, o resultado seria o mesmo? {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      if (!answer) return false;
      return answer.correct;
    },
  };
}

const matrixCommutativityComparisonProps: Omit<
  MatrixCommutativityComparisonAssignmentProps,
  "order"
>[] = [
  // Nível 1: translação + rotação, claramente diferentes visualmente
  {
    matrixA: { type: "translation", values: [2, 0] },
    matrixB: { type: "rotation", values: 90 },
    squareCenter: [0, 0],
    squareSize: [1, 1],
  },
  // Nível 1: duas escalas — matrizes diagonais sempre comutam
  {
    matrixA: { type: "scale", values: [2, 1] },
    matrixB: { type: "scale", values: [1, 3] },
    squareCenter: [0, 0],
    squareSize: [1, 1],
  },
  // Nível 2: translação + escala não uniforme, não comutam
  {
    matrixA: { type: "translation", values: [1, 1] },
    matrixB: { type: "scale", values: [2, 0.5] },
    squareCenter: [0, 0],
    squareSize: [1, 1],
  },
  // Nível 3: pegadinha — escala UNIFORME comuta com rotação
  {
    matrixA: { type: "scale", values: [2, 2] },
    matrixB: { type: "rotation", values: 45 },
    squareCenter: [1, 1],
    squareSize: [1, 1],
  },
  // Nível 3: mesma aparência do caso anterior, mas a escala não é uniforme — não comuta
  {
    matrixA: { type: "scale", values: [2, 1] },
    matrixB: { type: "rotation", values: 45 },
    squareCenter: [1, 1],
    squareSize: [1, 1],
  },
];

export const matrixCommutativityComparisonAssignmentList =
  matrixCommutativityComparisonProps.map((props, index) =>
    createMatrixCommutativityComparisonAssignment({
      ...props,
      order: index + 1,
    })
  );
