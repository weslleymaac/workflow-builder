import type { LogicNodeType } from "./types"

export interface NodeCatalogItem {
  type: LogicNodeType
  label: string
  description: string
  tip: string
  group: "fluxo" | "dados" | "funcoes" | "decisao" | "repeticao" | "colecao"
  accent: NodeAccent
}

export type NodeAccent =
  | "emerald"
  | "slate"
  | "sky"
  | "violet"
  | "amber"
  | "orange"
  | "pink"
  | "teal"
  | "indigo"
  | "rose"

export const NODE_ACCENTS: Record<
  NodeAccent,
  {
    border: string
    soft: string
    icon: string
    handle: string
    text: string
    ring: string
  }
> = {
  emerald: {
    border: "border-emerald-400/70",
    soft: "bg-emerald-500/10 dark:bg-emerald-500/10",
    icon: "bg-emerald-600 text-white",
    handle: "!bg-emerald-400 !border-emerald-300/50",
    text: "text-emerald-700 dark:text-emerald-200",
    ring: "ring-emerald-400/60",
  },
  slate: {
    border: "border-slate-500/60",
    soft: "bg-slate-500/10",
    icon: "bg-slate-500 text-white",
    handle: "!bg-slate-400 !border-slate-300/50",
    text: "text-slate-700 dark:text-slate-200",
    ring: "ring-slate-400/50",
  },
  sky: {
    border: "border-sky-400/70",
    soft: "bg-sky-500/10",
    icon: "bg-sky-600 text-white",
    handle: "!bg-sky-400 !border-sky-300/50",
    text: "text-sky-700 dark:text-sky-200",
    ring: "ring-sky-400/60",
  },
  violet: {
    border: "border-violet-400/70",
    soft: "bg-violet-500/10",
    icon: "bg-violet-600 text-white",
    handle: "!bg-violet-400 !border-violet-300/50",
    text: "text-violet-700 dark:text-violet-200",
    ring: "ring-violet-400/60",
  },
  amber: {
    border: "border-amber-400/70",
    soft: "bg-amber-500/10",
    icon: "bg-amber-600 text-white",
    handle: "!bg-amber-400 !border-amber-300/50",
    text: "text-amber-800 dark:text-amber-200",
    ring: "ring-amber-400/60",
  },
  orange: {
    border: "border-orange-400/70",
    soft: "bg-orange-500/10",
    icon: "bg-orange-600 text-white",
    handle: "!bg-orange-400 !border-orange-300/50",
    text: "text-orange-700 dark:text-orange-200",
    ring: "ring-orange-400/60",
  },
  pink: {
    border: "border-pink-400/70",
    soft: "bg-pink-500/10",
    icon: "bg-pink-600 text-white",
    handle: "!bg-pink-400 !border-pink-300/50",
    text: "text-pink-700 dark:text-pink-200",
    ring: "ring-pink-400/60",
  },
  teal: {
    border: "border-teal-400/70",
    soft: "bg-teal-500/10",
    icon: "bg-teal-600 text-white",
    handle: "!bg-teal-400 !border-teal-300/50",
    text: "text-teal-700 dark:text-teal-200",
    ring: "ring-teal-400/60",
  },
  indigo: {
    border: "border-indigo-400/70",
    soft: "bg-indigo-500/10",
    icon: "bg-indigo-600 text-white",
    handle: "!bg-indigo-400 !border-indigo-300/50",
    text: "text-indigo-700 dark:text-indigo-200",
    ring: "ring-indigo-400/60",
  },
  rose: {
    border: "border-rose-400/70",
    soft: "bg-rose-500/10",
    icon: "bg-rose-600 text-white",
    handle: "!bg-rose-400 !border-rose-300/50",
    text: "text-rose-700 dark:text-rose-200",
    ring: "ring-rose-400/60",
  },
}

export const NODE_CATALOG: NodeCatalogItem[] = [
  {
    type: "start",
    label: "Início",
    description: "Ponto de partida",
    tip: "Todo programa começa aqui. Só pode ter um.",
    group: "fluxo",
    accent: "emerald",
  },
  {
    type: "end",
    label: "Fim",
    description: "Encerra o fluxo",
    tip: "Quando o fluxo chega aqui, o programa termina.",
    group: "fluxo",
    accent: "slate",
  },
  {
    type: "variable",
    label: "Variável",
    description: "Guardar um valor",
    tip: "Defina uma ou várias variáveis: nome, tipo e valor.",
    group: "dados",
    accent: "violet",
  },
  {
    type: "operation",
    label: "Processar",
    description: "Alterar uma variável",
    tip: "Escolha uma variável e aplique uma função do tipo dela, ou use uma expressão livre.",
    group: "dados",
    accent: "rose",
  },
  {
    type: "input",
    label: "Perguntar",
    description: "Ler um valor",
    tip: "Adicione uma ou várias perguntas. O programa pede cada uma em sequência.",
    group: "dados",
    accent: "sky",
  },
  {
    type: "print",
    label: "Mostrar",
    description: "Escrever na saída",
    tip: "Use {nome} para mostrar o conteúdo de uma variável.",
    group: "dados",
    accent: "teal",
  },
  {
    type: "function",
    label: "Função",
    description: "Ferramentas prontas",
    tip: "Use {nome} para passar uma variável como argumento.",
    group: "funcoes",
    accent: "indigo",
  },
  {
    type: "condition",
    label: "Se / Senão",
    description: "Tomar uma decisão",
    tip: "Combine várias condições com E ou OU.",
    group: "decisao",
    accent: "amber",
  },
  {
    type: "switch",
    label: "Switch",
    description: "Escolher por valor",
    tip: "Compara uma variável com vários casos e segue o caminho correspondente.",
    group: "decisao",
    accent: "amber",
  },
  {
    type: "loop",
    label: "Repetir",
    description: "For, while e for each",
    tip: "Conta de X até Y, repete enquanto for verdade ou percorre uma lista.",
    group: "repeticao",
    accent: "orange",
  },
  {
    type: "list",
    label: "Lista",
    description: "Criar e mexer na lista",
    tip: "O primeiro item fica no índice 0. Para percorrer, use Repetir.",
    group: "colecao",
    accent: "pink",
  },
]

export const CATALOG_GROUPS: { id: NodeCatalogItem["group"]; title: string }[] = [
  { id: "fluxo", title: "Fluxo" },
  { id: "dados", title: "Dados" },
  { id: "funcoes", title: "Funções" },
  { id: "decisao", title: "Decisão" },
  { id: "repeticao", title: "Repetição" },
  { id: "colecao", title: "Coleção" },
]

export function getCatalogItem(type: string): NodeCatalogItem | undefined {
  return NODE_CATALOG.find((item) => item.type === type)
}
