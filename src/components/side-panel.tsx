import React, { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { subjects } from "@/constants/assignments";

interface SidePanelProps {
  subject?: string;
  currentAssignmentId?: string;
}

export default function SidePanel({
  subject,
  currentAssignmentId,
}: SidePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const assignmentsCompletions = useQuery(
    api.assignmentCompletions.getAssignmentCompletionsBySubject,
    {
      subject: subject ?? "",
    }
  );

  const moduleAssignments = subject
    ? (subjects.find(s => s.slug === subject)?.assignments ?? [])
    : [];

  const resolvedIds = new Set(
    assignmentsCompletions?.map(completion => completion.assignmentId) ?? []
  );

  return (
    <>
      {/* Barra lateral */}
      <div
        className={`absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-md w-[15%] h-[80%] border-r-4 border-r-gray-400 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-[calc(100%+16px)]"
        }`}
      >
        {moduleAssignments.length > 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="grid grid-cols-4 gap-2 p-4">
              {moduleAssignments.map((assignment, index) => {
                const isResolved = resolvedIds.has(assignment.id);
                const isCurrent = assignment.id === currentAssignmentId;

                const backgroundColor = isCurrent
                  ? "bg-gray-400"
                  : isResolved
                    ? "bg-green-500"
                    : "bg-white";

                return (
                  <button
                    key={assignment.id}
                    onClick={() => router.push(`/assignment/${subject}/${assignment.id}`)}
                    className={`${backgroundColor} flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-sm font-medium text-gray-700 transition-colors hover:opacity-80`}
                    title={assignment.title}
                  >
                    {index + 1}
                  </button>
              );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Botão para esconder/mostrar a barra */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 transition-all duration-300 ease-in-out hover:bg-gray-100 ${
          isOpen ? "right-[calc(15%+8px)]" : "right-2"
        }`}
        aria-label={isOpen ? "Esconder barra lateral" : "Mostrar barra lateral"}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </>
  );
}
