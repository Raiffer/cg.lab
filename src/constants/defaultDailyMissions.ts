export type SubjectCategories =
  | "points"
  | "vector-definition"
  | "vector-sum"
  | "vector-scalar"
  | "vector-length"
  | "translation"
  | "rotation"
  | "scaling"
  | "multiplication";

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
    id: "complete-5-exercises-on-translation",
    title: "Complete 5 exercícios sobre Translação",
    target: 5,
    subjectCategory: "translation",
  },
  {
    id: "complete-5-exercises-on-rotation",
    title: "Complete 5 exercícios sobre Rotação",
    target: 5,
    subjectCategory: "rotation",
  },
  {
    id: "complete-5-exercises-on-scaling",
    title: "Complete 5 exercícios sobre Escala",
    target: 5,
    subjectCategory: "scaling",
  },
];
