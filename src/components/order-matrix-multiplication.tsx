import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import Latex from "react-latex-next";
import { Matrix3, Matrix4 } from "three";
import { useOrderMatrixStore } from "@/store/orderMatrixMultiplicationStore";
import { useScene2DStore } from "@/store/scene2DStore";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash } from "lucide-react";
import { Button } from "./ui/button";

export default function OrderMatrixMultiplication() {
  const {
    matricesOptions,
    objectsMatrices,
    updateObjectMatrix,
    setObjectMatrices,
  } = useOrderMatrixStore();
  const { getPolygon, setPolygonPoints } = useScene2DStore();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [activeMatrix, setActiveMatrix] = useState<Matrix3 | Matrix4 | null>(
    null
  );

  // Portal the toolbar straight into <body> instead of rendering it in
  // place. #assignment-panel's content wrapper always carries a
  // `translate-y-*` class (even `translate-y-0`) for its minimize
  // animation, and applying *any* transform to an ancestor — including a
  // no-op one — makes that ancestor the containing block for descendant
  // `position: fixed` elements instead of the viewport. Combined with
  // that same wrapper's `overflow-hidden`/`max-h-[70vh]`, a `fixed`
  // toolbar rendered in place gets clipped or mis-positioned relative to
  // the panel instead of floating freely. Rendering via a portal escapes
  // that ancestor chain entirely so `fixed` is always viewport-relative.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // How far (in px) above the viewport bottom the toolbar's bottom edge
  // must sit to clear the question panel with a small gap, measured live
  // off #assignment-panel — the panel's height changes with viewport size,
  // question content and minimize state, so no fixed number works for
  // every case (a static offset either overlaps the panel on short
  // viewports or leaves a huge gap on tall ones). `bottom-96` in the
  // className below is only the fallback used before the first
  // measurement lands. `toolbarMaxHeight` caps the toolbar so, even when
  // the panel is tall and leaves little room above it, the toolbar
  // shrinks (and scrolls internally) rather than getting pushed above
  // the top of the viewport.
  const [toolbarBottomOffset, setToolbarBottomOffset] = useState<
    number | null
  >(null);
  const [toolbarMaxHeight, setToolbarMaxHeight] = useState<number | null>(
    null
  );

  useLayoutEffect(() => {
    const panel = document.getElementById("assignment-panel");
    if (!panel) return;

    const GAP_ABOVE_PANEL_PX = 12;
    const MIN_TOP_MARGIN_PX = 16;
    const updateOffset = () => {
      const rect = panel.getBoundingClientRect();
      setToolbarBottomOffset(
        window.innerHeight - rect.top + GAP_ABOVE_PANEL_PX
      );
      setToolbarMaxHeight(
        Math.max(rect.top - GAP_ABOVE_PANEL_PX - MIN_TOP_MARGIN_PX, 0)
      );
    };

    updateOffset();

    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(panel);
    window.addEventListener("resize", updateOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  useEffect(() => {
    Object.keys(objectsMatrices).forEach(objectKey => {
      const sceneObject = getPolygon(objectKey);
      const objectMatrices = objectsMatrices[objectKey] || [];
      const newPoints = sceneObject?.originalPoints?.map(point => {
        const modelMatrix = new Matrix3().identity();
        objectMatrices.forEach(matrix => {
          if (matrix instanceof Matrix3) {
            modelMatrix.multiply(matrix);
          }
        });

        const [x, y] = point.position;
        const w = 1;
        const newX =
          modelMatrix.elements[0] * x +
          modelMatrix.elements[1] * y +
          modelMatrix.elements[2] * w;
        const newY =
          modelMatrix.elements[3] * x +
          modelMatrix.elements[4] * y +
          modelMatrix.elements[5] * w;
        return {
          id: point.id,
          position: [newX, newY] as [number, number],
          movable: false,
        };
      });
      if (sceneObject && newPoints)
        setPolygonPoints(sceneObject?.id, newPoints);
    });
  }, [objectsMatrices, getPolygon, setPolygonPoints]);

  const onDragStart = (event: DragStartEvent) => {
    setActiveMatrix(
      objectsMatrices.square1[Number(String(event.active.id).split("-")[2])]
    );
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      console.log("active", active.id);
      console.log("over", over.id);
      const objectKey = Object.keys(objectsMatrices)[0];
      const activeIndex = Number(String(active.id).split("-")[2]);
      const overIndex = Number(String(over.id).split("-")[2]);
      setObjectMatrices(
        objectKey,
        arrayMove(objectsMatrices[objectKey], activeIndex, overIndex)
      );
      setActiveMatrix(null);
    }
  };

  const handleOptionClick = (option: {
    id: string;
    matrix: Matrix3 | Matrix4;
  }) => {
    const objectKey = Object.keys(objectsMatrices)[0];
    if (objectKey in objectsMatrices) {
      updateObjectMatrix(
        objectKey,
        objectsMatrices[objectKey].length,
        option.matrix
      );
    }
  };

  const handleRemoveMatrix = (index: number) => {
    const objectKey = Object.keys(objectsMatrices)[0];
    if (objectKey in objectsMatrices) {
      const newMatrices = objectsMatrices[objectKey].filter(
        (_, i) => i !== index
      );
      setObjectMatrices(objectKey, newMatrices);
    }
  };

  if (matricesOptions.length === 0) return null;

  return (
    <div className="flex items-center justify-center space-x-4 mt-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
      >
        {Object.keys(objectsMatrices).map(objectKey => (
          <SortableContext
            key={objectKey}
            items={objectsMatrices[objectKey].map(
              (_, index) => `matrix-${objectKey}-${index}`
            )}
            strategy={horizontalListSortingStrategy}
          >
            <Droppable objectKey={objectKey}>
              {objectsMatrices[objectKey]?.length > 0 ? (
                objectsMatrices[objectKey].map((matrix, index) => {
                  const matrixOption = matricesOptions.find(
                    option => option.matrix === matrix
                  );
                  return (
                    <Fragment key={index}>
                      <div className="relative">
                        <SortableItem id={`matrix-${objectKey}-${index}`}>
                          <MatrixLatex
                            matrix={matrix}
                            rotationAxis={matrixOption?.rotationAxis}
                            rotationAngle={matrixOption?.rotationAngle}
                          />
                        </SortableItem>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute -top-3 -right-3 text-xs rounded-full p-1 w-8 h-8"
                          onClick={() => handleRemoveMatrix(index)}
                        >
                          <Trash size={20} />
                        </Button>
                      </div>
                      {index < objectsMatrices[objectKey].length - 1 && (
                        <Latex>
                          {`$$
                        \\times
                        $$`}
                        </Latex>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <div className="text-gray-400 text-center w-full">
                  Escolha as matrizes para serem ordenadas
                </div>
              )}
            </Droppable>
          </SortableContext>
        ))}

        <DragOverlay>
          {activeMatrix && (
            <div className="text-sm p-1 bg-blue-500 hover:bg-blue-600 rounded-md text-white opacity-40">
              <MatrixLatex matrix={activeMatrix} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
      {/* Floating toolbar of available matrices, portaled into <body> (see
          the `mounted` effect above) so it's never clipped by, or
          accidentally anchored to, an ancestor of #assignment-panel.
          `fixed` (not `absolute`) is on purpose: with the portal, its
          containing block is genuinely the viewport. `bottom` is measured
          live off #assignment-panel (the effect above) instead of a
          guessed constant, so it always sits right above the panel with no
          overlap — a static number either overlaps the panel (short
          viewports / long content) or leaves it clipped/far away (tall
          viewports), because panel height varies and a fixed offset can't
          track that. `maxHeight` shrinks the toolbar (with internal
          scrolling) instead of letting it get pushed above the top of the
          viewport when the panel leaves little room above it. `bottom-96`
          is only the fallback shown before the first measurement lands. */}
      {mounted &&
        createPortal(
          <div
            className="fixed bottom-96 left-2 z-30 flex max-w-[90vw] flex-wrap gap-2 overflow-y-auto rounded-md bg-white p-2"
            style={{
              ...(toolbarBottomOffset !== null
                ? { bottom: toolbarBottomOffset }
                : undefined),
              ...(toolbarMaxHeight !== null
                ? { maxHeight: toolbarMaxHeight }
                : undefined),
            }}
          >
            {matricesOptions.map(option => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className="p-1 text-xs bg-blue-500 hover:bg-blue-600 rounded-md text-white"
              >
                <MatrixLatex
                  matrix={option.matrix}
                  rotationAxis={option.rotationAxis}
                  rotationAngle={option.rotationAngle}
                />
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

function Droppable({
  children,
  objectKey,
}: {
  children?: React.ReactNode;
  objectKey: string;
}) {
  const { setNodeRef } = useDroppable({
    id: objectKey,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex items-center justify-start gap-2 bg-gray-100 p-0 rounded-lg shadow w-full h-32 overflow-x-auto px-2"
    >
      {children}
    </div>
  );
}

function SortableItem({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative p-1 text-sm bg-blue-500 hover:bg-blue-600 rounded-md text-white"
    >
      {children}
    </div>
  );
}

function formatMatrixElement(
  value: number,
  row: number,
  col: number,
  rotationAxis?: "x" | "y" | "z",
  rotationAngle?: number
): string {
  if (!rotationAxis || !rotationAngle) {
    return value.toFixed(1);
  }

  // Handle known values dynamically using axis and angle
  if (rotationAxis === "x") {
    if (row === 1 && col === 1) return `\\cos ${rotationAngle}^\\circ`;
    if (row === 1 && col === 2) return `-\\sin ${rotationAngle}^\\circ`;
    if (row === 2 && col === 1) return `\\sin ${rotationAngle}^\\circ`;
    if (row === 2 && col === 2) return `\\cos ${rotationAngle}^\\circ`;
  }

  if (rotationAxis === "y") {
    if (row === 0 && col === 0) return `\\cos ${rotationAngle}^\\circ`;
    if (row === 0 && col === 2) return `\\sin ${rotationAngle}^\\circ`;
    if (row === 2 && col === 0) return `-\\sin ${rotationAngle}^\\circ`;
    if (row === 2 && col === 2) return `\\cos ${rotationAngle}^\\circ`;
  }

  if (rotationAxis === "z") {
    if (row === 0 && col === 0) return `\\cos ${rotationAngle}^\\circ`;
    if (row === 0 && col === 1) return `-\\sin ${rotationAngle}^\\circ`;
    if (row === 1 && col === 0) return `\\sin ${rotationAngle}^\\circ`;
    if (row === 1 && col === 1) return `\\cos ${rotationAngle}^\\circ`;
  }

  // Default: return number with 2 decimal places
  return value.toFixed(1);
}

function MatrixLatex({
  matrix,
  rotationAxis,
  rotationAngle,
}: {
  matrix: Matrix3 | Matrix4;
  rotationAxis?: "x" | "y" | "z";
  rotationAngle?: number;
}) {
  return (
    <div className="text-sm rounded-md">
      {matrix instanceof Matrix3 ? (
        <Latex>
          {`$$
          \\begin{bmatrix}
            ${formatMatrixElement(matrix.elements[0], 0, 0, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[1], 0, 1, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[2], 0, 2, rotationAxis, rotationAngle)} \\\\
            ${formatMatrixElement(matrix.elements[3], 1, 0, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[4], 1, 1, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[5], 1, 2, rotationAxis, rotationAngle)} \\\\
            ${formatMatrixElement(matrix.elements[6], 2, 0, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[7], 2, 1, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[8], 2, 2, rotationAxis, rotationAngle)} \\\\
          \\end{bmatrix}
          $$`}
        </Latex>
      ) : (
        <Latex>
          {`$$
          \\begin{bmatrix}
            ${formatMatrixElement(matrix.elements[0], 0, 0, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[1], 0, 1, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[2], 0, 2, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[3], 0, 3, rotationAxis, rotationAngle)} \\\\
            ${formatMatrixElement(matrix.elements[4], 1, 0, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[5], 1, 1, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[6], 1, 2, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[7], 1, 3, rotationAxis, rotationAngle)} \\\\
            ${formatMatrixElement(matrix.elements[8], 2, 0, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[9], 2, 1, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[10], 2, 2, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[11], 2, 3, rotationAxis, rotationAngle)} \\\\
            ${formatMatrixElement(matrix.elements[12], 3, 0, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[13], 3, 1, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[14], 3, 2, rotationAxis, rotationAngle)} & ${formatMatrixElement(matrix.elements[15], 3, 3)} \\\\
          \\end{bmatrix}
          $$`}
        </Latex>
      )}
    </div>
  );
}
