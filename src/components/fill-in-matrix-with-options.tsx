import { MatrixType, MatrixValue } from "@/store/fillInBlankMatrixInputStore";
import {
  Option,
  useFillInMatrixWithOptionsStore,
} from "@/store/fillInMatrixWithOptions";
import { MousePointerSquareDashedIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { useScene3DStore } from "@/store/scene3DStore";
import { Matrix3, Matrix4 } from "three";
import { useScene2DStore } from "@/store/scene2DStore";

export default function FillInMatrixWithOptions() {
  const { matrix, options, selectedOptions, selectOption, unselectOption } =
    useFillInMatrixWithOptionsStore();
  const {
    getCube,
    setCubeCustomXRotationMatrix,
    setCubeCustomYRotationMatrix,
    setCubeCustomZRotationMatrix,
  } = useScene3DStore();
  const { setPolygonRotationMatrix } = useScene2DStore();

  // Tracks changes to the matrix and processes updates
  useEffect(() => {
    if (
      !matrix?.objectRefId &&
      !matrix?.polygonRefId &&
      !matrix?.polygonRefIds?.length
    )
      return;

    const editableCells = matrix.matrixValue
      .flat()
      .filter(cell => cell.editable);
    const matrixElements = matrix.matrixValue
      .flat()
      .map(cell => cell.value as number);
    if (
      editableCells.length ||
      !matrixElements.every(value => typeof value === "number")
    )
      return;

    // If the matrix has a 3D object reference, set the rotation matrix
    if (matrix.objectRefId) {
      const customMatrix = new Matrix4()
        .set(
          matrixElements[0],
          matrixElements[1],
          matrixElements[2],
          matrixElements[3],
          matrixElements[4],
          matrixElements[5],
          matrixElements[6],
          matrixElements[7],
          matrixElements[8],
          matrixElements[9],
          matrixElements[10],
          matrixElements[11],
          matrixElements[12],
          matrixElements[13],
          matrixElements[14],
          matrixElements[15]
        )
        .transpose(); // Transpose the matrix to match the expected format for Three.js (column-major order)
      switch (matrix.type) {
        case MatrixType.ROTATION_X:
          setCubeCustomXRotationMatrix(matrix.objectRefId, customMatrix);
          break;
        case MatrixType.ROTATION_Y:
          setCubeCustomYRotationMatrix(matrix.objectRefId, customMatrix);
          break;
        case MatrixType.ROTATION_Z:
          setCubeCustomZRotationMatrix(matrix.objectRefId, customMatrix);
          break;
        default:
          break;
      }
    }

    // If the matrix has a polygon reference, set the rotation matrix
    if (matrix.polygonRefId || matrix.polygonRefIds?.length) {
      const customMatrix = new Matrix3().set(
        matrixElements[0],
        matrixElements[1],
        matrixElements[2],
        matrixElements[3],
        matrixElements[4],
        matrixElements[5],
        matrixElements[6],
        matrixElements[7],
        matrixElements[8]
      );
      const polygonIds = matrix.polygonRefIds ?? [matrix.polygonRefId!];
      polygonIds.forEach(polygonId =>
        setPolygonRotationMatrix(polygonId, customMatrix)
      );
    }
  }, [
    matrix,
    getCube,
    setCubeCustomXRotationMatrix,
    setCubeCustomYRotationMatrix,
    setCubeCustomZRotationMatrix,
    selectedOptions,
    setPolygonRotationMatrix,
  ]);

  // Gets the next editable cell
  const getNextEditableCell = () => {
    if (!matrix) return null;
    for (let row = 0; row < matrix.matrixValue.length; row++) {
      for (let col = 0; col < matrix.matrixValue[row].length; col++) {
        if (matrix.matrixValue[row][col].editable) {
          return { row, col };
        }
      }
    }
  };

  const handleOptionClick = (option: Option) => {
    const nextEditableCell = getNextEditableCell();
    if (!nextEditableCell) return;

    const { row, col } = nextEditableCell;
    selectOption(row, col, option.id);
  };

  const handleRemoveOption = (row: number, col: number) => {
    unselectOption(row, col);

    if (matrix?.objectRefId) {
      setCubeCustomXRotationMatrix(matrix.objectRefId, null);
      setCubeCustomYRotationMatrix(matrix.objectRefId, null);
      setCubeCustomZRotationMatrix(matrix.objectRefId, null);
    }
    if (matrix?.polygonRefId || matrix?.polygonRefIds?.length) {
      const polygonIds = matrix.polygonRefIds ?? [matrix.polygonRefId!];
      polygonIds.forEach(polygonId =>
        setPolygonRotationMatrix(polygonId, undefined)
      );
    }
  };

  const renderCell = (
    cell: MatrixValue,
    rowIndex: number,
    colIndex: number
  ) => {
    if (!matrix) return null;

    const selectedOption = selectedOptions.find(
      o => o.row === rowIndex && o.col === colIndex
    );

    const cellClasses = [
      MatrixType.IDENTITY,
      MatrixType.TRANSLATION,
      MatrixType.SCALING,
    ].includes(matrix.type)
      ? "w-16"
      : "w-20";

    return (
      <div
        key={colIndex}
        className={`${cellClasses} h-12 text-center bg-transparent flex items-center justify-center`}
      >
        {cell.editable ? (
          <MousePointerSquareDashedIcon />
        ) : selectedOption ? (
          <Button
            size="sm"
            onClick={() => handleRemoveOption(rowIndex, colIndex)}
          >
            {selectedOption.option.displayValue}
          </Button>
        ) : (
          <div>{cell.value}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center gap-4 my-2">
      <div className="relative matrix">
        {matrix?.matrixValue.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-between">
            {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap w-1/3">
        {options.map(option => (
          <Button
            key={option.id}
            onClick={() => handleOptionClick(option)}
            disabled={selectedOptions.some(o => o.option.id === option.id)}
          >
            {option.displayValue}
          </Button>
        ))}
      </div>
    </div>
  );
}
