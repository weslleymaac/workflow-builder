import { Position, type XYPosition } from "reactflow"
import { findFunction } from "./functions"
import { getCatalogItem } from "./node-catalog"
import type { TypedVariable } from "./condition"
import type { DataType, LogicNodeType, NodeData, WorkflowNode } from "./types"

let nodeIdCounter = 0

export const generateNodeId = (type: string): string => {
  nodeIdCounter += 1
  return `${type}-${nodeIdCounter}-${Math.random().toString(36).slice(2, 6)}`
}

export const syncNodeIdCounter = (nodes: WorkflowNode[]) => {
  const max = nodes.reduce((acc, node) => {
    const match = node.id.match(/-(\d+)-/)
    const value = match ? Number(match[1]) : 0
    return Math.max(acc, value)
  }, 0)
  nodeIdCounter = Math.max(nodeIdCounter, max)
}

const defaultData = (type: LogicNodeType): NodeData => {
  const item = getCatalogItem(type)
  const base: NodeData = {
    label: item?.label ?? "Bloco",
    description: item?.description,
    tip: item?.tip,
  }

  switch (type) {
    case "variable":
      return { ...base, variableName: "pontos", dataType: "numero", valueExpr: "0" }
    case "input":
      return {
        ...base,
        variableName: "idade",
        dataType: "numero",
        prompt: "Qual é a sua idade?",
      }
    case "print":
      return { ...base, template: "Olá, mundo!" }
    case "condition":
      return {
        ...base,
        leftExpr: "idade",
        operator: ">=",
        rightExpr: "18",
        trueLabel: "sim",
        falseLabel: "não",
      }
    case "loop":
      return {
        ...base,
        loopType: "para",
        counterVar: "i",
        fromExpr: "1",
        toExpr: "5",
        stepExpr: "1",
        leftExpr: "continuar",
        operator: "==",
        rightExpr: "verdadeiro",
        listName: "",
        itemVar: "item",
      }
    case "function":
      return {
        ...base,
        functionCategory: "texto",
        functionName: "maiuscula",
        functionArgs: ['"logica"'],
        targetVar: "resultado",
      }
    case "list":
      return {
        ...base,
        listOp: "criar",
        listName: "frutas",
        itemsExpr: '"maçã", "banana", "uva"',
        indexExpr: "0",
        targetVar: "item",
        valueExpr: '"laranja"',
        dataType: "texto",
      }
    default:
      return base
  }
}

/**
 * Mapeia variáveis do programa com o tipo declarado em cada bloco.
 */
export const collectProgramVariables = (nodes: WorkflowNode[]): TypedVariable[] => {
  const map = new Map<string, DataType>()

  const setVar = (name: string | undefined, dataType: DataType) => {
    const trimmed = name?.trim()
    if (!trimmed) return
    map.set(trimmed, dataType)
  }

  for (const node of nodes) {
    const { data } = node

    if ((node.type === "variable" || node.type === "input") && data.variableName?.trim()) {
      setVar(data.variableName, data.dataType ?? "texto")
    }

    if (node.type === "list" && data.listName?.trim()) {
      if (!data.listOp || data.listOp === "criar") {
        setVar(data.listName, "lista")
      }
    }

    if (node.type === "list" && data.listOp === "tamanho") {
      setVar(data.targetVar, "numero")
    }

    if (node.type === "list" && data.listOp === "obter") {
      setVar(data.targetVar, data.dataType ?? "texto")
    }

    if (node.type === "function" && data.targetVar?.trim()) {
      const fn = findFunction(data.functionName)
      if (fn?.returnsList) setVar(data.targetVar, "lista")
      else if (fn?.categories.includes("matematica")) setVar(data.targetVar, "numero")
      else setVar(data.targetVar, "texto")
    }

    if (node.type === "loop") {
      if (data.loopType === "para" && data.counterVar?.trim()) {
        setVar(data.counterVar, "numero")
      }
      if (data.loopType === "paraCada" && data.itemVar?.trim()) {
        if (!map.has(data.itemVar.trim())) setVar(data.itemVar, "texto")
      }
    }
  }

  return [...map.entries()]
    .map(([name, dataType]) => ({ name, dataType }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
}

/**
 * Descobre quais variáveis do programa guardam listas, para o aluno escolher
 * numa lista suspensa em vez de digitar o nome à mão.
 */
export const collectListVariables = (nodes: WorkflowNode[]): string[] => {
  return collectProgramVariables(nodes)
    .filter((item) => item.dataType === "lista")
    .map((item) => item.name)
}

export const createNode = ({
  type,
  position,
  id,
  data,
}: {
  type: string
  position: XYPosition
  id?: string
  data?: Partial<NodeData>
}): WorkflowNode => {
  const nodeType = type as LogicNodeType
  return {
    id: id ?? generateNodeId(type),
    type: nodeType,
    position,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      ...defaultData(nodeType),
      ...data,
    },
  }
}
