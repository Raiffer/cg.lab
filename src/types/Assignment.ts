import { SubjectCategories } from "@/constants/defaultDailyMissions";

export enum AssignmentType {
  INTERACTIVE = "INTERACTIVE",
  PARAMETERIZED = "PARAMETERIZED",
  ORDER_MATRIX_MULTIPLICATION = "ORDER_MATRIX_MULTIPLICATION",
  FILL_IN_THE_BLANK_COORDINATES = "FILL_IN_THE_BLANK_COORDINATES",
  FILL_IN_THE_BLANK_WITH_OPTIONS = "FILL_IN_THE_BLANK_WITH_OPTIONS",
  FILL_IN_THE_BLANK_MATRIX = "FILL_IN_THE_BLANK_MATRIX",
  FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS = "FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS",
  FILL_IN_THE_BLANK_FORMULA = "FILL_IN_THE_BLANK_FORMULA",
}

export interface Assignment {
  id: string;
  order: number;
  title: string;
  instructions: string;
  assisted: boolean;
  /**
   * When true, the assignment doesn't use the 2D/3D scene: the plane/grid is
   * hidden, the background is plain white and the question panel is centered
   * on the page. Used by exercises that only manipulate matrices/text.
   */
  hideCanvas?: boolean;
  /**
   * Optional short pedagogical message shown alongside the correct/incorrect
   * result, tying the answer back to the concept being tested — e.g.
   * explaining *why* it was right, or pointing attention back at what to
   * look for on a miss. Purely additive: assignments that don't set it keep
   * the plain "Você acertou/errou" message.
   *
   * Either field can be a plain string, or a function called at render time
   * — for exercises where the explanation depends on which wrong option was
   * actually picked (read from the relevant store inside the function).
   */
  feedback?: {
    correct?: string | (() => string);
    incorrect?: string | (() => string);
  };
  type: AssignmentType;
  subjectCategory: SubjectCategories;
  setup: () => void;
  validate: () => boolean;
  onError?: () => void;
  showObjective?: boolean;
}

export interface RandomGeneratedAssignment extends Assignment {
  dimensions: "2D" | "3D";
}
