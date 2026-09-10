import { applyScaleMatrixToPointAssignmentList } from "./applyScaleMatrixToPoint";
import { applyScaleMatrixToPolygonAssignmentList } from "./applyScaleMatrixToPolygon";
import { applyTranslationmatrixToPointAssignmentList } from "./applyTranslationMatrixToPoint";
import { applyTranslationMatrixToPolygonAssignmentList } from "./applyTranslationMatrixToPolygon";
import { constructInverseMatrixAssignmentList } from "./constructInverseMatrix";
import { fillInTranslationMatrixAssignmentList } from "./fillInTranslationMatrix";
import { identityMatrixAssignmentList } from "./identityMatrix";
import { matrixCommutativityComparisonAssignmentList } from "./matrixCommutativityComparison";
import { matrixElementIdentificationAssignmentList } from "./matrixElementIdentification";
import { matrixSingularityPredictionAssignmentList } from "./matrixSingularityPrediction";
import { matrixSumSubtractionGapAssignmentList } from "./matrixSumSubtractionGap";
import { orderingMatricesAssignments } from "./orderingMatrices";
import { rotationMatrixFillInBlankAssignments } from "./rotationMatrixFillInBlank";
import { rotationMatrixFillInWithOptionsAssignments } from "./rotationMatrixFillInWithOptions";
import { scaleForDoubleAreaAssignmentList } from "./scaleForDoubleArea";
import { scalePointAssignmentList } from "./scalePoint";
import { scalePolygonAssignmentList } from "./scalePolygon";
import { translationMatrix2dAssignmentList } from "./translationMatrix";

export const matricesAssignments = [
  // Matrix Fundamentals Assignments (element reading, sum/subtraction gap,
  // singularity — increasing difficulty)
  ...matrixElementIdentificationAssignmentList,
  ...matrixSumSubtractionGapAssignmentList,
  ...matrixSingularityPredictionAssignmentList,

  // Identity Matrix Assignments
  ...identityMatrixAssignmentList,

  // Translation Matrix Assignments
  ...translationMatrix2dAssignmentList,
  ...applyTranslationmatrixToPointAssignmentList,
  ...fillInTranslationMatrixAssignmentList,
  ...applyTranslationMatrixToPolygonAssignmentList,

  // Scale Matrix Assignments
  ...scalePointAssignmentList,
  ...scalePolygonAssignmentList,
  ...applyScaleMatrixToPointAssignmentList,
  ...applyScaleMatrixToPolygonAssignmentList,
  ...scaleForDoubleAreaAssignmentList,

  // Rotation Matrix Assignments
  ...rotationMatrixFillInWithOptionsAssignments,
  ...rotationMatrixFillInBlankAssignments,

  // Matrix Multiplication Assignments
  ...orderingMatricesAssignments,
  ...matrixCommutativityComparisonAssignmentList,

  // Inverse Matrix Assignments
  ...constructInverseMatrixAssignmentList,
];
