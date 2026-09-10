import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { degreesToRadians } from "@/lib/utils";
import { useFillInMatrixWithOptionsStore } from "@/store/fillInMatrixWithOptions";
import { MatrixType } from "@/store/fillInBlankMatrixInputStore";
import { initial2DRotationMatrixZValue } from "@/constants/inicial2DMatricesValues";
import {
  applyTransformationsToPolygon,
  create2DRotationMatrix,
} from "@/utils/matrix";
import { createTetrisPiece } from "@/utils/polygon";
import { TetrisPieceType } from "@/types/TetrisPiece";

type PresetSelection = {
  row: number;
  col: number;
  optionType: "cos" | "sin" | "-sin";
};

interface RotationMatrixFillInWithOptionsProps {
  order: number;
  squareProps: {
    center: [number, number];
    size: [number, number];
  };
  targetAngleInDegrees: number;
  presetSelections?: PresetSelection[];
}

// Generate unique options with suffixes to allow multiple of same type
export const generateOptions = (angle: number) => {
  const radians = degreesToRadians(angle);
  const cosValue = Math.cos(radians);
  const sinValue = Math.sin(radians);

  return [
    { id: "cos-1", value: cosValue, displayValue: `cos(${angle}°)` },
    { id: "cos-2", value: cosValue, displayValue: `cos(${angle}°)` },
    { id: "sin-1", value: sinValue, displayValue: `sin(${angle}°)` },
    { id: "-sin-1", value: -sinValue, displayValue: `-sin(${angle}°)` },
    { id: "-sin-2", value: -sinValue, displayValue: `-sin(${angle}°)` },
  ];
};

// Map preset selections to actual option IDs, tracking used options
export const mapPresetSelections = (
  options: ReturnType<typeof generateOptions>,
  presetSelections: PresetSelection[]
) => {
  const availableOptions = [...options];
  const mappedSelections = [];

  for (const preset of presetSelections) {
    // Find index of first available option of the requested type
    const optionIndex = availableOptions.findIndex(opt =>
      opt.id.startsWith(preset.optionType)
    );

    if (optionIndex === -1) {
      throw new Error(`No available ${preset.optionType} options left`);
    }

    // Add to mapped selections and remove from available options
    mappedSelections.push({
      row: preset.row,
      col: preset.col,
      optionId: availableOptions[optionIndex].id,
    });
    availableOptions.splice(optionIndex, 1);
  }

  return mappedSelections;
};

function createRotationMatrixFillInWithOptionsAssignment({
  order,
  squareProps,
  targetAngleInDegrees,
  presetSelections = [],
}: RotationMatrixFillInWithOptionsProps): Assignment {
  const { center, size } = squareProps;

  const piece = createTetrisPiece(
    "square",
    "blue",
    center,
    TetrisPieceType.Z,
    size
  );

  return {
    assisted: false,
    id: `rotation-matrix-fill-in-with-options-${order}`,
    title: `Matriz de rotação`,
    instructions: `Complete a matriz de rotação para que atinja o objetivo.`,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS,
    subjectCategory: "rotation",
    order,
    setup() {
      const { addPolygon, setObjectivePolygons } = useScene2DStore.getState();
      piece.forEach(square => addPolygon(square));
      setObjectivePolygons(
        piece.map((square, index) => ({
          ...square,
          id: `target-square-${index + 1}`,
          color: "green",
          rotationMatrix:
            create2DRotationMatrix(targetAngleInDegrees).transpose(),
        }))
      );

      const { setMatrix, setOptions, selectOption } =
        useFillInMatrixWithOptionsStore.getState();
      setMatrix({
        id: "rotation-matrix",
        type: MatrixType.ROTATION_Z,
        dimention: "2D",
        polygonRefId: piece[0].id,
        polygonRefIds: piece.map(square => square.id),
        matrixValue: initial2DRotationMatrixZValue,
      });

      const options = generateOptions(targetAngleInDegrees);
      const mappedSelections = mapPresetSelections(options, presetSelections);
      setOptions(options);
      mappedSelections.forEach(({ row, col, optionId }) => {
        selectOption(row, col, optionId);
      });
    },
    validate() {
      const { matrix } = useFillInMatrixWithOptionsStore.getState();
      if (!matrix || !matrix.polygonRefIds?.length) return false;
      const scene = useScene2DStore.getState();

      return matrix.polygonRefIds.every((polygonId, index) => {
        const polygon = scene.getPolygon(polygonId);
        const targetPolygon = scene.getObjectivePolygon(
          `target-square-${index + 1}`
        );
        if (!polygon || !polygon.rotationMatrix || !targetPolygon) {
          return false;
        }

        const transformedCurrentPolygon = applyTransformationsToPolygon(
          polygon,
          [polygon.rotationMatrix]
        );
        const transformedTargetPolygon = applyTransformationsToPolygon(
          targetPolygon,
          [targetPolygon.rotationMatrix!]
        );

        return transformedCurrentPolygon.points.every((point, pointIndex) => {
          const targetPoint = transformedTargetPolygon.points[pointIndex];
          return (
            Math.abs(point.position[0] - targetPoint.position[0]) <= 0.01 &&
            Math.abs(point.position[1] - targetPoint.position[1]) <= 0.01
          );
        });
      });
    },
  };
}

const rotationMatrixFillInWithOptionsProps: RotationMatrixFillInWithOptionsProps[] =
  [
    {
      order: 1,
      squareProps: {
        center: [0, 0],
        size: [2, 2],
      },
      targetAngleInDegrees: 45,
      presetSelections: [{ row: 0, col: 1, optionType: "-sin" }],
    },
    {
      order: 2,
      squareProps: {
        center: [0, 0],
        size: [2, 2],
      },
      targetAngleInDegrees: 90,
      presetSelections: [
        { row: 0, col: 0, optionType: "cos" },
        { row: 1, col: 1, optionType: "cos" },
      ],
    },
    {
      order: 3,
      squareProps: {
        center: [0, 0],
        size: [2, 2],
      },
      targetAngleInDegrees: 180,
    },
    {
      order: 4,
      squareProps: {
        center: [0.5, 0.5],
        size: [1, 1],
      },
      targetAngleInDegrees: 45,
    },
    {
      order: 5,
      squareProps: {
        center: [1, 1],
        size: [1, 1],
      },
      targetAngleInDegrees: 45,
    },
    {
      order: 6,
      squareProps: {
        center: [1, 1],
        size: [1, 1],
      },
      targetAngleInDegrees: 90,
    },
  ];

export const rotationMatrixFillInWithOptionsAssignments =
  rotationMatrixFillInWithOptionsProps.map(
    createRotationMatrixFillInWithOptionsAssignment
  );
