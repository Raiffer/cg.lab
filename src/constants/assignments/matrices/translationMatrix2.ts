import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

export const translationMatrixAssignment2: Assignment = {
  id: "translation-matrix-2",
  title: "Matriz de Translação 2",
  instructions:
    "Altere a matriz de translação para mover o ponto A para a posição (2, 3).",
  assisted: false,
  order: 2,
  type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
  subjectCategory: "translation-matrix",
  setup: () => {
    const { setPoints } = useScene2DStore.getState();
    setPoints([
      {
        id: "A",
        label: "A",
        position: [-2, 4],
        movable: false,
        color: "red",
      },
    ]);

    const { addMatrix } = useFillBlankMatrixInputStore.getState();
    addMatrix({
      id: "translation-matrix",
      pointRefId: "A",
      type: MatrixType.TRANSLATION,
      dimention: "2D",
      matrixValue: [
        [
          { value: 1, editable: false },
          { value: 0, editable: false },
          { value: "", editable: true },
        ],
        [
          { value: 0, editable: false },
          { value: 1, editable: false },
          { value: "", editable: true },
        ],
        [
          { value: 0, editable: false },
          { value: 0, editable: false },
          { value: 1, editable: false },
        ],
      ],
    });
  },
  validate: () => {
    const { getMatrixById } = useFillBlankMatrixInputStore.getState();
    const { getPoint } = useScene2DStore.getState();
    const matrix = getMatrixById("translation-matrix");
    const point = getPoint("A");
    if (!matrix || !point || !point.translation) return false;

    if (point.translation[0] === 4 && point.translation[1] === -1) {
      return true;
    }

    return false;
  },
};
