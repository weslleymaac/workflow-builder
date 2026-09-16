import type { LogicNodeType } from "./types"

export type ExampleLevel = "basico" | "intermediario" | "avancado"

export interface ExampleMeta {
  id: string
  level: ExampleLevel
  /** Nós principais que este exemplo ensina */
  focus: LogicNodeType[]
}

export interface ExampleCategory {
  id: string
  title: string
  emoji: string
  tagline: string
  examples: ExampleMeta[]
}

export const LEVEL_LABEL: Record<ExampleLevel, string> = {
  basico: "Básico",
  intermediario: "Intermediário",
  avancado: "Avançado",
}

export const LEVEL_STYLE: Record<ExampleLevel, string> = {
  basico: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-200 dark:border-cyan-400/30",
  intermediario: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:border-violet-400/30",
  avancado: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-400/30",
}

/** Missões organizadas do básico ao avançado, com 2+ exemplos por tipo de nó */
export const EXAMPLE_CATEGORIES: ExampleCategory[] = [
  {
    id: "fluxo",
    title: "Decolagem",
    emoji: "🚀",
    tagline: "Início e Fim — sua primeira missão espacial",
    examples: [
      { id: "hello", level: "basico", focus: ["start", "variable", "print", "end"] },
      { id: "decolagem", level: "basico", focus: ["start", "print", "end"] },
    ],
  },
  {
    id: "dados",
    title: "Carga útil",
    emoji: "📡",
    tagline: "Variáveis, perguntas e transmissões",
    examples: [
      { id: "var-basico", level: "basico", focus: ["variable", "print"] },
      { id: "tipos", level: "basico", focus: ["variable", "print"] },
      { id: "variaveis", level: "intermediario", focus: ["variable", "print"] },
      { id: "input-nome", level: "basico", focus: ["input", "print"] },
      { id: "input-combustivel", level: "basico", focus: ["input", "print"] },
      { id: "print-relatorio", level: "intermediario", focus: ["variable", "print"] },
    ],
  },
  {
    id: "funcoes",
    title: "Ferramentas",
    emoji: "🛠️",
    tagline: "Funções prontas para texto, matemática e listas",
    examples: [
      { id: "func-texto", level: "basico", focus: ["function", "print"] },
      { id: "func-matematica", level: "basico", focus: ["function", "print"] },
      { id: "funcoes", level: "avancado", focus: ["function", "list", "print"] },
    ],
  },
  {
    id: "decisao",
    title: "Navegação",
    emoji: "🧭",
    tagline: "Se / Senão — escolher o caminho certo",
    examples: [
      { id: "condicao", level: "intermediario", focus: ["input", "condition", "print"] },
      { id: "cond-planeta", level: "basico", focus: ["variable", "condition", "print"] },
    ],
  },
  {
    id: "repeticao",
    title: "Órbita",
    emoji: "🔁",
    tagline: "Para, Enquanto e Para cada",
    examples: [
      { id: "repeticao", level: "basico", focus: ["loop", "print"] },
      { id: "loop-enquanto", level: "intermediario", focus: ["loop", "variable", "print"] },
      { id: "listas", level: "intermediario", focus: ["list", "loop", "print"] },
    ],
  },
  {
    id: "colecao",
    title: "Constelações",
    emoji: "✨",
    tagline: "Listas e operações com coleções",
    examples: [
      { id: "list-planetas", level: "basico", focus: ["list", "print"] },
      { id: "list-operacoes", level: "intermediario", focus: ["list", "print"] },
      { id: "listas-avancado", level: "avancado", focus: ["list", "loop", "function", "print"] },
    ],
  },
]

export function allExampleMetas(): ExampleMeta[] {
  return EXAMPLE_CATEGORIES.flatMap((category) => category.examples)
}

export function getExampleMeta(id: string): ExampleMeta | undefined {
  return allExampleMetas().find((item) => item.id === id)
}
