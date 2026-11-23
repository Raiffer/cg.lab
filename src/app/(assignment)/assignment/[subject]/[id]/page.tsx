"use client";

// External dependencies
import { redirect } from "next/navigation";
import React, {
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  use,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";

// Components
import GenericScene2D from "@/components/generic-scene-2d";
import GenericScene3D from "@/components/generic-scene-3d";
import ObjectivePanel2D from "@/components/objective-panel-2d";
import ObjectivePanel3D from "@/components/objective-panel-3d";
import AssignmentNotAnswered from "@/components/assignment-not-answered";
import AssignmentResult from "@/components/assignment-result";
import SidePanel from "@/components/side-panel";
import { Button } from "@/components/ui/button";

// Hooks
import { useAssignment } from "@/hooks/use-assignment";
import { useAssignmentKeyboardShortcuts } from "@/hooks/use-assignment-keyboard-shortcut";
import { useResetStores } from "@/hooks/use-reset-stores";

// Store
import { useScene2DStore } from "@/store/scene2DStore";

// Constants
import { subjects } from "@/constants/assignments";
import { SubjectCategories } from "@/constants/defaultDailyMissions";

// The info-button hover/pop-up feedback mechanic is scoped to the modules
// Guilherme built and maintains (Fundamentos de Matrizes, Determinantes,
// Sistemas Lineares 2D/3D, which all share the "linear-systems" category) —
// every other module keeps the original inline incorrect-feedback text.
const OWNED_SUBJECT_CATEGORIES: SubjectCategories[] = [
  "matrix-fundamentals",
  "determinants",
  "linear-systems",
];

export default function SpecificAssignmentPage({
  params,
}: {
  params: Promise<{ subject: string; id: string }>;
}) {
  // State initialization
  const { subject, id } = use(params);
  const { config } = useScene2DStore();
  const [isInfoHovered, setIsInfoHovered] = useState(false);
  const [isAssignmentMinimized, setIsAssignmentMinimized] = useState(false);
  const {
    assignment,
    setAssignment,
    assignmentState,
    setAssignmentState,
    handleConfirm,
    setStartTime,
    incrementAttemptCount,
    resetAttemptCount,
    wrongAttemptCount,
    lastIncorrectFeedback,
    resetWrongAttempts,
  } = useAssignment(subject);
  const resetAll = useResetStores();

  // Derived state
  const subjectData = useMemo(
    () => subjects.find(s => s.slug === subject),
    [subject]
  );
  const isLastAssignmentInSubject = useMemo(() => {
    if (!subjectData || !assignment) return false;
    const currentIndex = subjectData.assignments.findIndex(
      a => a.id === assignment.id
    );
    return currentIndex === subjectData.assignments.length - 1;
  }, [assignment, subjectData]);

  // Effects
  useEffect(() => {
    resetAll();
    if (!subjectData) return;

    const assi = subjectData.assignments.find(a => a.id === id);
    if (assi) {
      setStartTime(Date.now());
      setAssignment(assi);
      assi.setup();
    }
  }, [id, subjectData, resetAll, setAssignment, setStartTime]);

  useLayoutEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Event handlers
  const handleTryAgain = useCallback(() => {
    resetAll();
    setAssignmentState("notAnswered");
    setStartTime(Date.now());
    incrementAttemptCount();
    assignment?.setup();
  }, [
    resetAll,
    assignment,
    setAssignmentState,
    setStartTime,
    incrementAttemptCount,
  ]);

  const handleNext = useCallback(() => {
    if (!assignment || !subjectData) return;

    const currentIndex = subjectData.assignments.findIndex(
      a => a.id === assignment.id
    );
    const nextAssignment = subjectData.assignments[currentIndex + 1];

    if (nextAssignment) {
      resetAttemptCount();
      resetWrongAttempts();
      redirect(`/assignment/${subject}/${nextAssignment.id}`);
    } else {
      redirect(`/subject/${subject}`);
    }
  }, [assignment, subject, subjectData, resetAttemptCount, resetWrongAttempts]);

  const handlePrevious = useCallback(() => {
    if (!assignment || !subjectData) return;

    const currentIndex = subjectData.assignments.findIndex(
      a => a.id === assignment.id
    );
    const previousAssignment = subjectData.assignments[currentIndex - 1];

    if (previousAssignment) {
      resetAttemptCount();
      resetWrongAttempts();
      redirect(`/assignment/${subject}/${previousAssignment.id}`);
    } else {
      redirect(`/subject/${subject}`);
    }
  }, [assignment, subject, subjectData, resetAttemptCount, resetWrongAttempts]);

  // Keyboard shortcuts
  useAssignmentKeyboardShortcuts(
    assignmentState,
    handleConfirm,
    handleTryAgain,
    handleNext
  );

  // Early return if no assignment loaded
  if (!assignment || !subjectData) return null;

  // Some exercises (e.g. matrix identification) don't use the cartesian plane:
  // hide the scene, paint the background white and center the question.
  const hideCanvas = assignment.hideCanvas ?? false;

  const isOwnedModule = OWNED_SUBJECT_CATEGORIES.includes(
    assignment.subjectCategory
  );

  // The incorrect-feedback hint only exists once the student has actually
  // gotten this question wrong at least once, only for exercises that define
  // one, and only in the modules that moved to this mechanic. It stays
  // available while they retry (assignmentState goes back to
  // "notAnswered"), and disappears once they finally get it right.
  const hasIncorrectHint =
    isOwnedModule &&
    Boolean(lastIncorrectFeedback) &&
    assignmentState !== "correct";
  // After 2 wrong attempts the student is clearly stuck: the info button
  // pops open on its own instead of waiting to be hovered.
  const shouldAutoOpenInfo = wrongAttemptCount > 2;
  const isInfoVisible = hasIncorrectHint && (isInfoHovered || shouldAutoOpenInfo);

  return (
    <>
      {hasIncorrectHint && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
          {isInfoVisible && (
            <div
              role="status"
              className="w-64 rounded-md border bg-white p-4 text-sm shadow-lg"
            >
              {lastIncorrectFeedback}
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full bg-white ${
              shouldAutoOpenInfo ? "ring-2 ring-red-400 animate-pulse" : ""
            }`}
            aria-label="Ver dica sobre a resposta incorreta"
            aria-expanded={isInfoVisible}
            onMouseEnter={() => setIsInfoHovered(true)}
            onMouseLeave={() => setIsInfoHovered(false)}
            onFocus={() => setIsInfoHovered(true)}
            onBlur={() => setIsInfoHovered(false)}
          >
            <span className="text-lg font-bold">i</span>
          </Button>
        </div>
      )}

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
                hideIncorrectFeedbackInline={isOwnedModule}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
