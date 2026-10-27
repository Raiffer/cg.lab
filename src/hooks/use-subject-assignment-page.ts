import { redirect } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { subjects } from "@/constants/assignments";
import { useAssignment } from "@/hooks/use-assignment";
import { useAssignmentKeyboardShortcuts } from "@/hooks/use-assignment-keyboard-shortcut";
import { useResetStores } from "@/hooks/use-reset-stores";

// Lógica comum às páginas de questão de um subject: carrega a questão,
// controla tentativas e a navegação entre questões.
export function useSubjectAssignmentPage(subject: string, id: string) {
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

  const goToSibling = useCallback(
    (offset: 1 | -1) => {
      if (!assignment || !subjectData) return;

      const currentIndex = subjectData.assignments.findIndex(
        a => a.id === assignment.id
      );
      const sibling = subjectData.assignments[currentIndex + offset];

      if (sibling) {
        resetAttemptCount();
        redirect(`/assignment/${subject}/${sibling.id}`);
      } else {
        redirect(`/subject/${subject}`);
      }
    },
    [assignment, subject, subjectData, resetAttemptCount]
  );

  const handleNext = useCallback(() => goToSibling(1), [goToSibling]);
  const handlePrevious = useCallback(() => goToSibling(-1), [goToSibling]);

  useAssignmentKeyboardShortcuts(
    assignmentState,
    handleConfirm,
    handleTryAgain,
    handleNext
  );

  return {
    assignment,
    subjectData,
    assignmentState,
    isLastAssignmentInSubject,
    handleConfirm,
    handleTryAgain,
    handleNext,
    handlePrevious,
  };
}
