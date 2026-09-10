import React, { useEffect } from "react";
import {
  Matrix,
  MatrixType,
  MatrixValue,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { useScene3DStore } from "@/store/scene3DStore";
import { Matrix3, Vector3 } from "three";
import { degreesToRadians } from "@/lib/utils";

interface Props {
  matrix: Matrix;
}

export default function FillInMatrixInput({ matrix }: Props) {
  const { changeMatrixValue } = useFillBlankMatrixInputStore();
  const {
    getPoint,
    setPointTranslation,
    getPolygon,
    setPolygonScale,
    setPolygonRotation,
    setPolygonTranslation,
    setPointScale,
    setPolygonRotationMatrix,
  } = useScene2DStore();
  const { getCube, updateCube } = useScene3DStore();

  const handleInputChange = (
    row: number,
    col: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    // Replace comma with dot for number parsing
    const normalizedValue = value.replace(",", ".");

    // Regex to allow valid partial values like "-", "-.", "1,", "1.5", etc.
    const partialNumberRegex = /^-?\d*(\.|,)?\d*$/;

    // Add decimal point if the user types a number followed by a dot
    if (partialNumberRegex.test(value)) {
      changeMatrixValue(matrix.id, row, col, normalizedValue);
      return;
    }
  };

  // Apply transformation whenever the matrix value changes
  useEffect(() => {
    if (matrix.pointRefId) {
      const point = getPoint(matrix.pointRefId);
      if (point && matrix.type === MatrixType.TRANSLATION) {
        const translation = [
          Number(matrix.matrixValue[0][2].value),
          Number(matrix.matrixValue[1][2].value),
        ] as [number, number];
        if (translation.some(isNaN)) return; // Do nothing if any value is NaN
        setPointTranslation(matrix.pointRefId, translation);
      }

      if (point && matrix.type === MatrixType.SCALING) {
        const value00 = Number(matrix.matrixValue[0][0].value);
        const value11 = Number(matrix.matrixValue[1][1].value);
        const scale = [value00, value11] as [number, number];
        if (scale.some(isNaN)) return; // Do nothing if any value is NaN
        setPointScale(matrix.pointRefId, scale);
      }
    }

    if (matrix.polygonRefId || matrix.polygonRefIds?.length) {
      const polygonIds = matrix.polygonRefIds ?? [matrix.polygonRefId!];
      const polygon = getPolygon(polygonIds[0]);
      if (polygon && matrix.type === MatrixType.SCALING) {
        const value00 = Number(matrix.matrixValue[0][0].value);
        const value11 = Number(matrix.matrixValue[1][1].value);
        const scale = [value00, value11] as [number, number];
        if (scale.some(isNaN)) return; // Do nothing if any value is NaN
        polygonIds.forEach(polygonId => setPolygonScale(polygonId, scale));
      }

      if (matrix.type === MatrixType.ROTATION_Z) {
        const hasEditableEmptyCells = matrix.matrixValue.some(row =>
          row.some(cell => cell.editable && cell.value === "")
        );
        if (hasEditableEmptyCells) return; // Do nothing if any cell is empty

        const value00 = Number(matrix.matrixValue[0][0].value);
        const value01 = Number(matrix.matrixValue[0][1].value);
        const value10 = Number(matrix.matrixValue[1][0].value);
        const value11 = Number(matrix.matrixValue[1][1].value);
        const rotation = [value00, value01, value10, value11] as [
          number,
          number,
          number,
          number,
        ];
        const valuesAreValid = rotation.every(value => !isNaN(value)); // Check if all values are the same and not NaN
        if (!valuesAreValid) return;
        const customMatrix = new Matrix3().set(
          Math.cos(degreesToRadians(value00)),
          -Math.sin(degreesToRadians(value01)),
          0,
          Math.sin(degreesToRadians(value10)),
          Math.cos(degreesToRadians(value11)),
          0,
          0,
          0,
          1
        );
        polygonIds.forEach(polygonId =>
          setPolygonRotationMatrix(polygonId, customMatrix)
        );
      }

      if (matrix.type === MatrixType.TRANSLATION) {
        const translation = [
          Number(matrix.matrixValue[0][2].value),
          Number(matrix.matrixValue[1][2].value),
        ] as [number, number];
        if (translation.some(isNaN)) return; // Do nothing if any value is NaN
        polygonIds.forEach(polygonId =>
          setPolygonTranslation(polygonId, translation)
        );
      }

      if (matrix.type === MatrixType.IDENTITY) {
        // Generic 2x2 linear map: the typed cells are applied directly as
        // matrix entries (unlike ROTATION_Z, which interprets them as angles).
        // Used for exercises where the student types the raw matrix values.
        const a = Number(matrix.matrixValue[0][0].value);
        const b = Number(matrix.matrixValue[0][1].value);
        const c = Number(matrix.matrixValue[1][0].value);
        const d = Number(matrix.matrixValue[1][1].value);
        if ([a, b, c, d].some(isNaN)) return;
        const customMatrix = new Matrix3().set(a, b, 0, c, d, 0, 0, 0, 1);
        polygonIds.forEach(polygonId =>
          setPolygonRotationMatrix(polygonId, customMatrix)
        );
      }
    }

    if (matrix.objectRefId) {
      // Apply transformation to object
      const cube = getCube(matrix.objectRefId);
      if (cube && matrix.type === MatrixType.TRANSLATION) {
        const translation = new Vector3(
          Number(matrix.matrixValue[0][3].value),
          Number(matrix.matrixValue[1][3].value),
          Number(matrix.matrixValue[2][3].value)
        );
        if (translation.toArray().some(isNaN)) return; // Do nothing if any value is NaN
        updateCube(cube.id, { ...cube, translation });
      }
      if (cube && matrix.type === MatrixType.SCALING) {
        const scale = new Vector3(
          Number(matrix.matrixValue[0][0].value),
          Number(matrix.matrixValue[1][1].value),
          Number(matrix.matrixValue[2][2].value)
        );
        if (scale.toArray().some(isNaN)) return; // Do nothing if any value is NaN
        updateCube(cube.id, { ...cube, scale });
      }
      if (cube && matrix.type === MatrixType.ROTATION_X) {
        const value22 = Number(matrix.matrixValue[1][1].value);
        const value23 = Number(matrix.matrixValue[1][2].value);
        const value32 = Number(matrix.matrixValue[2][1].value);
        const value33 = Number(matrix.matrixValue[2][2].value);
        const rotation = new Vector3(
          Number(matrix.matrixValue[1][1].value),
          0,
          0
        );
        const valuesAreValid = [value22, value23, value32, value33].every(
          value => !isNaN(value) && value === value22
        ); // Check if all values are the same and not NaN
        if (!valuesAreValid) return; // Do nothing if any value is NaN
        updateCube(cube.id, { ...cube, rotation });
      }
      if (cube && matrix.type === MatrixType.ROTATION_Y) {
        const value00 = Number(matrix.matrixValue[0][0].value);
        const value02 = Number(matrix.matrixValue[0][2].value);
        const value20 = Number(matrix.matrixValue[2][0].value);
        const value22 = Number(matrix.matrixValue[2][2].value);
        const rotation = new Vector3(
          0,
          Number(matrix.matrixValue[0][2].value),
          0
        );
        const valuesAreValid = [value00, value02, value20, value22].every(
          value => !isNaN(value) && value === value22
        ); // Check if all values are the same and not NaN
        if (!valuesAreValid) return; // Do nothing if any value is NaN
        updateCube(cube.id, { ...cube, rotation });
      }
      if (cube && matrix.type === MatrixType.ROTATION_Z) {
        const value11 = Number(matrix.matrixValue[0][0].value);
        const value12 = Number(matrix.matrixValue[0][1].value);
        const value21 = Number(matrix.matrixValue[1][0].value);
        const value22 = Number(matrix.matrixValue[1][1].value);
        const rotation = new Vector3(
          0,
          0,
          Number(matrix.matrixValue[1][0].value)
        );
        const valuesAreValid = [value11, value12, value21, value22].every(
          value => !isNaN(value) && value === value11
        ); // Check if all values are the same and not NaN
        if (!valuesAreValid) return; // Do nothing if any value is NaN
        updateCube(cube.id, { ...cube, rotation });
      }
    }
  }, [
    matrix,
    setPolygonScale,
    getPoint,
    getPolygon,
    setPointTranslation,
    setPointScale,
    setPolygonRotation,
    setPolygonTranslation,
    getCube,
    updateCube,
    setPolygonRotationMatrix,
  ]);

  const trigMapping: Partial<Record<MatrixType, Record<string, string>>> = {
    [MatrixType.ROTATION_X]: {
      "1-1": "cos",
      "1-2": "-sin",
      "2-1": "sin",
      "2-2": "cos",
    },
    [MatrixType.ROTATION_Y]: {
      "0-0": "cos",
      "0-2": "-sin",
      "2-0": "sin",
      "2-2": "cos",
    },
    [MatrixType.ROTATION_Z]: {
      "0-0": "cos",
      "0-1": "-sin",
      "1-0": "sin",
      "1-1": "cos",
    },
  };

  const getTrigValue = (type: MatrixType, row: number, col: number) =>
    trigMapping[type]?.[`${row}-${col}`] || "";

  const generateEditableRotationMatrixCell = (
    matrixType: MatrixType,
    rowIndex: number,
    colIndex: number,
    cell: MatrixValue
  ) => {
    const trigValue = getTrigValue(matrixType, rowIndex, colIndex);

    return (
      <div
        className={`flex text-xs items-center justify-center ${
          trigValue ? "w-16" : "w-10"
        } h-10`}
        key={colIndex}
      >
        {trigValue && `${trigValue}(`}
        <input
          key={colIndex}
          type="text"
          autoComplete="off"
          className={`${
            trigValue ? "w-[30%]" : "w-full"
          } text-xs text-center bg-transparent border-b border-gray-500 focus:outline-none`}
          value={cell.value}
          onChange={e => handleInputChange(rowIndex, colIndex, e)}
        />
        {trigValue && ")"}
      </div>
    );
  };

  return (
    <div className="my-4">
      {matrix.label && (
        <div className="text-center text-sm font-semibold mb-1">
          {matrix.label}
        </div>
      )}
      <div className="relative matrix">
        {matrix.matrixValue.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-between">
            {row.map((cell, colIndex) =>
              cell.editable ? (
                generateEditableRotationMatrixCell(
                  matrix.type,
                  rowIndex,
                  colIndex,
                  cell
                )
              ) : (
                <div
                  key={colIndex}
                  className="w-10 h-10 text-xs text-center bg-transparent flex items-center justify-center"
                >
                  {cell.value}
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
