import { rotationMatrixFillInput3DAssignmentList } from "./rotationMatrixFillInput3D";
import { rotationMatrixFillWithOptions3DAssignmentList } from "./rotationMatrixFillWithOptions3D";
import { scaleMatrixFillInput3DAssignmentList } from "./scaleMatrixFillInput3D";
import { translationMatrixFillInput3DAssignmentList } from "./translationMatrixFillInput3D";

export const matrices3dAssignments = [
  ...translationMatrixFillInput3DAssignmentList,
  ...scaleMatrixFillInput3DAssignmentList,
  ...rotationMatrixFillInput3DAssignmentList,
  ...rotationMatrixFillWithOptions3DAssignmentList,
];
