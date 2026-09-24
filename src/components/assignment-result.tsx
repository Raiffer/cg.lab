import React from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import Lottie from "lottie-react";
import successAnimationData from "@/assets/success-anim.json";
import failAnimationData from "@/assets/fail-anim.json";

type FeedbackText = string | (() => string);

interface Props {
  state: "correct" | "incorrect" | "notAnswered";
  isLastAssignment: boolean;
  onTryAgain: () => void;
  onNext: () => void;
  feedback?: { correct?: FeedbackText; incorrect?: FeedbackText };
}

function resolveFeedback(text: FeedbackText | undefined): string | undefined {
  if (typeof text === "function") return text();
  return text;
}

export default function AssignmentResult({
  state,
  isLastAssignment,
  onTryAgain,
  onNext,
  feedback,
}: Props) {
  if (state === "notAnswered") return null;

  const correctFeedback = resolveFeedback(feedback?.correct);
  const incorrectFeedback = resolveFeedback(feedback?.incorrect);

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
