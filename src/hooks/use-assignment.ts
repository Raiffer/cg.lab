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

/**
 * `crypto.randomUUID()` only exists in secure contexts (HTTPS or
 * `localhost`) — opening the dev server through a LAN IP (e.g.
 * `192.168.x.x:3000`) makes it disappear even though the rest of `crypto`
 * still works, throwing "crypto.randomUUID is not a function". This falls
 * back to `crypto.getRandomValues`, and finally to `Math.random()` — this id
 * only groups anonymous attempt analytics, nothing security-sensitive.
 */
function generateUUID(): string {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto?.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

const getOrCreateSessionId = () => {
  if (typeof window === "undefined") {
    return "server-session-id"; // Fallback for server-side rendering
  }
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = generateUUID();
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
