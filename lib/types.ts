import type { Edge, Node } from "reactflow"

export type DataType = "texto" | "numero" | "logico" | "lista"

export type LogicNodeType =
  | "start"
  | "end"
  | "input"
  | "variable"
  | "condition"
  | "loop"
  | "list"
  | "print"
  | "function"

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
  prompt?: string

  leftExpr?: string
  operator?: CompareOperator
  rightExpr?: string
  trueLabel?: string
  falseLabel?: string

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
