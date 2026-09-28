import { useScene2DStore } from "@/store/scene2DStore";
import { useFillInTheBlankStore } from "@/store/fillInTheBlankStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

/**
 * "Leia a Interseção" — mesmo par de retas do exercício de classificação,
 * mas em vez de só classificar, o aluno acha e LÊ as coordenadas do ponto
 * onde elas se cruzam direto na grade (sem contas, só localizar o ponto e
 * ler os eixos). Muda o tipo de interação (coordenadas em vez de múltipla
 * escolha) pra dar variedade dentro do módulo, e reforça concretamente a
 * ideia de que "a interseção das retas É a solução do sistema".
 *
 * Só usa instâncias "possível e determinado" (as retas cruzam num ponto
 * só) — não faria sentido pedir pra ler um ponto que não existe.
 *
 * Todas as instâncias são escolhidas com interseção em coordenadas
 * inteiras, calculadas resolvendo o sistema 2x2 diretamente (nunca
 * verificadas à mão), pra garantir que o ponto caia exatamente sobre linhas
 * de grade e seja possível de ler com precisão.
 *
 * Progressão: 1–2 interseções em coordenadas pequenas e positivas
 * (aquecimento); 3 interseção com uma coordenada negativa; 4 retas mais
 * "fechadas" (ângulo pequeno entre elas, precisa olhar com mais atenção
 * pra achar o ponto certo); 5 interseção com as duas coordenadas negativas.
 */

type LinearEquation = { a: number; b: number; c: number }; // ax + by = c

/** Solves the 2x2 system directly via Cramer's rule — the intersection
 * point is computed from the equations, never typed in by hand. */
function solveIntersection(
  eq1: LinearEquation,
  eq2: LinearEquation
): [number, number] {
  const det = eq1.a * eq2.b - eq2.a * eq1.b;
  const x = (eq1.c * eq2.b - eq2.c * eq1.b) / det;
  const y = (eq1.a * eq2.c - eq2.a * eq1.c) / det;
  return [x, y];
}

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

interface SystemIntersectionReadAssignmentProps {
  order: number;
  title?: string;
  eq1: LinearEquation;
  eq2: LinearEquation;
}

function createSystemIntersectionReadAssignment({
  order,
  title,
  eq1,
  eq2,
}: SystemIntersectionReadAssignmentProps): Assignment {
  const [x, y] = solveIntersection(eq1, eq2);

  return {
    id: `system-intersection-read-${order}`,
    order,
    title: title || "Leia a Interseção",
    instructions:
      "As duas retas se cruzam em um único ponto: esse ponto é a solução do sistema. Leia suas coordenadas na grade.",
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_COORDINATES,
    subjectCategory: "linear-systems",
    feedback: {
      correct: `Isso mesmo! As retas se cruzam em (${x}, ${y}).`,
      incorrect:
        "Ache o ponto onde as duas retas se tocam e leia sua posição nos eixos x e y.",
    },
    setup() {
      const { setLines } = useScene2DStore.getState();
      const [p1, p2] = pointsOnLine(eq1);
      const [q1, q2] = pointsOnLine(eq2);
      setLines([
        { id: "eq1", point1: p1, point2: p2, color: "red", label: "r_1" },
        { id: "eq2", point1: q1, point2: q2, color: "green", label: "r_2" },
      ]);

      const { setInputs } = useFillInTheBlankStore.getState();
      setInputs([
        {
          dimention: "2D",
          coordinatesValue: { x: "", y: "" },
          pointRef: "intersection",
          label: "P",
        },
      ]);
    },
    validate() {
      const { getInputByPointRef } = useFillInTheBlankStore.getState();
      const input = getInputByPointRef("intersection");
      if (!input) return false;
      const inputX = Number(String(input.coordinatesValue.x).replace(",", "."));
      const inputY = Number(String(input.coordinatesValue.y).replace(",", "."));
      return inputX === x && inputY === y;
    },
  };
}

const systemIntersectionReadProps: Omit<
  SystemIntersectionReadAssignmentProps,
  "order"
>[] = [
  // Nível 1: coordenadas pequenas e positivas
  { eq1: { a: 1, b: 1, c: 5 }, eq2: { a: 1, b: -1, c: 1 } },
  { eq1: { a: 1, b: 2, c: 8 }, eq2: { a: 1, b: -1, c: 2 } },
  // Nível 2: uma coordenada negativa
  { eq1: { a: 1, b: 1, c: 1 }, eq2: { a: 1, b: -1, c: 5 } },
  // Nível 3: retas com ângulo pequeno entre si, precisa de mais atenção
  { eq1: { a: 1, b: -2, c: -4 }, eq2: { a: 1, b: -1, c: 1 } },
  // Nível 3: as duas coordenadas negativas
  { eq1: { a: 1, b: 1, c: -5 }, eq2: { a: 1, b: -1, c: -1 } },
];

export const systemIntersectionReadAssignmentList =
  systemIntersectionReadProps.map((props, index) =>
    createSystemIntersectionReadAssignment({ ...props, order: index + 1 })
  );
