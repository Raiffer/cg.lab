import { useScene2DStore } from "@/store/scene2DStore";
import {
  MatrixType,
  useFillBlankMatrixInputStore,
} from "@/store/fillInBlankMatrixInputStore";
import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

/**
 * "Classifique o Sistema" — cada equação ax + by = c de um sistema 2×2 É
 * uma reta; resolver o sistema é achar onde as retas se cruzam. Em vez de
 * escalonar, o aluno só olha a cena: as retas se cruzam num ponto só
 * (possível e determinado), são a mesma reta (possível e indeterminado —
 * infinitas soluções), ou são paralelas sem se tocar (impossível)?
 *
 * A classificação usada para montar cada instância é sempre CALCULADA a
 * partir dos coeficientes (nunca assumida por eu ter "desenhado pra dar
 * isso"): det = a₁b₂ − a₂b₁ é exatamente o mesmo determinante 2×2 do
 * módulo anterior — det ≠ 0 já garante solução única, sem precisar olhar a
 * imagem. A pergunta pede pra ENXERGAR isso, não recalcular.
 *
 * Progressão: 1–2 retas claramente cruzando em ângulos bem diferentes
 * (determinado); 3 mesma reta (indeterminado); 4 paralelas óbvias
 * (impossível); 5 paralelas com coeficientes menos parecidos — precisa
 * olhar com atenção, não só "os números batem".
 */

type LinearEquation = { a: number; b: number; c: number }; // ax + by = c
type Classification = "unique" | "same" | "parallel";

function classify(eq1: LinearEquation, eq2: LinearEquation): Classification {
  const det = eq1.a * eq2.b - eq2.a * eq1.b;
  if (Math.abs(det) > 1e-9) return "unique";
  const sameLine =
    Math.abs(eq1.a * eq2.c - eq2.a * eq1.c) < 1e-9 &&
    Math.abs(eq1.b * eq2.c - eq2.b * eq1.c) < 1e-9;
  return sameLine ? "same" : "parallel";
}

/** Two points far enough apart that Line.ThroughPoints draws a clean line
 * across the whole visible viewport. Handles vertical lines (b = 0) too. */
function pointsOnLine(eq: LinearEquation): [[number, number], [number, number]] {
  const { a, b, c } = eq;
  if (Math.abs(b) > 1e-9) {
    const x1 = -8;
    const x2 = 8;
    return [
      [x1, (c - a * x1) / b],
      [x2, (c - a * x2) / b],
    ];
  }
  const x = c / a;
  return [
    [x, -6],
    [x, 6],
  ];
}

function equationText(eq: LinearEquation, varNames: [string, string]): string {
  const [x, y] = varNames;
  const bTerm =
    eq.b === 0
      ? ""
      : eq.b > 0
        ? ` + ${eq.b === 1 ? "" : eq.b}${y}`
        : ` − ${eq.b === -1 ? "" : -eq.b}${y}`;
  const aTerm = eq.a === 1 ? x : eq.a === -1 ? `−${x}` : `${eq.a}${x}`;
  return `${aTerm}${bTerm} = ${eq.c}`;
}

const classificationLabel: Record<Classification, string> = {
  unique: "Possível e determinado (um único ponto)",
  same: "Possível e indeterminado (infinitas soluções)",
  parallel: "Impossível (nenhuma solução)",
};

interface SystemClassificationAssignmentProps {
  order: number;
  title?: string;
  eq1: LinearEquation;
  eq2: LinearEquation;
}

function createSystemClassificationAssignment({
  order,
  title,
  eq1,
  eq2,
}: SystemClassificationAssignmentProps): Assignment {
  const result = classify(eq1, eq2);

  const options: TOption[] = (
    ["unique", "same", "parallel"] as Classification[]
  ).map(candidate => ({
    id: candidate,
    value: classificationLabel[candidate],
    correct: candidate === result,
  }));

  return {
    id: `system-classification-visual-${order}`,
    order,
    title: title || "Classifique o Sistema",
    instructions: `Cada reta é uma equação do sistema { ${equationText(eq1, ["x", "y"])}; ${equationText(eq2, ["x", "y"])} }. Como você classifica esse sistema?`,
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "linear-systems",
    feedback: {
      correct:
        result === "unique"
          ? "Certo! As retas se cruzam em um único ponto: esse ponto é a solução do sistema."
          : result === "same"
            ? "Certo! As duas equações descrevem a mesma reta: qualquer ponto dela resolve as duas ao mesmo tempo."
            : "Certo! As retas nunca se encontram: não existe par (x, y) que resolva as duas equações ao mesmo tempo.",
      incorrect:
        "Olhe as duas retas desenhadas: elas se cruzam uma vez, se sobrepõem por completo, ou nunca se tocam?",
    },
    setup() {
      const { setLines } = useScene2DStore.getState();
      const [p1, p2] = pointsOnLine(eq1);
      const [q1, q2] = pointsOnLine(eq2);
      // Quando as duas retas são a mesma (caso "indeterminado"), o ponto
      // médio de r_1 e r_2 cai exatamente no mesmo lugar, então os dois
      // rótulos ficariam empilhados um em cima do outro. Nesse caso, um
      // único rótulo combinado já deixa claro que é a mesma reta.
      const sameLine = result === "same";
      setLines([
        // A diferença de espessura só importa quando as retas se sobrepõem:
        // aí a vermelha mais grossa aparece como uma borda visível nas
        // laterais da verde, em vez de sumir por completo. Nos outros casos
        // (retas separadas), as duas ficam com a mesma espessura.
        {
          id: "eq1",
          point1: p1,
          point2: p2,
          color: "red",
          weight: sameLine ? 6 : undefined,
          label: sameLine ? undefined : "r_1",
        },
        {
          id: "eq2",
          point1: q1,
          point2: q2,
          color: "green",
          weight: sameLine ? 2 : undefined,
          label: sameLine ? "r_1 = r_2" : "r_2",
        },
      ]);

      useFillBlankMatrixInputStore.getState().setMatrices([
        {
          id: "augmented-matrix",
          label: "Sistema",
          type: MatrixType.IDENTITY,
          dimention: "2D",
          matrixValue: [
            [
              { value: eq1.a, editable: false },
              { value: eq1.b, editable: false },
              { value: eq1.c, editable: false },
            ],
            [
              { value: eq2.a, editable: false },
              { value: eq2.b, editable: false },
              { value: eq2.c, editable: false },
            ],
          ],
        },
      ]);

      const { setSentence, setOptions } =
        useFillInTheBlankWithOptionsStore.getState();
      setSentence("O sistema é: {resposta}");
      setOptions(options);
    },
    validate() {
      const { selectedOptions } = useFillInTheBlankWithOptionsStore.getState();
      const answer = selectedOptions["resposta"];
      return answer ? answer.correct : false;
    },
  };
}

const systemClassificationProps: Omit<
  SystemClassificationAssignmentProps,
  "order"
>[] = [
  // Nível 1: retas cruzando em ângulos bem diferentes — determinado
  { eq1: { a: 1, b: 1, c: 4 }, eq2: { a: 1, b: -1, c: 0 } },
  { eq1: { a: 2, b: 1, c: 5 }, eq2: { a: 1, b: -1, c: -1 } },
  // Nível 2: a mesma reta escrita de dois jeitos — indeterminado
  { eq1: { a: 1, b: 2, c: 6 }, eq2: { a: 2, b: 4, c: 12 } },
  // Nível 2: paralelas óbvias (mesmo a e b, c diferente) — impossível
  { eq1: { a: 1, b: 2, c: 6 }, eq2: { a: 1, b: 2, c: 2 } },
  // Nível 3: paralelas com coeficientes menos parecidos à primeira vista
  { eq1: { a: 2, b: -1, c: 3 }, eq2: { a: -4, b: 2, c: 1 } },
];

export const systemClassificationVisualAssignmentList =
  systemClassificationProps.map((props, index) =>
    createSystemClassificationAssignment({ ...props, order: index + 1 })
  );
