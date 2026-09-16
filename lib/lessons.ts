import type { Lesson, RuntimeSnapshot, WorkflowNode } from "./types"

export const LESSONS: Lesson[] = [
  {
    id: "tipos",
    order: 1,
    title: "Tipos de dados",
    emoji: "🪐",
    concept: "Cada dado no fluxo tem um tipo: texto, número, lógico ou lista.",
    goal: "Crie variáveis de texto e número, depois mostre os valores na saída.",
    hint: 'Texto usa aspas: "{name}". Número não: 18. Lógico é verdadeiro ou falso.',
    exampleId: "tipos",
  },
  {
    id: "variaveis",
    order: 2,
    title: "Variáveis",
    emoji: "🛸",
    concept: "Variável é uma caixinha com nome. O rótulo fica; o valor pode mudar.",
    goal: "Guarde dois números, some-os e mostre o resultado.",
    hint: "Crie a, depois b, depois total com a expressão a + b.",
    exampleId: "variaveis",
  },
  {
    id: "condicao",
    order: 3,
    title: "Condição",
    emoji: "🧭",
    concept: "Se / Senão escolhe o caminho do fluxo conforme os dados.",
    goal: "Pergunte a idade e mostre se o acesso está autorizado.",
    hint: "Ligue o caminho SIM e NÃO. Os dois podem terminar no Fim.",
    exampleId: "condicao",
  },
  {
    id: "repeticao",
    order: 4,
    title: "Repetição",
    emoji: "🔁",
    concept: "Loops repetem o mesmo bloco várias vezes: Para, Enquanto e Para cada item.",
    goal: "Use um loop Para e mostre os números de 1 até 5.",
    hint: "O corpo do loop precisa voltar ao bloco Repetir com uma seta.",
    exampleId: "repeticao",
  },
  {
    id: "listas",
    order: 5,
    title: "Listas",
    emoji: "✨",
    concept: "Lista guarda vários itens numa única variável. O primeiro índice é 0.",
    goal: "Crie uma lista com 3 itens e mostre cada um com Para cada.",
    hint: "Crie a lista primeiro. Depois Repetir → Para cada → selecione a lista.",
    exampleId: "listas",
  },
  {
    id: "funcoes",
    order: 6,
    title: "Funções",
    emoji: "🛠️",
    concept: "Funções são ferramentas prontas. Você passa um valor e recebe outro de volta.",
    goal: "Use blocos de Função para transformar texto e calcular com listas.",
    hint: "Experimente maiuscula(), media() e arredondar() nos exemplos.",
    exampleId: "funcoes",
  },
]

export function getLesson(id: string | undefined): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id)
}

export interface LessonCheck {
  label: string
  done: boolean
}

export function lessonProgress(lesson: Lesson, nodes: WorkflowNode[], snapshot: RuntimeSnapshot): LessonCheck[] {
  const types = new Set(nodes.map((node) => node.type))
  const prints = snapshot.logs.filter((line) => line.kind === "output").length
  const memory = Object.values(snapshot.memory)

  if (lesson.id === "tipos") {
    return [
      { label: "Tem um bloco de variável", done: types.has("variable") },
      { label: "Guardou um texto", done: memory.some((value) => value.type === "texto") },
      { label: "Guardou um número", done: memory.some((value) => value.type === "numero") },
      { label: "Mostrou algo na saída", done: prints > 0 },
    ]
  }

  if (lesson.id === "variaveis") {
    return [
      { label: "Criou pelo menos duas variáveis", done: nodes.filter((node) => node.type === "variable").length >= 2 },
      { label: "Trabalhou com números", done: memory.some((value) => value.type === "numero") },
      { label: "Mostrou o resultado", done: prints > 0 },
    ]
  }

  if (lesson.id === "condicao") {
    return [
      { label: "Usou Se / Senão", done: types.has("condition") },
      { label: "Perguntou um valor", done: types.has("input") },
      { label: "Mostrou uma mensagem", done: prints > 0 },
    ]
  }

  if (lesson.id === "repeticao") {
    return [
      { label: "Usou um loop", done: types.has("loop") },
      { label: "Mostrou várias voltas", done: prints >= 5 },
      { label: "O programa chegou ao fim", done: snapshot.status === "done" },
    ]
  }

  if (lesson.id === "funcoes") {
    return [
      { label: "Usou um bloco de Função", done: types.has("function") },
      { label: "Guardou o resultado numa variável", done: nodes.some((node) => node.type === "function" && node.data.targetVar) },
      { label: "Mostrou o resultado", done: prints > 0 },
    ]
  }

  return [
    { label: "Usou um bloco de lista", done: types.has("list") },
    { label: "Criou uma lista na memória", done: memory.some((value) => value.type === "lista") },
    { label: "Mostrou os itens", done: prints >= 3 },
  ]
}

export function isLessonComplete(lesson: Lesson, nodes: WorkflowNode[], snapshot: RuntimeSnapshot): boolean {
  if (snapshot.status !== "done") return false
  return lessonProgress(lesson, nodes, snapshot).every((check) => check.done)
}
