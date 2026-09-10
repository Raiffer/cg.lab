import { Assignment } from "@/types/Assignment";
import { transformationMovePolygonAssignmentsList } from "./movePolygon";
import { matricesAssignments } from "./matrices";

export const transformationAssignments: Assignment[] = [
  ...transformationMovePolygonAssignmentsList,
  ...matricesAssignments,
];
