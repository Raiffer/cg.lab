"use client";

// Página das questões do módulo de projeção (slug "projection3d").
// Esta rota estática tem prioridade sobre /assignment/[subject]/[id].
//
// Disposição:
// ┌──────────────────────┬──────────────────────┐
// │    Cena principal    │  Volume de projeção  │  2/3 da altura
// ├──────────────────────┴──────────────────────┤
// │                Painel Questão               │  1/3 da altura
// └─────────────────────────────────────────────┘

import React, { use, useLayoutEffect } from "react";

import GenericScene3D from "@/components/generic-scene-3d";
import ObjectivePanel3D from "@/components/objective-panel-3d";
import AssignmentNotAnswered from "@/components/assignment-not-answered";
import AssignmentResult from "@/components/assignment-result";
import AssignmentInfoButton from "@/components/assignment-info-button";
import SidePanel from "@/components/side-panel";

import { useSubjectAssignmentPage } from "@/hooks/use-subject-assignment-page";

const SUBJECT = "projection3d";

export default function ProjectionAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    assignment,
    subjectData,
    assignmentState,
    isLastAssignmentInSubject,
    handleConfirm,
    handleTryAgain,
    handleNext,
    handlePrevious,
  } = useSubjectAssignmentPage(SUBJECT, id);

  useLayoutEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!assignment || !subjectData) return null;

  const projectionMode = assignment.projectionMode;

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-100">
      {/* Cenas lado a lado: 2/3 da altura */}
      <div className="flex h-2/3 w-full">
        <div className="flex h-full w-1/2 flex-col border-r-2 border-gray-400 bg-black">
          {/* Título alinhado à direita para não ficar atrás do botão X */}
          <div className="flex justify-end border-b-2 border-gray-400 bg-zinc-900 px-4 py-2 text-white">
            <h1 className="font-semibold">Cena principal</h1>
          </div>
          <GenericScene3D
            className="min-h-0 w-full flex-1"
            parallelProjection={projectionMode === "parallel"}
            perspectiveProjection={projectionMode === "perspective"}
            projectionMode={projectionMode}
            extendNegativeZGrid
          />
        </div>

        <div className="h-full w-1/2">
          <ObjectivePanel3D
            layout="fill"
            title="Volume de projeção"
            minimalView
            mirrorMainScene
            projectionMode={projectionMode}
            extendNegativeZGrid
          />
        </div>
      </div>

      {/* Painel Questão: 1/3 da altura */}
      <div className="flex h-1/3 w-full flex-col border-t-4 border-gray-400 bg-gray-200">
        <div className="bg-gray-300 px-3 py-2">
          <span className="text-sm font-semibold text-gray-700">Questão</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-center">
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
            />
          )}
        </div>
      </div>

      {/* Mantidos nas mesmas posições das outras páginas de questão */}
      <SidePanel subject={SUBJECT} currentAssignmentId={assignment.id} />
      <AssignmentInfoButton />
    </div>
  );
}
