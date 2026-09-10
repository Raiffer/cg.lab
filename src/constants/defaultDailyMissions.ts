export type SubjectCategories =
  | "points"
  | "vector-definition"
  | "vector-sum"
  | "vector-scalar"
  | "vector-length"
  | "translation-matrix"
  | "rotation-matrix"
  | "scaling-matrix"
  | "matrix-multiplication"
  | "matrix-fundamentals"
  | "identity-matrix"
  | "inverse-matrix";

export type DailyMission = {
  id: string;
  title: string;
  target: number;
  subjectCategory: SubjectCategories;
};

export const defaultDailyMissions: DailyMission[] = [
  {
    id: "complete-5-exercises-on-points",
    title: "Complete 5 exercícios sobre Pontos",
    target: 5,
    subjectCategory: "points",
  },
  {
    id: "complete-5-exercises-on-vector-definition",
    title: "Complete 5 exercícios sobre a Definição de vetores",
    target: 5,
    subjectCategory: "vector-definition",
  },
  {
    id: "complete-5-exercises-on-vector-sum",
    title: "Complete 5 exercícios sobre Soma de vetores",
    target: 5,
    subjectCategory: "vector-sum",
  },
  {
    id: "complete-5-exercises-on-vector-scalar",
    title: "Complete 5 exercícios sobre Multiplicação por escalar",
    target: 5,
    subjectCategory: "vector-scalar",
  },
  {
    id: "complete-5-exercises-on-vector-length",
    title: "Complete 5 exercícios sobre o Comprimento de vetores",
    target: 5,
    subjectCategory: "vector-length",
  },
  {
    id: "complete-5-exercises-on-translation-matrix",
    title: "Complete 5 exercícios sobre Matriz de translação",
    target: 5,
    subjectCategory: "translation-matrix",
  },
  {
    id: "complete-5-exercises-on-rotation-matrix",
    title: "Complete 5 exercícios sobre Matriz de rotação",
    target: 5,
    subjectCategory: "rotation-matrix",
  },
  {
    id: "complete-5-exercises-on-scaling-matrix",
    title: "Complete 5 exercícios sobre Matriz de escala",
    target: 5,
    subjectCategory: "scaling-matrix",
  },
  {
    id: "complete-5-exercises-on-matrix-fundamentals",
    title: "Complete 5 exercícios sobre Fundamentos de matrizes",
    target: 5,
    subjectCategory: "matrix-fundamentals",
  },
  {
    id: "complete-5-exercises-on-identity-matrix",
    title: "Complete 5 exercícios sobre a Matriz identidade",
    target: 5,
    subjectCategory: "identity-matrix",
  },
  {
    id: "complete-5-exercises-on-inverse-matrix",
    title: "Complete 5 exercícios sobre Matriz inversa",
    target: 5,
    subjectCategory: "inverse-matrix",
  },
];
