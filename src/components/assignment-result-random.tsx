import React from "react";
import { Button } from "./ui/button";
import { SkipForward } from "lucide-react";
import Lottie from "lottie-react";
import successAnimationData from "@/assets/success-anim.json";
import failAnimationData from "@/assets/fail-anim.json";

interface Props {
  state: "correct" | "incorrect" | "notAnswered";
  onTryAgain: () => void;
  onSkip: () => void;
}

export default function AssignmentResultRandom({
  state,
  onTryAgain,
  onSkip,
}: Props) {
  if (state === "notAnswered") return null;

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
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button onClick={onSkip}>
              Continuar <SkipForward />
            </Button>
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
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button onClick={onTryAgain}>Tentar novamente</Button>
            <Button variant="outline" onClick={onSkip}>
              Pular questão <SkipForward />
            </Button>
          </div>
        </>
      )}
    </>
  );
}