import React from "react";
import FillCoordinateInput from "./fill-coordinate-input";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { useFillInVecLengthFormulaStore } from "@/store/fillInVecLengthFormulaStore";
import { useFillBlankMatrixInputStore } from "@/store/fillInBlankMatrixInputStore";
import FillInMatrixInput from "./fill-in-matrix-input";
import FillInMatrixWithOptions from "./fill-in-matrix-with-options";
import FillInVecLengthFormula from "./fill-in-vec-length-formula";
import OrderMatrixMultiplication from "./order-matrix-multiplication";
import FillInTheBlankWithOptions from "./fill-in-the-blank-with-options";
import { Button } from "./ui/button";
import { useFillInTheBlankStore } from "@/store/fillInTheBlankStore";
import { ChevronLeftCircle, ChevronRightCircle } from "lucide-react";

interface Props {
  assignment: Assignment | null;
  handleConfirm: () => void;
  handlePrevious?: () => void;
  handleNext?: () => void;
  questionNumber?: number;
}

export default function AssignmentNotAnswered({
  assignment,
  handleConfirm,
  handlePrevious,
  handleNext,
  questionNumber,
}: Props) {
  const { inputs } = useFillInTheBlankStore();
  const { matrices } = useFillBlankMatrixInputStore();
  const { vecLengthFormulas } = useFillInVecLengthFormulaStore();

  return (
    <>
      {questionNumber !== undefined && (
        <p className="text-sm font-semibold text-gray-500 mb-1">
          Questão {questionNumber}
        </p>
      )}
      <p className="text-base md:text-xl">{assignment?.instructions}</p>

      {assignment?.type === AssignmentType.FILL_IN_THE_BLANK_COORDINATES &&
        inputs.map((input, index) => (
          <FillCoordinateInput
            key={index}
            coordinateDimention={input.dimention}
            pointRef={input.pointRef}
            label={input.label}
          />
        ))}

      {assignment?.type === AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS && (
        <FillInTheBlankWithOptions />
      )}

      {matrices.map(matrix => (
        <FillInMatrixInput key={matrix.id} matrix={matrix} />
      ))}

      {assignment?.type ===
        AssignmentType.FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS && (
        <FillInMatrixWithOptions />
      )}

      {vecLengthFormulas.map((vecLengthFormula, index) => (
        <FillInVecLengthFormula
          key={index}
          vecLengthFormula={vecLengthFormula}
        />
      ))}

      <OrderMatrixMultiplication />

      {/*Div com os botões de confirmar respostas, ir para a questão anterior e próxima questão*/}
      <div className="flex items-center justify-center gap-4 mt-4">
        {handlePrevious && (
          <button onClick={handlePrevious}>
            <ChevronLeftCircle />
          </button>
        )}

        <Button onClick={handleConfirm}>Confirmar</Button>

        {handleNext && (
          <button onClick={handleNext}>
            <ChevronRightCircle />
          </button>
        )}
      </div>
    </>
  );
}
