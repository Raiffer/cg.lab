import { SubjectCategories } from "@/constants/defaultDailyMissions";

export enum AssignmentType {
  INTERACTIVE = "INTERACTIVE",
  SLIDER = "SLIDER",
  PARAMETERIZED = "PARAMETERIZED",
  ORDER_MATRIX_MULTIPLICATION = "ORDER_MATRIX_MULTIPLICATION",
  FILL_IN_THE_BLANK_COORDINATES = "FILL_IN_THE_BLANK_COORDINATES",
  FILL_IN_THE_BLANK_WITH_OPTIONS = "FILL_IN_THE_BLANK_WITH_OPTIONS",
  FILL_IN_THE_BLANK_MATRIX = "FILL_IN_THE_BLANK_MATRIX",
  FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS = "FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS",
  FILL_IN_THE_BLANK_FORMULA = "FILL_IN_THE_BLANK_FORMULA",
}

export interface SliderConfig {
  min: number;
  max: number;
  step?: number;
  initialValue: number;
  onChange?: (value: number) => void;
}

export interface SliderAssignmentButton {
  label: string;
  onClick: () => number | void;
  variant?: "default" | "outline" | "secondary" | "destructive";
  selectable?: boolean;
}

export type SliderAssignmentButtons =
  | []
  | [SliderAssignmentButton]
  | [SliderAssignmentButton, SliderAssignmentButton]
  | [SliderAssignmentButton, SliderAssignmentButton, SliderAssignmentButton];

export interface Assignment {
  id: string;
  order: number;
  title: string;
  instructions: string;
  assisted: boolean;
  type: AssignmentType;
  subjectCategory: SubjectCategories;
  setup: () => void;
  validate: () => boolean;
  onError?: () => void;
  showObjective?: boolean;
  slider?: SliderConfig;
  buttons?: SliderAssignmentButtons;
}

export interface RandomGeneratedAssignment extends Assignment {
  dimensions: "2D" | "3D";
}
