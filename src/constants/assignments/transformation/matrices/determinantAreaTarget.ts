import {
  MatrixType,
  MatrixValue,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";
import { createSquare } from "@/utils/polygon";

/**
 * "Determine Valores para uma Área-Alvo" — o quadrado unitário azul reage
 * em tempo real (`MatrixType.IDENTITY` + `polygonRefId`, o mesmo mecanismo
 * de preview ao vivo já usado em scaleForDoubleArea.ts, mas aqui com as 4
 * células livres — não só a diagonal) enquanto o aluno digita a, b, c, d.
 * Como o quadrado de partida tem área 1, a área final é exatamente
 * |det(A)| = |a·d − b·c| — então "acertar a área-alvo" e "acertar o
 * determinante" são a mesma coisa aqui, sem precisar dizer a palavra
 * "determinante" no primeiro contato com a ideia.
 *
 * Além do quadrado, um texto abaixo da matriz mostra ao vivo "Área alvo: Y /
 * Área atual: X" (via `liveStatLabel`), recalculado a cada tecla — a ideia é
 * que o aluno TESTE valores e observe a relação antes de qualquer fórmula,
 * não só confirme uma conta já decidida de antemão. Quando as duas batem, um
 * ✓ aparece ao lado do valor atual.
 *
 * Existem infinitas matrizes corretas para cada instância (qualquer a,b,c,d
 * com |ad−bc| = alvo serve) — de propósito: o objetivo é a relação
 * área ⇔ determinante, não decorar um valor único. Por isso NÃO há uma forma
 * "objetivo" desenhada na cena: como a forma final pode ser qualquer
 * paralelogramo (não só um quadrado maior/menor), comparar visualmente a
 * forma do quadrado azul com QUALQUER forma fixa (quadrado, círculo, o que
 * for) não é algo que dá pra "ver" de olho — só os dois números lado a lado
 * comunicam o alvo sem confundir forma com área.
 *
 * Progressão — segue explicitamente os 4 comportamentos possíveis do fator
 * de escala, na ordem em que fazem sentido conceitualmente (preservar →
 * ampliar → reduzir → zerar), e só depois solta o aluno em alvos livres:
 *   1  preservar a área (alvo = 1) — a transformação mais simples de todas
 *      é não mudar nada (ex.: a identidade), então este é o aquecimento.
 *   2  dobrar a área (alvo = 2, módulo > 1 ⇒ amplia)
 *   3  reduzir a área pela metade (alvo = 0.5, módulo < 1 ⇒ encolhe)
 *   4  zerar a área (alvo = 0) — matriz singular: o quadrado "achata" numa
 *      linha ou ponto, a mesma ideia da questão de singularidade, agora
 *      construída pelo próprio aluno em vez de só reconhecida.
 *   5–6  alvos livres, sem dizer qual operação usar (redondo e depois
 *        decimal), para consolidar sem a "dica" do enunciado.
 *
 * Complementa determinantSignPrediction.ts: lá o SINAL do determinante
 * indica a orientação; aqui o foco é o MÓDULO, o fator de escala da área.
 * (Só nos comentários — o enunciado em si não repete essa explicação, para
 * ficar curto e no padrão do resto do projeto.)
 */

const AREA_TOLERANCE = 0.05;

type AreaGoal = "preserve" | "double" | "half" | "zero" | "free";

interface DeterminantAreaTargetAssignmentProps {
  order: number;
  title?: string;
  targetArea: number;
  goal: AreaGoal;
}

function formatAreaValue(value: number): string {
  // Rounds away binary floating-point noise (e.g. 1.9999999999998) without
  // hard-coding a fixed decimal count, so "4" stays "4" and "2.5" stays "2.5".
  return String(Math.round(value * 100) / 100);
}

/** Shows the target and the live current area side by side — a direct
 * number-to-number comparison, since no single fixed shape could honestly
 * represent "any parallelogram with this area" as a visual target. */
function makeLiveAreaStat(targetArea: number) {
  return (matrixValue: MatrixValue[][]): string => {
    const [[a, b], [c, d]] = matrixValue;
    const raw = [a.value, b.value, c.value, d.value].map(Number);
    const targetLabel = `Área alvo: ${formatAreaValue(targetArea)}`;
    if (raw.some(value => Number.isNaN(value))) {
      return `${targetLabel}\nÁrea atual: —`;
    }
    const [av, bv, cv, dv] = raw;
    const area = Math.abs(av * dv - bv * cv);
    const reached = Math.abs(area - targetArea) < AREA_TOLERANCE;
    return `${targetLabel}\nÁrea atual: ${formatAreaValue(area)}${reached ? " ✓" : ""}`;
  };
}

const instructionsByGoal: Record<AreaGoal, (targetArea: number) => string> = {
  preserve: () =>
    "Preencha a matriz A para que a área do quadrado azul continue 1.",
  double: () => "Preencha a matriz A para que a área do quadrado azul DOBRE.",
  half: () =>
    "Preencha a matriz A para que a área do quadrado azul fique pela METADE.",
  zero: () =>
    "Preencha a matriz A para que a área do quadrado azul vire uma linha ou um ponto (área zero).",
  free: targetArea =>
    `Preencha a matriz A para que a área do quadrado azul chegue a ${targetArea}.`,
};

const feedbackCorrectByGoal: Record<AreaGoal, (targetArea: number) => string> = {
  preserve: () =>
    "|det(A)| = 1 → a área não mudou. É o caso em que a transformação preserva área.",
  double: () => "|det(A)| = 2 → a área dobrou. O módulo do determinante é o fator de escala da área.",
  half: () => "|det(A)| = 0,5 → a área caiu pela metade.",
  zero: () =>
    "|det(A)| = 0 → o quadrado perdeu a dimensão (virou uma linha ou ponto). É a mesma ideia de matriz singular, só que construída por você.",
  free: targetArea =>
    `|det(A)| = ${targetArea} → esse é o fator de escala da área.`,
};

const FEEDBACK_INCORRECT =
  "Observe como a área do quadrado azul mudou enquanto você digitava. O módulo do determinante é exatamente o fator de escala da área.";

function createDeterminantAreaTargetAssignment({
  order,
  title,
  targetArea,
  goal,
}: DeterminantAreaTargetAssignmentProps): Assignment {
  // A unit square has area 1, so applying a 2x2 linear map scales its area
  // by exactly |det|. validate() checks that real algebraic quantity (the
  // typed a,b,c,d) — the live stat below is what tells the student whether
  // they got there, not the shape of the square itself.
  const polygon = createSquare("polygon", "blue", [0, 0], [1, 1]);

  return {
    id: `determinant-area-target-${order}`,
    order,
    title: title || "Determine Valores para uma Área-Alvo",
    instructions: instructionsByGoal[goal](targetArea),
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_MATRIX,
    subjectCategory: "determinants",
    feedback: {
      correct: feedbackCorrectByGoal[goal](targetArea),
      incorrect: FEEDBACK_INCORRECT,
    },
    setup() {
      const { addPolygon } = useScene2DStore.getState();
      addPolygon(polygon);

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "matrix-a",
          label: "A",
          polygonRefId: "polygon",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          liveStatLabel: makeLiveAreaStat(targetArea),
          matrixValue: [
            [
              { value: "", editable: true },
              { value: "", editable: true },
            ],
            [
              { value: "", editable: true },
              { value: "", editable: true },
            ],
          ],
        },
      ]);
    },
    validate() {
      const matrix = useFillBlankMatrixInputStore
        .getState()
        .getMatrixById("matrix-a");
      if (!matrix) return false;

      const [[a, b], [c, d]] = matrix.matrixValue;
      const values = [a.value, b.value, c.value, d.value].map(Number);
      if (values.some(value => Number.isNaN(value))) return false;

      const [av, bv, cv, dv] = values;
      const area = Math.abs(av * dv - bv * cv);
      return Math.abs(area - targetArea) < AREA_TOLERANCE;
    },
  };
}

const determinantAreaTargetProps: Omit<
  DeterminantAreaTargetAssignmentProps,
  "order"
>[] = [
  // Nível 1 — preservar a área: a transformação mais simples é não mudar nada
  { targetArea: 1, goal: "preserve" },
  // Nível 1 — dobrar: módulo do determinante > 1, a área amplia
  { targetArea: 2, goal: "double" },
  // Nível 2 — metade: módulo do determinante < 1, a área encolhe
  { targetArea: 0.5, goal: "half" },
  // Nível 2 — zero: matriz singular, o quadrado achata
  { targetArea: 0, goal: "zero" },
  // Nível 3 — alvo livre, redondo, sem dica de qual operação usar
  { targetArea: 6, goal: "free" },
  // Nível 3 — alvo livre, decimal
  { targetArea: 2.5, goal: "free" },
];

export const determinantAreaTargetAssignmentList =
  determinantAreaTargetProps.map((props, index) =>
    createDeterminantAreaTargetAssignment({ ...props, order: index + 1 })
  );
