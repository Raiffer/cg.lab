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

export default function SpecificAssignmentPage({
  params,
}: {
  params: Promise<{ subject: string; id: string }>;
}) {
  // State initialization
  const { subject, id } = use(params);
  const { config } = useScene2DStore();
  const [isInfoVisible, setIsInfoVisible] = useState(false);
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
      redirect(`/assignment/${subject}/${nextAssignment.id}`);
    } else {
      redirect(`/subject/${subject}`);
    }
  }, [assignment, subject, subjectData, resetAttemptCount]);

  const handlePrevious = useCallback(() => {
    if (!assignment || !subjectData) return;

    const currentIndex = subjectData.assignments.findIndex(
      a => a.id === assignment.id
    );
    const previousAssignment = subjectData.assignments[currentIndex - 1];

    if (previousAssignment) {
      resetAttemptCount();
      redirect(`/assignment/${subject}/${previousAssignment.id}`);
    } else {
      redirect(`/subject/${subject}`);
    }
  }, [assignment, subject, subjectData, resetAttemptCount]);

  // Keyboard shortcuts
  useAssignmentKeyboardShortcuts(
    assignmentState,
    handleConfirm,
    handleTryAgain,
    handleNext
  );

  // Early return if no assignment loaded
  if (!assignment || !subjectData) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {isInfoVisible && (
          <div
            role="status"
            className="w-64 rounded-md border bg-white p-4 text-sm shadow-lg"
          />
        )}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white"
          aria-label="Abrir informações da questão"
          aria-expanded={isInfoVisible}
          onClick={() => setIsInfoVisible(visible => !visible)}
        >
          <span className="text-lg font-bold">i</span>
        </Button>
      </div>

      {/* Render appropriate scene based on subject type */}
      {subjectData.type === "2D" ? (
        <>
          <GenericScene2D config={config} />
          <ObjectivePanel2D />
        </>
      ) : (
        <>
          <GenericScene3D />
          <ObjectivePanel3D />
        </>
      )}

      {/* Side panel container */}
      <SidePanel subject={subject} currentAssignmentId={assignment.id} />

      {/* Assignment interface container */}
      <div
        className={`absolute bottom-4 bg-gray-200 rounded-md left-2 border-b-4 border-b-gray-400 overflow-hidden transition-[max-height,width,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isAssignmentMinimized
            ? "w-3/4 md:w-[40%] max-h-12 opacity-95"
            : "w-3/4 md:w-[40%] max-h-[80vh] opacity-100"
        }`}
      >
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

        <div
          className={`overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isAssignmentMinimized
              ? "max-h-0 opacity-0 -translate-y-2"
              : "max-h-[70vh] opacity-100 translate-y-0"
          }`}
        >
          <div className="p-4 text-center">
            {/* Conditional rendering based on assignment state */}
            {assignmentState === "notAnswered" ? (
              <AssignmentNotAnswered
                assignment={assignment}
                handleConfirm={handleConfirm}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
              />
            ) : (
              <AssignmentResult
                state={assignmentState}
                isLastAssignment={isLastAssignmentInSubject}
                onTryAgain={handleTryAgain}
                onNext={handleNext}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
