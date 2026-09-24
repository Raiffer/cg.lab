import { useScene2DStore } from "@/store/scene2DStore";
import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

/**
 * "Sentido de Rotação" + "Sinal do Determinante" — a mesma cena (vetores L1,
 * L2 + arco curvo mostrando o giro de L1 até L2, sem nenhum número visível)
 * vira DOIS exercícios em sequência para cada instância, em vez de pedir o
 * sinal direto:
 *
 *   Passo A — só o sentido da rotação: anti-horário, horário, ou colineares.
 *   Passo B — a partir do sentido já identificado, o sinal do determinante.
 *
 * Dividir em duas perguntas menores evita que o aluno precise relacionar
 * "orientação dos vetores" + "sentido de giro" + "sinal do determinante"
 * tudo de uma vez — cada passo introduz uma única relação nova.
 *
 * O rótulo de cada vetor fica perto da ponta da seta (`labelPosition: "tip"`),
 * não no meio, para deixar claro qual é L1 (o vetor de partida) e qual é L2
 * (o vetor de chegada) antes mesmo de ler o enunciado.
 *
 * Progressão: 1 caso anti-horário bem aberto, 2 caso horário bem aberto,
 * 3 caso colinear (zero) — os três casos possíveis explícitos logo no
 * início — depois 4–5 repetem os três casos com ângulos mais fechados,
 * sem a abertura óbvia para se apoiar.
 */

type Sign = "positive" | "negative" | "zero";
type RotationSense = "counterclockwise" | "clockwise" | "collinear";

interface DeterminantSignPredictionAssignmentProps {
  order: number;
  title?: string;
  rowA: [number, number];
  rowB: [number, number];
}

function angleOf([x, y]: [number, number]): number {
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function signOfDeterminant(rowA: [number, number], rowB: [number, number]): Sign {
  const determinant = rowA[0] * rowB[1] - rowA[1] * rowB[0];
  if (Math.abs(determinant) < 1e-9) return "zero";
  return determinant > 0 ? "positive" : "negative";
}

function senseFromSign(sign: Sign): RotationSense {
  if (sign === "positive") return "counterclockwise";
  if (sign === "negative") return "clockwise";
  return "collinear";
}

function setupScene(rowA: [number, number], rowB: [number, number], sign: Sign) {
  const { setVectors, setPolygons, setArcs } = useScene2DStore.getState();

  setVectors([
    {
      id: "row-a",
      tail: [0, 0],
      tip: rowA,
      color: "red",
      label: "L1",
      labelPosition: "tip",
    },
    {
      id: "row-b",
      tail: [0, 0],
      tip: rowB,
      color: "green",
      label: "L2",
      labelPosition: "tip",
    },
  ]);

  setPolygons([
    {
      id: "parallelogram",
      color: "purple",
      opacity: 0.35,
      points: [
        { id: "p0", position: [0, 0], movable: false },
        { id: "p1", position: rowA, movable: false },
        {
          id: "p2",
          position: [rowA[0] + rowB[0], rowA[1] + rowB[1]],
          movable: false,
        },
        { id: "p3", position: rowB, movable: false },
      ],
    },
  ]);

  if (sign === "zero") {
    setArcs([]);
    return;
  }

  const lengthA = Math.hypot(rowA[0], rowA[1]);
  const lengthB = Math.hypot(rowB[0], rowB[1]);
  setArcs([
    {
      id: "rotation-arc",
      center: [0, 0],
      radius: 0.45 * Math.min(lengthA, lengthB),
      fromAngle: angleOf(rowA),
      toAngle: angleOf(rowB),
      direction: sign === "positive" ? "counterclockwise" : "clockwise",
      color: "#555555",
    },
  ]);
}

const senseLabel: Record<RotationSense, string> = {
  counterclockwise: "Anti-horário",
  clockwise: "Horário",
  collinear: "Vetores colineares",
};

function createRotationSenseAssignment({
  order,
  title,
  rowA,
  rowB,
}: DeterminantSignPredictionAssignmentProps): Assignment {
  const sign = signOfDeterminant(rowA, rowB);
  const sense = senseFromSign(sign);

  const options: TOption[] = (
    ["counterclockwise", "clockwise", "collinear"] as RotationSense[]
  ).map(candidate => ({
    id: candidate,
    value: senseLabel[candidate],
    correct: candidate === sense,
  }));

  return {
    id: `determinant-rotation-sense-${order}`,
    order,
    title: title || "Qual é o Sentido da Rotação?",
    instructions:
      "Ao girar L1 até coincidir com L2 (pela curva mostrada), qual é o sentido da rotação?",
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "determinants",
    feedback: {
      correct:
        sense === "collinear"
          ? "Certo! L1 e L2 apontam na mesma reta, então não há rotação de verdade."
          : `Certo! O giro de L1 até L2 é ${senseLabel[sense].toLowerCase()}.`,
      incorrect:
        "Olhe outra vez a curva desenhada entre L1 e L2: ela mostra o caminho mais curto de um vetor até o outro.",
    },
    setup() {
      setupScene(rowA, rowB, sign);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("O sentido da rotação é: {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      return answer ? answer.correct : false;
    },
  };
}

function createDeterminantSignPredictionAssignment({
  order,
  title,
  rowA,
  rowB,
}: DeterminantSignPredictionAssignmentProps): Assignment {
  const sign = signOfDeterminant(rowA, rowB);
  const sense = senseFromSign(sign);

  const options: TOption[] = [
    { id: "positive", value: "Positivo", correct: sign === "positive" },
    { id: "negative", value: "Negativo", correct: sign === "negative" },
    { id: "zero", value: "Zero", correct: sign === "zero" },
  ];

  const senseSentence =
    sense === "collinear"
      ? "Você viu que L1 e L2 são colineares (não há rotação)."
      : `Você viu que a rotação de L1 para L2 é ${senseLabel[sense].toLowerCase()}.`;

  return {
    id: `determinant-sign-prediction-${order}`,
    order,
    title: title || "Qual é o Sinal do Determinante?",
    instructions: `${senseSentence} Sem calcular: o determinante é positivo, negativo, ou zero?`,
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "determinants",
    feedback: {
      correct:
        sign === "zero"
          ? "Certo! Vetores colineares não formam área nenhuma, então det(A) = 0."
          : `Certo! Rotação ${senseLabel[sense].toLowerCase()} de L1 para L2 ⇔ determinante ${
              sign === "positive" ? "positivo" : "negativo"
            }.`,
      incorrect:
        "Anti-horário é positivo, horário é negativo, colinear é zero. Releia o sentido de rotação que você identificou no passo anterior.",
    },
    setup() {
      setupScene(rowA, rowB, sign);
      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("O determinante é: {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      return answer ? answer.correct : false;
    },
  };
}

const determinantSignPredictionProps: Omit<
  DeterminantSignPredictionAssignmentProps,
  "order"
>[] = [
  // Nível 1: caso bem aberto, sentido anti-horário — positivo
  { rowA: [3, 0], rowB: [0, 3] },
  // Nível 1: mesmo par, ordem trocada — horário, negativo
  { rowA: [0, 3], rowB: [3, 0] },
  // Nível 1: colineares — zero
  { rowA: [2, 1], rowB: [4, 2] },
  // Nível 2: ângulo mais fechado, ainda anti-horário — positivo
  { rowA: [4, 1], rowB: [1, 3] },
  // Nível 2: quadrantes diferentes, sentido horário — negativo
  { rowA: [1, 3], rowB: [3, -1] },
];

export const determinantSignPredictionAssignmentList: Assignment[] =
  determinantSignPredictionProps.flatMap((props, index) => {
    const order = index + 1;
    return [
      createRotationSenseAssignment({ ...props, order }),
      createDeterminantSignPredictionAssignment({ ...props, order }),
    ];
  });
