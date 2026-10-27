import { parallelAssignmentList } from "./parallelAssignment";
import { perspectiveAssignmentV2AssignmentList } from "./perspectiveAssignmentV2";
import { projectionMultipleChoiceAssignmentList } from "./projectionMultipleChoiceAssignment";

export const projectionAssignments = [
  ...parallelAssignmentList,
  ...perspectiveAssignmentV2AssignmentList,
  ...projectionMultipleChoiceAssignmentList,
];
