import type { Edge, Node } from "reactflow"

export type DataType = "texto" | "numero" | "logico" | "lista"

export type LogicNodeType =
  | "start"
  | "end"
  | "input"
  | "variable"
  | "operation"
  | "condition"
  | "switch"
  | "loop"
  | "list"
  | "print"
  | "function"

export type ConditionJoin = "e" | "ou"

export interface ConditionRule {
  join?: ConditionJoin
  leftExpr: string
  operator: CompareOperator
  rightExpr?: string
}

export interface VariableDeclaration {
  id: string
  name: string
  dataType: DataType
  valueExpr: string
}

/** Atribuição que altera uma variável já existente (bloco Processar). */
export type AssignmentMode = "function" | "expression"

export interface VariableAssignment {
  id: string
  targetVar: string
  mode: AssignmentMode
  /** Modo expressão: novo valor livre */
  valueExpr: string
  /** Modo função: nome da função tipada */
  functionName?: string
  /** Modo função: argumentos extras (o 1º é sempre a variável escolhida) */
  functionArgs?: string[]
}

/** Pergunta do bloco Perguntar (pode haver várias em sequência). */
export interface InputQuestion {
  id: string
  prompt: string
  variableName: string
  dataType: DataType
}

export interface SwitchCase {
  id: string
  matchExpr: string
  label?: string
}

export type CompareOperator =
  | "=="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "contem"
  | "naoContem"
  | "comecaCom"
  | "terminaCom"
  | "vazia"
  | "naoVazia"
  | "verdadeiro"
  | "falso"

export type LoopType = "para" | "enquanto" | "paraCada"

export type ListOperation = "criar" | "adicionar" | "obter" | "tamanho"

export type FunctionCategory = "texto" | "matematica" | "lista"

export type RuntimeValue =
  | { type: "texto"; value: string }
  | { type: "numero"; value: number }
  | { type: "logico"; value: boolean }
  | { type: "lista"; value: RuntimeValue[] }

export interface NodeData {
  label: string
  description?: string
  running?: boolean
  tip?: string

  variableName?: string
  dataType?: DataType
  valueExpr?: string
  /** Várias declarações no mesmo bloco Variável */
  variables?: VariableDeclaration[]
  /** Atribuições do bloco Processar (atualiza variáveis existentes) */
  assignments?: VariableAssignment[]
  prompt?: string
  /** Várias perguntas no mesmo bloco Perguntar */
  questions?: InputQuestion[]

  leftExpr?: string
  operator?: CompareOperator
  rightExpr?: string
  /** Várias condições ligadas por E / OU */
  conditions?: ConditionRule[]
  trueLabel?: string
  falseLabel?: string

  switchExpr?: string
  switchCases?: SwitchCase[]
  defaultLabel?: string

  loopType?: LoopType
  counterVar?: string
  fromExpr?: string
  toExpr?: string
  stepExpr?: string

  listOp?: ListOperation
  listName?: string
  itemsExpr?: string
  itemVar?: string
  indexExpr?: string
  targetVar?: string

  functionCategory?: FunctionCategory
  functionName?: string
  functionArgs?: string[]

  template?: string
}

export type WorkflowNode = Node<NodeData, LogicNodeType | string>
export type WorkflowEdge = Edge<{ label?: string }>

export interface WorkflowGraph {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface SavedProgram {
  id: string
  name: string
  graph: WorkflowGraph
  createdAt: string
  updatedAt: string
  lessonId?: string
}

export interface PersistedState {
  version: 1 | 2 | 3
  programs: SavedProgram[]
  currentProgramId: string
  completedLessons: string[]
  speedMs: number
  stepMode: boolean
  /** Exibe o padrão de bolinhas no canvas do React Flow */
  showCanvasDots: boolean
  /** Painel lateral de blocos aberto (desktop) */
  paletteOpen?: boolean
  /** Painel de aula/configuração aberto (desktop) */
  missionOpen?: boolean
  /** Painel em tela estreita: blocos, aula ou nenhum */
  mobilePanel?: "blocos" | "missao" | null
  /** Primeiro nome da pessoa, usado nas aulas e na interface */
  firstName?: string
}

export type RuntimeStatus = "idle" | "running" | "paused" | "waiting-input" | "done" | "error"

export interface LogLine {
  id: string
  kind: "output" | "info" | "error" | "system"
  message: string
}

export interface InputPrompt {
  nodeId: string
  variableName: string
  dataType: DataType
  message: string
}

export interface RuntimeSnapshot {
  status: RuntimeStatus
  currentNodeId: string | null
  memory: Record<string, RuntimeValue>
  logs: LogLine[]
  inputPrompt: InputPrompt | null
  error?: string
  stepCount: number
}

export interface Lesson {
  id: string
  order: number
  title: string
  emoji: string
  concept: string
  goal: string
  hint: string
  exampleId: string
}
