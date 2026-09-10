import { MatrixValue } from "@/store/fillInBlankMatrixInputStore";

export const initial2DTranslationMatrixValue: MatrixValue[][] = [
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
];

export const initial2DScalingMatrixValue: MatrixValue[][] = [
  [
    { value: "", editable: true },
    { value: 0, editable: false },
    { value: 0, editable: false },
  ],
  [
    { value: 0, editable: false },
    { value: "", editable: true },
    { value: 0, editable: false },
  ],
  [
    { value: 0, editable: false },
    { value: 0, editable: false },
    { value: 1, editable: false },
  ],
];

export const initial2DRotationMatrixXValue: MatrixValue[][] = [
  [
    { value: 1, editable: false },
    { value: "", editable: true },
    { value: "", editable: true },
  ],
  [
    { value: 0, editable: false },
    { value: "", editable: true },
    { value: 0, editable: false },
  ],
  [
    { value: 0, editable: false },
    { value: "", editable: true },
    { value: 1, editable: false },
  ],
];

export const initial2DRotationMatrixYValue: MatrixValue[][] = [
  [
    { value: "", editable: true },
    { value: 0, editable: false },
    { value: "", editable: true },
  ],
  [
    { value: 0, editable: false },
    { value: "", editable: true },
    { value: 0, editable: false },
  ],
  [
    { value: "", editable: true },
    { value: 0, editable: false },
    { value: "", editable: true },
  ],
];

export const initial2DRotationMatrixZValue: MatrixValue[][] = [
  [
    { value: "", editable: true },
    { value: "", editable: true },
    { value: 0, editable: false },
  ],
  [
    { value: "", editable: true },
    { value: "", editable: true },
    { value: 0, editable: false },
  ],
  [
    { value: 0, editable: false },
    { value: 0, editable: false },
    { value: 1, editable: false },
  ],
];
