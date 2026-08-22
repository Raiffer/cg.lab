"use client";

// External dependencies
import { redirect, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo } from "react";

// Components
import GenericScene2D from "@/components/generic-scene-2d";
import GenericScene3D from "@/components/generic-scene-3d";
import ObjectivePanel2D from "@/components/objective-panel-2d";
import ObjectivePanel3D from "@/components/objective-panel-3d";
import AssignmentResultRandom from "@/components/assignment-result-random";
import AssignmentNotAnsweredRandom from "@/components/assignment-not-answered-random";

// Hooks
import { useAssignment } from "@/hooks/use-assignment";
import { useAssignmentKeyboardShortcuts } from "@/hooks/use-assignment-keyboard-shortcut";
import { useResetStores } from "@/hooks/use-reset-stores";

// Store
import { useScene2DStore } from "@/store/scene2DStore";

// Constants and types
import {
  generateAnyRandomAssignment,
  SubjectOptionsKey,
  subjects,
} from "@/constants/assignments";

// Utilities
import { toast } from "@/hooks/use-toast";

export default function RandomAssignmentPage() {
  // State and store hooks
  const { config } = useScene2DStore();
  const {
    assignment,
    setAssignment,
    assignmentState,
    setAssignmentState,
    handleConfirm,
    setStartTime,
    incrementAttemptCount,
    resetAttemptCount,
  } = useAssignment();

  // Derived state
  const subjectData = useMemo(
    () =>
      assignment &&
      subjects.find(s =>
        s.assignments.some(
          a => a.subjectCategory === assignment.subjectCategory
        )
      ),
    [assignment]
  );

  // URL parameters
  const searchParams = useSearchParams();
  const selectedSubjects = useMemo(
    () => searchParams.getAll("subjects"),
    [searchParams]
  ) as SubjectOptionsKey[];

  // Effects
  const resetAll = useResetStores();

  useEffect(() => {
    resetAll();

    try {
      const assi = generateAnyRandomAssignment(selectedSubjects);
      if (assi) {
        setStartTime(Date.now());
        setAssignment(assi);
        assi.setup();
      }
    } catch (error) {
      toast({
        title: "Erro ao gerar exercício",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
      redirect("/");
    }
  }, [resetAll, selectedSubjects, setAssignment, setStartTime]);

  // Event handlers
  const handleTryAgain = useCallback(() => {
    resetAll();
    setStartTime(Date.now());
    setAssignmentState("notAnswered");
    incrementAttemptCount();
    assignment?.setup();
  }, [
    resetAll,
    assignment,
    setAssignmentState,
    setStartTime,
    incrementAttemptCount,
  ]);

  const handleSkip = useCallback(() => {
    setAssignmentState("notAnswered");

    try {
      const assi = generateAnyRandomAssignment(selectedSubjects);
      if (assi) {
        setAssignment(assi);
        setStartTime(Date.now());
        resetAttemptCount();
        resetAll();
        assi.setup();
      }
    } catch (error) {
      toast({
        title: "Erro ao gerar exercício",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
      redirect("/");
    }
  }, [
    resetAll,
    selectedSubjects,
    setAssignment,
    setAssignmentState,
    setStartTime,
    resetAttemptCount,
  ]);

  const onConfirmAnswer = () => {
    // When it's a random assignment, we don't want to save the completion in the database
    handleConfirm({
      ignoreCompletionSave: true,
    });
  };

  // Keyboard shortcuts
  useAssignmentKeyboardShortcuts(
    assignmentState,
    onConfirmAnswer,
    handleTryAgain,
    handleSkip
  );

  // Early return if no assignment
  if (!assignment || !subjectData) return null;

  return (
    <>
      {/* Scene rendering based on subject type */}
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

      {/* Assignment interface */}
      <div className="absolute bottom-4 bg-gray-200 p-4 rounded-md left-2 w-3/4 md:w-[40%] border-b-4 border-b-gray-400">
        <div className="text-center">
          <AssignmentResultRandom
            state={assignmentState}
            onTryAgain={handleTryAgain}
            onSkip={handleSkip}
          />

          {assignmentState === "notAnswered" && (
            <AssignmentNotAnsweredRandom
              assignment={assignment}
              handleConfirm={onConfirmAnswer}
              handleSkip={handleSkip}
            />
          )}
        </div>
      </div>
    </>
  );
}
