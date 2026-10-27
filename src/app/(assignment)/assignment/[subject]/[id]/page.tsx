"use client";

// External dependencies
import React, { useLayoutEffect, use, useState } from "react";
import { ChevronDown } from "lucide-react";

// Components
import GenericScene2D from "@/components/generic-scene-2d";
import GenericScene3D from "@/components/generic-scene-3d";
import ObjectivePanel2D from "@/components/objective-panel-2d";
import ObjectivePanel3D from "@/components/objective-panel-3d";
import AssignmentNotAnswered from "@/components/assignment-not-answered";
import AssignmentResult from "@/components/assignment-result";
import AssignmentInfoButton from "@/components/assignment-info-button";
import SidePanel from "@/components/side-panel";

// Hooks
import { useSubjectAssignmentPage } from "@/hooks/use-subject-assignment-page";

// Store
import { useScene2DStore } from "@/store/scene2DStore";

export default function SpecificAssignmentPage({
  params,
}: {
  params: Promise<{ subject: string; id: string }>;
}) {
  // State initialization
  const { subject, id } = use(params);
  const { config } = useScene2DStore();
  const [isAssignmentMinimized, setIsAssignmentMinimized] = useState(false);
  const {
    assignment,
    subjectData,
    assignmentState,
    isLastAssignmentInSubject,
    handleConfirm,
    handleTryAgain,
    handleNext,
    handlePrevious,
  } = useSubjectAssignmentPage(subject, id);

  useLayoutEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Early return if no assignment loaded
  if (!assignment || !subjectData) return null;

  // Some exercises (e.g. matrix identification) don't use the cartesian plane:
  // hide the scene, paint the background white and center the question.
  const hideCanvas = assignment.hideCanvas ?? false;

  return (
    <>
      <AssignmentInfoButton />

      {/* Render appropriate scene based on subject type, or a blank white
          background for exercises that don't use the cartesian plane */}
      {hideCanvas ? (
        <div className="fixed inset-0 bg-white" />
      ) : subjectData.type === "2D" ? (
        <>
          <GenericScene2D config={config} />
          <ObjectivePanel2D />
        </>
      ) : (
        <>
          <GenericScene3D
            parallelProjection={
              assignment.subjectCategory === "projection" &&
              assignment.projectionMode === "parallel"
            }
            perspectiveProjection={
              assignment.subjectCategory === "projection" &&
              assignment.projectionMode === "perspective"
            }
            projectionMode={assignment.projectionMode}
            extendNegativeZGrid={assignment.subjectCategory === "projection"}
          />
          <ObjectivePanel3D
            minimalView={assignment.subjectCategory === "projection"}
            mirrorMainScene={assignment.subjectCategory === "projection"}
            projectionMode={assignment.projectionMode}
            extendNegativeZGrid={assignment.subjectCategory === "projection"}
          />
        </>
      )}

      {/* Side panel container */}
      <SidePanel subject={subject} currentAssignmentId={assignment.id} />

      {/* Assignment interface container */}
      <div
        id="assignment-panel"
        className={`absolute overflow-hidden transition-[max-height,width,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hideCanvas
            ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 md:w-[560px] rounded-xl bg-white border border-gray-200 shadow-xl"
            : "bottom-4 left-2 w-3/4 md:w-[40%] rounded-md bg-gray-200 border-b-4 border-b-gray-400"
        } ${
          !hideCanvas && isAssignmentMinimized
            ? "max-h-12 opacity-95"
            : "max-h-[80vh] opacity-100"
        }`}
      >
        {!hideCanvas && (
          <div className="flex items-center justify-between bg-gray-300 px-3 py-2 cursor-pointer select-none transition-colors duration-300 hover:bg-gray-200">
            <span className="text-sm font-semibold text-gray-700">Questão</span>
            <button
              type="button"
              aria-label={
                isAssignmentMinimized
                  ? "Expandir painel da questão"
                  : "Minimizar painel da questão"
              }
              onClick={() => setIsAssignmentMinimized(value => !value)}
              className="rounded-full p-1 transition-transform duration-300 hover:bg-gray-200"
              style={{
                transform: isAssignmentMinimized
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}

        <div
          className={
            hideCanvas
              ? "max-h-[80vh] overflow-y-auto"
              : `overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isAssignmentMinimized
                    ? "max-h-0 opacity-0 -translate-y-2"
                    : "max-h-[70vh] opacity-100 translate-y-0"
                }`
          }
        >
          <div className={`text-center ${hideCanvas ? "p-6" : "p-4"}`}>
            {/* Conditional rendering based on assignment state */}
            {assignmentState === "notAnswered" ? (
              <AssignmentNotAnswered
                assignment={assignment}
                handleConfirm={answers => handleConfirm({ answers })}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
              />
            ) : (
              <AssignmentResult
                state={assignmentState}
                isLastAssignment={isLastAssignmentInSubject}
                onTryAgain={handleTryAgain}
                onNext={handleNext}
                feedback={assignment.feedback}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
