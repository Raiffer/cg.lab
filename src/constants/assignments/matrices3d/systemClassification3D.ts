import { useScene3DStore } from "@/store/scene3DStore";
import {
  TOption,
  useFillInTheBlankWithOptionsStore,
} from "@/store/fillInTheBlankWithOptionsStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

/**
 * "Classifique o Sistema (3D)" — o equivalente em 3 variáveis do exercício de
 * retas do módulo 2D: cada equação ax + by + cz = d de um sistema 3×3 é um
 * PLANO; resolver o sistema é achar onde os três planos se encontram. O
 * aluno só olha a cena e classifica pelo formato do encontro:
 *   - um ponto só (bico, os três planos se cruzando num canto) → determinado
 *   - uma aresta comum (os três planos "abrem como um livro" ao redor da
 *     mesma reta) → indeterminado, infinitas soluções ao longo da reta
 *   - nenhum ponto comum a todos (dois deles já nem se tocam, ou formam um
 *     "prisma" sem centro comum) → impossível
 *
 * A classificação é sempre CALCULADA a partir dos coeficientes via
 * eliminação de Gauss (rank da matriz de coeficientes vs. rank da matriz
 * aumentada), nunca assumida por eu ter "desenhado pra dar isso" — mesma
 * segurança usada no resto do módulo, verificada previamente com um script
 * (verify-planes.mjs) contra as 5 instâncias abaixo.
 *
 * Progressão: 1 determinado com planos alinhados aos eixos (o caso mais
 * fácil de enxergar, três "paredes" perpendiculares); 2 determinado com
 * planos inclinados; 3 indeterminado (três planos compartilhando uma
 * aresta); 4 impossível óbvio (dois planos já paralelos entre si); 5
 * impossível sutil (nenhum par de planos é paralelo, mas os três juntos não
 * têm solução comum — precisa olhar com atenção, não só "os planos se
 * cruzam aos pares").
 */

type Plane = { a: number; b: number; c: number; d: number };
type Classification = "determined" | "indeterminate" | "impossible";

/** Gaussian elimination with partial pivoting, returns the numeric rank. */
function rank(matrix: number[][]): number {
  const rows = matrix.map(row => [...row]);
  const numRows = rows.length;
  const numCols = rows[0].length;
  let pivotCount = 0;
  for (let col = 0; col < numCols && pivotCount < numRows; col++) {
    let pivotRow = -1;
    let maxAbs = 1e-9;
    for (let row = pivotCount; row < numRows; row++) {
      if (Math.abs(rows[row][col]) > maxAbs) {
        maxAbs = Math.abs(rows[row][col]);
        pivotRow = row;
      }
    }
    if (pivotRow === -1) continue;
    [rows[pivotCount], rows[pivotRow]] = [rows[pivotRow], rows[pivotCount]];
    for (let row = 0; row < numRows; row++) {
      if (row === pivotCount) continue;
      const factor = rows[row][col] / rows[pivotCount][col];
      for (let c = col; c < numCols; c++) {
        rows[row][c] -= factor * rows[pivotCount][c];
      }
    }
    pivotCount++;
  }
  return pivotCount;
}

function classify([p1, p2, p3]: [Plane, Plane, Plane]): Classification {
  const coefficients = [p1, p2, p3].map(p => [p.a, p.b, p.c]);
  const augmented = [p1, p2, p3].map(p => [p.a, p.b, p.c, p.d]);
  const rankCoefficients = rank(coefficients);
  const rankAugmented = rank(augmented);
  if (rankCoefficients === 3) return "determined";
  return rankCoefficients === rankAugmented ? "indeterminate" : "impossible";
}

function equationText(p: Plane, varNames: [string, string, string]): string {
  const [x, y, z] = varNames;
  const terms: [number, string][] = [
    [p.a, x],
    [p.b, y],
    [p.c, z],
  ];
  let text = "";
  for (const [coefficient, name] of terms) {
    if (coefficient === 0) continue;
    const magnitude = Math.abs(coefficient);
    const magnitudeText = magnitude === 1 ? "" : String(magnitude);
    if (text === "") {
      text = coefficient < 0 ? `−${magnitudeText}${name}` : `${magnitudeText}${name}`;
    } else {
      text += coefficient < 0 ? ` − ${magnitudeText}${name}` : ` + ${magnitudeText}${name}`;
    }
  }
  return `${text} = ${p.d}`;
}

const classificationLabel: Record<Classification, string> = {
  determined: "Possível e determinado (um único ponto)",
  indeterminate: "Possível e indeterminado (infinitas soluções)",
  impossible: "Impossível (nenhuma solução)",
};

interface SystemClassification3DAssignmentProps {
  order: number;
  title?: string;
  planes: [Plane, Plane, Plane];
  /** Explicit label anchors for cases where the planes share the closest-to-
   * origin point (would otherwise stack all three labels on top of each other). */
  labelPositions?: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ];
  /** Overrides the default [10, 10, 10] camera angle — some plane
   * orientations look edge-on (a thin sliver instead of a visible quad)
   * from the default angle, so a few instances need a different vantage
   * point to stay readable. */
  cameraPosition?: [number, number, number];
}

function createSystemClassification3DAssignment({
  order,
  title,
  planes,
  labelPositions,
  cameraPosition,
}: SystemClassification3DAssignmentProps): Assignment {
  const result = classify(planes);
  const [p1, p2, p3] = planes;

  const options: TOption[] = (
    ["determined", "indeterminate", "impossible"] as Classification[]
  ).map(candidate => ({
    id: candidate,
    value: classificationLabel[candidate],
    correct: candidate === result,
  }));

  const colors = ["red", "green", "#4da6ff"];

  return {
    id: `system-classification-3d-${order}`,
    order,
    title: title || "Classifique o Sistema (3D)",
    instructions: `Cada plano é uma equação do sistema { ${equationText(p1, ["x", "y", "z"])}; ${equationText(p2, ["x", "y", "z"])}; ${equationText(p3, ["x", "y", "z"])} }. Como você classifica esse sistema?`,
    assisted: false,
    type: AssignmentType.FILL_IN_THE_BLANK_WITH_OPTIONS,
    subjectCategory: "linear-systems",
    feedback: {
      correct:
        result === "determined"
          ? "Certo! Os três planos se encontram em um único ponto: esse ponto é a solução do sistema."
          : result === "indeterminate"
            ? "Certo! Os três planos compartilham uma reta inteira: qualquer ponto dela resolve as três equações ao mesmo tempo."
            : "Certo! Não existe um ponto comum aos três planos: nenhum (x, y, z) resolve as três equações ao mesmo tempo.",
      incorrect:
        "Olhe onde os três planos se tocam: em um ponto só, ao longo de uma reta inteira, ou em lugar nenhum em comum?",
    },
    setup() {
      const { setPlanes, setCameraPosition } = useScene3DStore.getState();
      const lines: [Plane, Plane, Plane] = planes;
      setPlanes(
        lines.map((plane, index) => ({
          id: `plane-${index + 1}`,
          a: plane.a,
          b: plane.b,
          c: plane.c,
          d: plane.d,
          color: colors[index],
          label: `π_${index + 1}`,
          labelPosition: labelPositions?.[index],
        }))
      );
      setCameraPosition(cameraPosition ?? null);

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

const systemClassification3DProps: Omit<
  SystemClassification3DAssignmentProps,
  "order"
>[] = [
  // Nível 1: determinado, planos alinhados aos eixos (três "paredes" perpendiculares)
  {
    planes: [
      { a: 1, b: 0, c: 0, d: 2 },
      { a: 0, b: 1, c: 0, d: 3 },
      { a: 0, b: 0, c: 1, d: 1 },
    ],
  },
  // Nível 2: determinado, planos inclinados. Câmera diferente do padrão:
  // no ângulo [10,10,10] o terceiro plano fica quase de perfil (uma fatia
  // fina em vez de um plano visível).
  {
    planes: [
      { a: 1, b: 1, c: 1, d: 4 },
      { a: 1, b: -1, c: 1, d: 2 },
      { a: 1, b: 1, c: -1, d: 0 },
    ],
    cameraPosition: [3, 26, -3],
  },
  // Nível 2: indeterminado — os três planos compartilham o eixo Z. Como
  // todos passam pela origem, o ponto mais próximo da origem é o mesmo
  // (0,0,0) pros três, então os rótulos precisam de posições explícitas
  // pra não ficarem empilhados.
  {
    planes: [
      { a: 1, b: 0, c: 0, d: 0 },
      { a: 0, b: 1, c: 0, d: 0 },
      { a: 1, b: 1, c: 0, d: 0 },
    ],
    labelPositions: [
      [3, 0.5, 3],
      [0.5, 0.5, -3],
      [-3, 0.5, 2],
    ],
  },
  // Nível 3: impossível óbvio — dois planos já são paralelos entre si.
  // Câmera diferente do padrão: no ângulo [10,10,10] os dois planos
  // paralelos ficam quase de perfil e parecem se sobrepor num só.
  {
    planes: [
      { a: 1, b: 1, c: 1, d: 2 },
      { a: 1, b: 1, c: 1, d: 5 },
      { a: 1, b: -1, c: 0, d: 0 },
    ],
    cameraPosition: [-3, 23, 13],
  },
  // Nível 4: impossível sutil — nenhum par de planos é paralelo
  {
    planes: [
      { a: 1, b: 1, c: 1, d: 1 },
      { a: 1, b: 1, c: -1, d: 2 },
      { a: 2, b: 2, c: 0, d: 5 },
    ],
  },
];

export const systemClassification3DAssignmentList =
  systemClassification3DProps.map((props, index) =>
    createSystemClassification3DAssignment({ ...props, order: index + 1 })
  );
