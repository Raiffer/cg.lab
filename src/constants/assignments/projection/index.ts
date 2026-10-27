import { parallelAssignmentList } from "./parallelAssignment";
import { perspectiveAssignment } from "./perspectiveAssignment";
import { perspectiveAssignmentV2AssignmentList } from "./perspectiveAssignmentV2";

export const projectionAssignments = [
  ...parallelAssignmentList,
  perspectiveAssignment,
  ...perspectiveAssignmentV2AssignmentList,
];
