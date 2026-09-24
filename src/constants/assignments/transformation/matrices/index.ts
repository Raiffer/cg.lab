import { applyScaleMatrixToPointAssignmentList } from "./applyScaleMatrixToPoint";
import { applyScaleMatrixToPolygonAssignmentList } from "./applyScaleMatrixToPolygon";
import { applyTranslationmatrixToPointAssignmentList } from "./applyTranslationMatrixToPoint";
import { applyTranslationMatrixToPolygonAssignmentList } from "./applyTranslationMatrixToPolygon";
import { determinantAreaTargetAssignmentList } from "./determinantAreaTarget";
import { determinantCalculationAssignmentList } from "./determinantCalculation";
import { determinantInverseConnectionAssignmentList } from "./determinantInverseConnection";
import { determinantRowSwapSignAssignmentList } from "./determinantRowSwapSign";
import { determinantScalarRowPropertyAssignmentList } from "./determinantScalarRowProperty";
import { determinantSignPredictionAssignmentList } from "./determinantSignPrediction";
import { fillInTranslationMatrixAssignmentList } from "./fillInTranslationMatrix";
import { matrixElementIdentificationAssignmentList } from "./matrixElementIdentification";
import { matrixMatrixMultiplicationAssignmentList } from "./matrixMatrixMultiplication";
import { matrixScalarMultiplicationAssignmentList } from "./matrixScalarMultiplication";
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
  // Matrix Fundamentals Assignments (element reading, sum/subtraction gap —
  // increasing difficulty)
  ...matrixElementIdentificationAssignmentList,
  ...matrixSumSubtractionGapAssignmentList,

  // Determinant Assignments (sign/area without calculating, calculation
  // itself, row-swap/scalar properties, singularity, and the explicit bridge
  // back to "does A have an inverse?" from Module 1 — increasing difficulty)
  ...determinantSignPredictionAssignmentList,
  ...determinantCalculationAssignmentList,
  ...determinantAreaTargetAssignmentList,
  ...determinantRowSwapSignAssignmentList,
  ...determinantScalarRowPropertyAssignmentList,
  ...matrixSingularityPredictionAssignmentList,
  ...determinantInverseConnectionAssignmentList,

  // Translation Assignments
  ...applyTranslationmatrixToPointAssignmentList,
  ...translationMatrix2dAssignmentList,
  ...applyTranslationMatrixToPolygonAssignmentList,
  ...fillInTranslationMatrixAssignmentList,

  // Scale Assignments
  ...scalePointAssignmentList,
  ...scalePolygonAssignmentList,
  ...applyScaleMatrixToPointAssignmentList,
  ...applyScaleMatrixToPolygonAssignmentList,
  ...scaleForDoubleAreaAssignmentList,

  // Rotation Assignments
  ...rotationMatrixFillInWithOptionsAssignments,
  ...rotationMatrixFillInBlankAssignments,

  // Matrix Multiplication Assignments (mechanics first, then applying it to
  // compose transformations)
  ...matrixScalarMultiplicationAssignmentList,
  ...matrixMatrixMultiplicationAssignmentList,
  ...orderingMatricesAssignments,
];
