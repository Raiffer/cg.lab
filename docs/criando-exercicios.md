# Guia: Como Criar um Exercício no CG.lab

Este guia explica, passo a passo, como criar um novo exercício (`Assignment`) no
CG.lab, e detalha como cada um dos tipos de exercício (`AssignmentType`) funciona
por baixo dos panos.

---

## 1. Visão geral do processo

1. Escolher o **`subjectCategory`** (matéria) — precisa ser um valor já existente,
   a não ser que você também queira criar uma matéria nova (ver seção 6).
2. Escolher o **`AssignmentType`** (formato de resposta) — ver seção 5 para a
   explicação de cada um.
3. Criar o arquivo do exercício em `src/constants/assignments/<pasta-da-materia>/`.
4. Registrar o exercício no `index.ts` daquela pasta.
5. Testar no navegador.

Todo exercício é, no fim das contas, um objeto que implementa a interface
`Assignment` (`src/types/Assignment.ts`):

```ts
export interface Assignment {
  id: string;
  order: number;
  title: string;
  instructions: string;
  type: AssignmentType;
  subjectCategory: SubjectCategories;
  setup: () => void;
  validate: () => boolean;
}
```

| Campo | O que é |
|---|---|
| `id` | Identificador único no sistema inteiro. Convenção: `` `algo-descritivo-${order}` `` |
| `order` | Número usado para gerar o `id` e como rótulo de ordem. **Não** é o que define a sequência real de navegação — isso é a posição do exercício dentro do array (ver seção 4) |
| `title` | Título curto mostrado para o usuário |
| `instructions` | Texto de instrução mostrado durante o exercício |
| `type` | Um dos valores de `AssignmentType` — define qual componente de UI/qual store é usado |
| `subjectCategory` | A matéria à qual o exercício pertence (usado para agrupar e para as missões diárias) |
| `setup()` | Roda ao carregar o exercício (e ao clicar em "Tentar novamente"). Prepara a cena e/ou os stores de resposta |
| `validate()` | Roda ao clicar em "Confirmar". Lê o estado atual dos stores e retorna `true`/`false` |

O padrão usado em **todos** os arquivos de exercício existentes é o mesmo:

1. Uma função `createXAssignment(props)` que monta e devolve um `Assignment`.
2. Um array de "props" só com os dados que variam entre as instâncias (título,
   posições, valores-alvo etc).
3. Um `.map()` que gera a lista final de `Assignment`, derivando `order` do
   índice do array (`index + 1`).

```ts
const meusExerciciosProps = [
  { title: "...", /* dados específicos */ },
  { title: "...", /* dados específicos */ },
];

export const meuExercicioList = meusExerciciosProps.map((props, index) =>
  createXAssignment({ ...props, order: index + 1 })
);
```

Isso permite adicionar novas variações do mesmo exercício só adicionando um
item no array, sem duplicar lógica.

---

## 2. Passo a passo com exemplo completo

Vamos criar um exercício novo: **"Reflita o ponto A em relação a um eixo"**,
do tipo `INTERACTIVE`, na matéria `points`.

### Passo 1 — Criar o arquivo

`src/constants/assignments/points2d/reflectPointOverAxis.ts`:

```ts
import { useScene2DStore } from "@/store/scene2DStore";
import { Assignment, AssignmentType } from "@/types/Assignment";

interface ReflectPointOverAxisAssignmentProps {
  order: number;
  title: string;
  instructions: string;
  initialPointPosition: [number, number];
  axis: "x" | "y";
}

function createReflectPointOverAxisAssignment({
  order,
  title,
  instructions,
  initialPointPosition,
  axis,
}: ReflectPointOverAxisAssignmentProps): Assignment {
  const goalPosition: [number, number] =
    axis === "x"
      ? [initialPointPosition[0], -initialPointPosition[1]]
      : [-initialPointPosition[0], initialPointPosition[1]];

  return {
    id: `reflect-point-axis-${order}`,
    order,
    title,
    instructions,
    type: AssignmentType.INTERACTIVE,
    subjectCategory: "points",
    setup: () => {
      const { setPoints } = useScene2DStore.getState();
      setPoints([
        {
          id: "A",
          position: initialPointPosition,
          movable: true,
          color: "red",
          label: "A",
          constraints: { roundCoordinates: true },
        },
      ]);
    },
    validate: () => {
      const { getPoint } = useScene2DStore.getState();
      const point = getPoint("A");
      if (!point) return false;

      return (
        point.position[0] === goalPosition[0] &&
        point.position[1] === goalPosition[1]
      );
    },
  };
}

const reflectPointOverAxisAssignments: Omit<
  ReflectPointOverAxisAssignmentProps,
  "order"
>[] = [
  {
    title: "Reflexão no Eixo X",
    instructions:
      "Reflita o ponto A em relação ao eixo x, movendo-o para a posição espelhada.",
    initialPointPosition: [3, 2],
    axis: "x",
  },
  {
    title: "Reflexão no Eixo Y",
    instructions:
      "Reflita o ponto A em relação ao eixo y, movendo-o para a posição espelhada.",
    initialPointPosition: [-2, 4],
    axis: "y",
  },
];

export const reflectPointOverAxisAssignmentsList =
  reflectPointOverAxisAssignments.map((assignment, index) =>
    createReflectPointOverAxisAssignment({ ...assignment, order: index + 1 })
  );
```

**O que cada parte faz:**

- A interface de props (`ReflectPointOverAxisAssignmentProps`) lista só o que
  muda entre exercícios da mesma família.
- `goalPosition` é calculado uma vez fora de `setup`/`validate`, para ser
  reaproveitado nos dois.
- `setup()` usa `useScene2DStore.getState().setPoints(...)` para colocar o
  ponto "A" na cena. `movable: true` permite arrastar;
  `constraints.roundCoordinates: true` faz o ponto encaixar em coordenadas
  inteiras ao soltar — importante em qualquer exercício de arrastar, senão o
  aluno dificilmente cai exatamente no valor esperado.
- `validate()` lê a posição atual do ponto na store e compara com o alvo
  calculado.

### Passo 2 — Registrar no `index.ts` da pasta

`src/constants/assignments/points2d/index.ts`:

```ts
import { reflectPointOverAxisAssignmentsList } from "./reflectPointOverAxis";

export const pointsAssignments: Assignment[] = [
  ...pointPositionWithOptionsAssignmentsList,
  alignPointsInXAxisAssignment,
  alignPointsInYAxisAssignment,
  ...movePointAssignmentsList,
  ...whichPositionAssignmentList,
  ...reflectPointOverAxisAssignmentsList, // <- novo
];
```

**Atenção:** a posição dentro deste array é o que define a ordem de navegação
real (o botão "Próximo" usa `findIndex` neste array — o campo `order` do
`Assignment` não é usado para ordenar nada em tempo de execução).

### Passo 3 — Conferir se a matéria já inclui a lista

Em `src/constants/assignments/index.ts`, o `subject` "Pontos 2D" usa
`pointsAssignments` diretamente:

```ts
{
  title: "Pontos 2D",
  slug: "points2d",
  assignments: pointsAssignments,
  type: "2D",
},
```

Como a categoria `points` não é filtrada (diferente de vetores/matrizes, que
usam `.filter(a => a.subjectCategory === "...")`), nenhuma mudança extra é
necessária aqui. Se sua matéria usar filtro por `subjectCategory`, basta usar
um `subjectCategory` já coberto por aquele filtro.

### Passo 4 — Testar

Com `npm run dev` rodando:

- `http://localhost:3000/subject/points2d` — o novo exercício aparece na lista
- `http://localhost:3000/assignment/points2d/reflect-point-axis-1` — acesso direto

---

## 3. Tipos auxiliares mais usados em `setup()`

Ao escrever `setup()`, você normalmente está montando objetos de
`src/types/Scene2DConfig.ts`:

```ts
type TPoint = {
  id: string;
  position: [number, number];
  translation?: [number, number];
  scale?: [number, number];
  movable: boolean;             // permite o usuário arrastar
  constraints?: { roundCoordinates?: boolean }; // encaixa em inteiros ao soltar
  label?: string;
  color?: string;
};

type TVector = {
  id: string;
  tail: [number, number];       // origem da seta
  tip: [number, number];        // ponta da seta
  tailMovable?: boolean;
  tipMovable?: boolean;
  middleMovable?: boolean;      // permite mover o vetor inteiro
  color?: string;
  label?: string;
};

type TPolygon = {
  id: string;
  points: TPoint[];
  color?: string;
  strokeStyle?: "solid" | "dashed";
  movable?: boolean;
  scale?: [number, number];
  rotation?: number;
  translation?: [number, number];
  rotationMatrix?: Matrix3;
  displayAxes?: boolean;
};
```

Essas peças são gerenciadas pela store `useScene2DStore` (ou `useScene3DStore`
para exercícios 3D, que usa cubos — `TCube` — em vez de polígonos). Métodos
mais usados: `setPoints`, `setVectors`, `setPolygons`/`addPolygon`,
`setObjectivePolygons` (mostra uma "forma-fantasma" objetivo no canto da tela,
usada em exercícios de transformação), `getPoint`/`getVector`/`getPolygon`.

---

## 4. Referência rápida dos tipos de exercício

| `AssignmentType` | Store principal | Componente de UI |
|---|---|---|
| `INTERACTIVE` | `scene2DStore` / `scene3DStore` | nenhum — interação direto na cena |
| `FILL_IN_THE_BLANK_COORDINATES` | `fillInTheBlankStore` | `fill-coordinate-input.tsx` |
| `FILL_IN_THE_BLANK_WITH_OPTIONS` | `fillInTheBlankWithOptionsStore` | `fill-in-the-blank-with-options.tsx` |
| `FILL_IN_THE_BLANK_MATRIX` | `fillInBlankMatrixInputStore` | `fill-in-matrix-input.tsx` |
| `FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS` | `fillInMatrixWithOptions` | `fill-in-matrix-with-options.tsx` |
| `FILL_IN_THE_BLANK_FORMULA` | `fillInVecLengthFormulaStore` | `fill-in-vec-length-formula.tsx` |
| `ORDER_MATRIX_MULTIPLICATION` | `orderMatrixMultiplicationStore` | `order-matrix-multiplication.tsx` |
| `PARAMETERIZED` | — | **não implementado** — existe no enum mas nenhum exercício ou componente usa esse tipo hoje. Evite usá-lo a menos que você também construa o componente de UI correspondente |

A escolha de qual componente renderizar por `assignment.type` acontece em
`src/components/assignment-not-answered.tsx` — ele já cobre todos os tipos
implementados, então você **não precisa mexer nesse arquivo** ao criar um
exercício, só ao criar um `AssignmentType` totalmente novo.

---

## 5. Como cada tipo funciona, individualmente

### 5.1 `INTERACTIVE`

**O que é:** o aluno interage diretamente com a cena (arrastando pontos,
vetores ou polígonos) até atingir o estado esperado. Não existe um "campo de
resposta" separado — a própria cena é a resposta.

**Como funciona:**
- `setup()` popula `useScene2DStore` (ou `useScene3DStore`) com os objetos
  iniciais, marcando os que o aluno deve mover com `movable: true`.
- `validate()` lê a posição/estado atual desses objetos na store e compara
  com o valor-alvo calculado a partir dos parâmetros do exercício.

**Exemplo real:** [`movePoint.ts`](../src/constants/assignments/points2d/movePoint.ts)
move um ponto até uma coordenada-alvo; [`alignPointsInAxis.ts`](../src/constants/assignments/points2d/alignPointsInAxis.ts)
faz o mesmo com dois pontos, validando que ambos fiquem com uma coordenada zerada.

---

### 5.2 `FILL_IN_THE_BLANK_COORDINATES`

**O que é:** o aluno digita valores numéricos (x, y, opcionalmente z) em campos
de texto — por exemplo, "quais são as coordenadas do vetor v?".

**Como funciona:**
- `setup()` desenha o objeto de referência na cena (ex: um vetor) e chama
  `useFillInTheBlankStore.getState().setInputs([...])`, descrevendo um ou mais
  campos de input, cada um associado a um `pointRef` (o rótulo mostrado, ex:
  `"v"`) e um `coordinatesValue` inicial vazio (`{ x: "", y: "", z: "" }`).
- O componente `fill-coordinate-input.tsx` renderiza um input por entrada
  desse array.
- `validate()` lê `getInputByPointRef(pointRef)`, converte os valores digitados
  com `Number(...)` e compara com o resultado calculado matematicamente (ex:
  subtração de dois pontos para achar as componentes de um vetor).

**Exemplo real:** [`defineTheVector.ts`](../src/constants/assignments/vectors2d/defineTheVector.ts) —
mostra um vetor na tela e pede as componentes (`tip - tail`).

---

### 5.3 `FILL_IN_THE_BLANK_WITH_OPTIONS`

**O que é:** pergunta de múltipla escolha — o aluno escolhe entre opções
predefinidas para completar uma frase com espaço em branco.

**Como funciona:**
- `setup()` chama `useFillInTheBlankWithOptionsStore.getState()`:
  - `setSentence("A posição do ponto A é {coordinatesA}")` — o texto com um
    placeholder entre chaves.
  - `setOptions(options)` — array de `{ id, value, correct }`, geralmente
    embaralhado com `shuffleArray()` para não sempre aparecer na mesma ordem.
- O componente `fill-in-the-blank-with-options.tsx` troca o placeholder por um
  dropdown/seleção de opções.
- `validate()` lê `selectedOptions[placeholder]` e verifica a flag `.correct`
  da opção escolhida — **a checagem de corretude é feita nos dados, não
  recalculada em `validate()`**.

**Exemplo real:** [`pointPosition.ts`](../src/constants/assignments/points2d/pointPosition.ts) —
mostra um ponto na cena e pede para identificar suas coordenadas entre 4 opções.

---

### 5.4 `FILL_IN_THE_BLANK_MATRIX`

**O que é:** uma matriz 3x3 é mostrada parcialmente preenchida; o aluno digita
os valores que faltam (ex: a coluna de translação, o valor de escala, etc).

**Como funciona:**
- `setup()` desenha o objeto (ponto, polígono ou cubo) e opcionalmente define
  `setObjectivePolygons`/`addObjectiveCube` com a "forma-fantasma" que mostra
  o resultado esperado da transformação.
- Chama `useFillBlankMatrixInputStore.getState().addMatrix({...})` com:
  - `type`: um `MatrixType` (`TRANSLATION`, `SCALING`, `ROTATION_X/Y/Z`, `IDENTITY`)
  - `dimention`: `"2D"` ou `"3D"`
  - `matrixValue`: matriz 3x3 de células `{ value, editable }` — normalmente
    parte de um preset em `src/constants/inicial2DMatricesValues.ts` (ou o
    equivalente 3D), que já marca quais células são fixas (`editable: false`)
    e quais o aluno deve preencher (`editable: true`, `value: ""`)
  - `pointRefId`/`polygonRefId`/`objectRefId`: referência ao objeto na cena
    que a matriz afeta
- O componente `fill-in-matrix-input.tsx` renderiza a grade 3x3, com inputs só
  nas células `editable`.
- `validate()` lê `getMatrixById(id)` e extrai os valores digitados das
  células relevantes (ex: `matrix.matrixValue[0][2].value` para a translação
  em x), comparando com o valor-alvo.

**Exemplo real:** [`fillInTranslationMatrix.ts`](../src/constants/assignments/matrices/fillInTranslationMatrix.ts) —
pede para completar a coluna de translação para mover um quadrado até uma
posição objetivo mostrada no painel.

---

### 5.5 `FILL_IN_THE_BLANK_MATRIX_WITH_OPTIONS`

**O que é:** parecido com o anterior, mas em vez de digitar números o aluno
**arrasta/seleciona opções** (ex: `cos(45°)`, `sin(45°)`, `-sin(45°)`) para as
células da matriz — comum em matrizes de rotação, onde os valores dependem de
funções trigonométricas.

**Como funciona:**
- `setup()` gera as opções disponíveis (`generateOptions(angulo)` calcula
  `cos`/`sin`/`-sin` do ângulo-alvo) e chama
  `useFillInMatrixWithOptionsStore.getState()`:
  - `setMatrix({...})` — mesma ideia da matriz do tipo anterior
  - `setOptions(options)` — as opções arrastáveis
  - `selectOption(row, col, optionId)` — opcionalmente pré-preenche algumas
    células (usado para reduzir a dificuldade em exercícios dos primeiros
    níveis)
- O componente `fill-in-matrix-with-options.tsx` deixa o aluno arrastar as
  opções para as células vazias.
- `validate()` normalmente **não compara célula a célula**, e sim aplica a
  matriz resultante ao polígono/objeto e compara a posição final dos pontos
  transformados com a do polígono-objetivo (com tolerância de ponto flutuante,
  ex: `Math.abs(diferença) > 0.01`) — isso evita falsos negativos por
  arredondamento.

**Exemplo real:** [`rotationMatrixFillInWithOptions.ts`](../src/constants/assignments/matrices/rotationMatrixFillInWithOptions.ts).

---

### 5.6 `FILL_IN_THE_BLANK_FORMULA`

**O que é:** o aluno preenche os termos de uma fórmula matemática (hoje usado
só para a fórmula do módulo/comprimento de um vetor: `√(x² + y²)`).

**Como funciona:**
- `setup()` desenha o vetor de referência na cena e chama
  `useFillInVecLengthFormulaStore.getState().setVecLengthFormulas([{ vectorRefId, values, dimentions }])`,
  onde `values` são os termos da fórmula (`x`, `y`, `z`), alguns já
  preenchidos e outros como string vazia (para o aluno completar).
- O componente `fill-in-vec-length-formula.tsx` renderiza a fórmula com os
  campos editáveis nas posições vazias.
- `validate()` recalcula o comprimento real do vetor (`vec.dist(tail, tip)`) e
  compara com o valor calculado a partir do que o aluno preencheu
  (`Math.sqrt(x² + y²)`). Ao acertar, atualiza o label do vetor na cena para
  mostrar o resultado (`||v|| = 5.0`).

**Exemplo real:** [`vectorLength.ts`](../src/constants/assignments/vectors2d/vectorLength.ts).

---

### 5.7 `ORDER_MATRIX_MULTIPLICATION`

**O que é:** o mais complexo dos tipos — o aluno escolhe, entre várias
matrizes de transformação disponíveis, **quais usar e em que ordem** para
transformar um polígono até o objetivo (testa o entendimento de que
multiplicação de matrizes não é comutativa).

**Como funciona:**
- `setup()`:
  1. Calcula `objectivePolygons` aplicando a sequência correta de
     transformações (`objectiveTransformations: Matrix3[]`) ao(s)
     polígono(s) inicial(is), via `applyTransformationsToPolygon`.
  2. Monta `matricesOptions` a partir de `availableTransformations` — a lista
     de matrizes disponíveis para escolha, que inclui a sequência correta
     **mais opções extras/distratoras** (ex: uma translação de ida sem a
     volta correspondente), embaralhadas com `shuffleArray`.
  3. Chama `useScene2DStore.getState().setPolygons(...)` +
     `setObjectivePolygons(...)` e
     `useOrderMatrixStore.getState().createObject(id)` +
     `setMatricesOptions(...)`.
- O componente `order-matrix-multiplication.tsx` deixa o aluno arrastar as
  matrizes desejadas, na ordem desejada, para uma "fila" de aplicação no
  objeto (usa `@dnd-kit` para drag-and-drop).
- `validate()` pega a lista de matrizes que o aluno organizou para o objeto
  (`objectsMatrices[objectKey]`), aplica-as em sequência ao polígono original,
  e compara ponto a ponto (posição e cor) com o polígono-objetivo.

**Exemplo real:** [`orderingMatrices.ts`](../src/constants/assignments/matrices/orderingMatrices.ts).

---

### 5.8 `PARAMETERIZED`

Está declarado em `AssignmentType` mas **nenhum exercício do repositório o
usa, e não existe componente de UI associado a ele** em
`assignment-not-answered.tsx`. Provavelmente reservado para um tipo futuro
(exercício com parâmetros configuráveis dinamicamente). Se quiser usá-lo,
será necessário também implementar o componente de UI correspondente.

---

## 6. Criando uma matéria (`subjectCategory`) nova

Se o exercício não se encaixa em nenhuma categoria existente, siga estes
passos extras:

1. Adicione o novo valor à union `SubjectCategories` em
   `src/constants/defaultDailyMissions.ts`.
2. Adicione uma entrada nova no array `subjects` em
   `src/constants/assignments/index.ts`, com `title`, `description`, `slug` e
   `assignments: minhaLista.filter(a => a.subjectCategory === "minha-categoria")`.
3. (Opcional) Adicione uma entrada em `defaultDailyMissions` para que a
   matéria entre nas missões diárias.
4. (Opcional) Adicione uma entrada em `subjectOptions`
   (`src/constants/assignments/index.ts`) com uma ou mais funções
   "geradoras" (`generators`) se quiser que a matéria também apareça no modo
   de exercício aleatório (`/assignment/random`).

---

## 7. Checklist final

- [ ] Escolhi um `subjectCategory` existente (ou criei um novo — seção 6)
- [ ] Escolhi o `AssignmentType` correto para o formato de resposta desejado
- [ ] Criei o arquivo com a função `createXAssignment` + array de props + `.map()`
- [ ] `id` é único e `order` é derivado do índice
- [ ] `setup()` popula a(s) store(s) certa(s) para o tipo escolhido
- [ ] `validate()` compara o estado atual com o valor-alvo (com tolerância se
      envolver números de ponto flutuante)
- [ ] Importei e adicionei a lista no `index.ts` da pasta, na posição correta
      dentro do array (isso define a ordem de navegação)
- [ ] Testei no navegador em `/assignment/<slug-da-materia>/<id>`
