import { rotationMatrixFillInput3DAssignmentList } from "./rotationMatrixFillInput3D";
import { rotationMatrixFillWithOptions3DAssignmentList } from "./rotationMatrixFillWithOptions3D";
import { scaleMatrixFillInput3DAssignmentList } from "./scaleMatrixFillInput3D";
import { translationMatrixFillInput3DAssignmentList } from "./translationMatrixFillInput3D";
import { translationMoveCubeAssignmentList } from "./translationMoveCube";
import { scaleMoveCubeAssignmentList } from "./scaleMoveCube";
import { rotateCubeAssignmentList } from "./rotateCube";
import { moveRotateCubeAssignmentList } from "./moveRotateCube";

export const matrices3dAssignments = [
  ...translationMoveCubeAssignmentList,
  ...translationMatrixFillInput3DAssignmentList,
  ...scaleMoveCubeAssignmentList,
  ...rotateCubeAssignmentList,
  ...moveRotateCubeAssignmentList,
  ...scaleMatrixFillInput3DAssignmentList,
  ...rotationMatrixFillInput3DAssignmentList,
  ...rotationMatrixFillWithOptions3DAssignmentList,
];
