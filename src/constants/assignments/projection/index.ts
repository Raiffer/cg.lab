import { parallelAssignment } from "./parallelAssignment";
import { perspectiveAssignment } from "./perspectiveAssignment";
import { perspectiveAssignmentV2AssignmentList } from "./perspectiveAssignmentV2";

export const projectionAssignments = [
  parallelAssignment,
  perspectiveAssignment,
  ...perspectiveAssignmentV2AssignmentList,
];
