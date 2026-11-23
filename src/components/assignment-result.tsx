import React from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import Lottie from "lottie-react";
import successAnimationData from "@/assets/success-anim.json";
import failAnimationData from "@/assets/fail-anim.json";
import { resolveFeedback } from "@/utils";

type FeedbackText = string | (() => string);

interface Props {
  state: "correct" | "incorrect" | "notAnswered";
  isLastAssignment: boolean;
  onTryAgain: () => void;
  onNext: () => void;
  feedback?: { correct?: FeedbackText; incorrect?: FeedbackText };
  /** When true, the incorrect feedback text is shown elsewhere (the info
   * button) instead of inline here — only set for the modules that moved to
   * that hover/pop-up mechanic. Every other module keeps this inline text,
   * unchanged. */
  hideIncorrectFeedbackInline?: boolean;
}

export default function AssignmentResult({
  state,
  isLastAssignment,
  onTryAgain,
  onNext,
  feedback,
  hideIncorrectFeedbackInline = false,
}: Props) {
  if (state === "notAnswered") return null;

  const correctFeedback = resolveFeedback(feedback?.correct);
  const incorrectFeedback = hideIncorrectFeedbackInline
    ? undefined
    : resolveFeedback(feedback?.incorrect);

  return (
    <>
      {state === "correct" && (
        <>
          <div className="flex items-center justify-center gap-2">
            <Lottie
              animationData={successAnimationData}
              loop={false}
              className="w-12 h-12"
            />
            <p className="text-base md:text-xl">Parabéns! Você acertou.</p>
          </div>
          {correctFeedback && (
            <p className="text-sm text-gray-600 mt-2 px-4">
              {correctFeedback}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            {isLastAssignment ? (
              <Button onClick={onNext}>
                Voltar para o início <ArrowRight />
              </Button>
            ) : (
              <Button onClick={onNext}>
                Próximo <ArrowRight />
              </Button>
            )}
          </div>
        </>
      )}
      {state === "incorrect" && (
        <>
          <div className="flex items-center justify-center gap-2">
            <Lottie
              animationData={failAnimationData}
              loop={false}
              className="w-12 h-12"
            />
            <p className="text-base md:text-xl">
              Resposta incorreta. Tente novamente.
            </p>
          </div>
          {incorrectFeedback && (
            <p className="text-sm text-gray-600 mt-2 px-4">
              {incorrectFeedback}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button onClick={onTryAgain}>Tentar novamente</Button>
          </div>
        </>
      )}
    </>
  );
}
