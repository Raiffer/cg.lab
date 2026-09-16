import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { isSameDay } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Assignment } from "@/types/Assignment";
import { api } from "../../convex/_generated/api";

async function saveAttemptToSheets(data: {
  sessionId: string;
  subject: string;
  assignmentId: string;
  isCorrect: boolean;
  timeSpent: number;
  attemptCount: number;
}): Promise<void> {
  const SAVE_TO_GOOGLE_SHEET = process.env.NEXT_PUBLIC_SAVE_TO_GOOGLE_SHEET;
  if (!SAVE_TO_GOOGLE_SHEET || SAVE_TO_GOOGLE_SHEET !== "true") return;

  const res = await fetch("/api/addToSheets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    console.error("Error saving to Sheets:", res.statusText);
  } else {
    console.log("Data saved to Google Sheets!");
  }
}

const getOrCreateSessionId = () => {
  if (typeof window === "undefined") {
    return "server-session-id"; // Fallback for server-side rendering
  }
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

export function useAssignment(subject?: string) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [assignmentState, setAssignmentState] = useState<
    "notAnswered" | "correct" | "incorrect"
  >("notAnswered");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);

  const completeAssignmentMutation = useMutation(
    api.assignmentCompletions.completeAssignment
  );
  const updateUserStreakMutation = useMutation(api.users.updateUserStreak);

  const incrementAttemptCount = useCallback(() => {
    setAttemptCount(prev => prev + 1);
  }, []);
  const resetAttemptCount = useCallback(() => {
    setAttemptCount(1);
  }, []);

  const handleConfirm = useCallback(
    async ({ ignoreCompletionSave = false } = {}) => {
      if (!assignment) return;

      const isCorrect = assignment.validate();
      setAssignmentState(isCorrect ? "correct" : "incorrect");

      if (!isCorrect) {
        assignment.onError?.();
        setAssignment({ ...assignment });
      }

      const endTime = Date.now();
      const timeSpent = endTime - (startTime ?? endTime);

      // Save attempt to Google Sheets for analytics
      // This is done in a try-catch block to avoid breaking the flow of the app
      // even if the Sheets API fails
      try {
        await saveAttemptToSheets({
          sessionId: getOrCreateSessionId(),
          subject: assignment.subjectCategory,
          assignmentId: subject ? assignment.id : "random",
          isCorrect,
          timeSpent,
          attemptCount,
        });
      } catch (error) {
        console.error("Error saving attempt to Sheets:", error);
      }

      if (!isCorrect) return;

      try {
        // Work around to get the user session from the cookie in the browser
        // This is for reducing the number of Convex function calls
        const res = await fetch("/api/getSession");
        const data = await res.json();

        // If the user is authenticated, complete the assignment
        // and update the user streak if the assignment is completed today
        // and the user hasn't completed a task today
        if (data.userSession) {
          // Complete the assignment, it return if the user completed a daily mission and the user last completed date
          const completionData = await completeAssignmentMutation({
            assignmentId: assignment.id ?? "",
            subject: subject ?? "",
            subjectCategory: assignment.subjectCategory,
            ignoreCompletionSave,
          });

          // Only update the streak if the user hasn't completed a task today
          // This is to avoid calling the updateUserStreak function unnecessarily
          const shouldUpdateStreak =
            !isSameDay(
              completionData?.userLastCompletedDate ?? new Date(),
              new Date()
            ) || !completionData?.userLastCompletedDate;
          if (shouldUpdateStreak) {
            await updateUserStreakMutation();
          }

          if (completionData?.completedMission) {
            toast({
              title: "Missão diária concluída!",
              description: "Parabéns, você completou uma missão diária.",
            });
          }
        }
      } catch (error) {
        console.error("Error completing assignment:", error);
      }
    },
    [
      assignment,
      subject,
      completeAssignmentMutation,
      updateUserStreakMutation,
      startTime,
      attemptCount,
    ]
  );

  return {
    assignment,
    setAssignment,
    assignmentState,
    setAssignmentState,
    handleConfirm,
    startTime,
    setStartTime,
    incrementAttemptCount,
    resetAttemptCount,
  };
}
