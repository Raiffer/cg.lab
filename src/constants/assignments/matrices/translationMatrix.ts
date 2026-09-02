import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

interface TranslationMatrix2DAssignmentProps {
  order: number;
  initialPosition: [number, number];
  goalPosition: [number, number];
}

function createTranslationMatrix2DAssignment({
  order,
  initialPosition,
  goalPosition,
}: TranslationMatrix2DAssignmentProps): Assignment {
  return {
    assisted: false,
    id: `translation-matrix-2d-${order}`,
    title: "Matriz de Translação",
    instructions: `Altere a matriz de translação para mover o ponto A para a posição (${goalPosition[0]}, ${goalPosition[1]}).`,
    order,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "translation-matrix",
    setup: () => {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A",
          label: "A",
          position: initialPosition,
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
      const matrix = getMatrixById("translation-matrix");
      const point = useScene2DStore.getState().getPoint("A");
      if (!matrix || !point || !point.translation) return false;

      const initialPositionTranslated = [
        initialPosition[0] + point.translation[0],
        initialPosition[1] + point.translation[1],
      ];
      const isCorrect =
        initialPositionTranslated[0] === goalPosition[0] &&
        initialPositionTranslated[1] === goalPosition[1];
      return isCorrect;
    },
  };
}

const translationMatrix2dAssignmentsProps: TranslationMatrix2DAssignmentProps[] =
  [
    {
      order: 1,
      initialPosition: [0, 0],
      goalPosition: [2, 3],
    },
    {
      order: 2,
      initialPosition: [-2, 4],
      goalPosition: [4, -1],
    },
    {
      order: 3,
      initialPosition: [1, 1],
      goalPosition: [5, 4],
    },
  ];

export const translationMatrix2dAssignmentList: Assignment[] =
  translationMatrix2dAssignmentsProps.map(props =>
    createTranslationMatrix2DAssignment(props)
  );
