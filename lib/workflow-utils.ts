import { Position, type XYPosition } from "reactflow"
import { findFunction } from "./functions"
import { getCatalogItem } from "./node-catalog"
import type { TypedVariable } from "./condition"
import type { DataType, LogicNodeType, NodeData, WorkflowEdge, WorkflowNode } from "./types"

const LAYOUT_X_GAP = 280
const LAYOUT_Y_GAP = 150
const LAYOUT_ORIGIN_X = 40
const LAYOUT_ORIGIN_Y = 180

const FLOW_TYPE_ORDER: Record<string, number> = {
  start: 0,
  variable: 1,
  input: 2,
  function: 3,
  list: 4,
  condition: 5,
  switch: 5,
  loop: 6,
  print: 7,
  end: 8,
}

function branchYOffset(handle?: string | null): number {
  if (handle === "true") return -LAYOUT_Y_GAP * 0.55
  if (handle === "false") return LAYOUT_Y_GAP * 0.55
  if (handle === "body") return LAYOUT_Y_GAP * 0.7
  return 0
}

function sortNodesByFlowOrder(items: WorkflowNode[]): WorkflowNode[] {
  return [...items].sort((a, b) => {
    const orderA = FLOW_TYPE_ORDER[a.type ?? ""] ?? 99
    const orderB = FLOW_TYPE_ORDER[b.type ?? ""] ?? 99
    if (orderA !== orderB) return orderA - orderB
    return a.id.localeCompare(b.id, "pt-BR")
  })
}

function layoutHorizontalRow(items: WorkflowNode[], startX = LAYOUT_ORIGIN_X, y = LAYOUT_ORIGIN_Y): WorkflowNode[] {
  return items.map((node, index) => ({
    ...node,
    position: { x: startX + index * LAYOUT_X_GAP, y },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }))
}

function areBranchSiblings(ids: string[], incoming: Map<string, WorkflowEdge[]>): boolean {
  if (ids.length <= 1) return true
  const parentSets = ids.map((id) => {
    const inc = incoming.get(id) ?? []
    return [...new Set(inc.map((edge) => edge.source))].sort().join("|")
  })
  return parentSets.every((value) => value === parentSets[0] && value !== "")
}

/**
 * Organiza os nós da esquerda para a direita. Ramificações (sim/não) ficam na mesma coluna, com deslocamento vertical.
 */
export function autoLayoutGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  if (nodes.length === 0) return nodes

  if (edges.length === 0) {
    return layoutHorizontalRow(sortNodesByFlowOrder(nodes))
  }

  const outgoing = new Map<string, WorkflowEdge[]>()
  const incoming = new Map<string, WorkflowEdge[]>()

  for (const node of nodes) {
    outgoing.set(node.id, [])
    incoming.set(node.id, [])
  }
  for (const edge of edges) {
    outgoing.get(edge.source)?.push(edge)
    incoming.get(edge.target)?.push(edge)
  }

  const startNode = nodes.find((node) => node.type === "start")
  const roots = startNode
    ? [startNode.id]
    : nodes.filter((node) => (incoming.get(node.id)?.length ?? 0) === 0).map((node) => node.id)

  const layer = new Map<string, number>()
  for (const root of roots) layer.set(root, 0)

  let changed = true
  while (changed) {
    changed = false
    for (const edge of edges) {
      const sourceLayer = layer.get(edge.source)
      if (sourceLayer === undefined) continue
      const nextLayer = sourceLayer + 1
      const current = layer.get(edge.target) ?? -1
      if (nextLayer > current) {
        layer.set(edge.target, nextLayer)
        changed = true
      }
    }
  }

  const reachable = new Set<string>()
  const visitQueue = [...roots]
  while (visitQueue.length > 0) {
    const id = visitQueue.shift()!
    if (reachable.has(id)) continue
    reachable.add(id)
    for (const edge of outgoing.get(id) ?? []) visitQueue.push(edge.target)
  }

  const orphans = nodes.filter((node) => !reachable.has(node.id))
  const connected = nodes.filter((node) => reachable.has(node.id))

  const preferredY = new Map<string, number>()
  for (const root of roots) preferredY.set(root, LAYOUT_ORIGIN_Y)

  const yQueue = [...roots]
  const yVisited = new Set<string>()
  while (yQueue.length > 0) {
    const id = yQueue.shift()!
    if (yVisited.has(id)) continue
    yVisited.add(id)
    const baseY = preferredY.get(id) ?? LAYOUT_ORIGIN_Y
    for (const edge of outgoing.get(id) ?? []) {
      const targetY = baseY + branchYOffset(edge.sourceHandle)
      const existing = preferredY.get(edge.target)
      preferredY.set(edge.target, existing === undefined ? targetY : (existing + targetY) / 2)
      yQueue.push(edge.target)
    }
  }

  const byLayer = new Map<number, string[]>()
  for (const node of connected) {
    const rank = layer.get(node.id) ?? 0
    if (!byLayer.has(rank)) byLayer.set(rank, [])
    byLayer.get(rank)!.push(node.id)
  }

  const column = new Map<string, number>()
  let columnCursor = 0

  for (const [, ids] of [...byLayer.entries()].sort((a, b) => a[0] - b[0])) {
    if (areBranchSiblings(ids, incoming)) {
      for (const id of ids) column.set(id, columnCursor)
      columnCursor += 1
    } else {
      const sorted = sortNodesByFlowOrder(ids.map((id) => nodes.find((node) => node.id === id)!).filter(Boolean))
      for (const node of sorted) {
        column.set(node.id, columnCursor)
        columnCursor += 1
      }
    }
  }

  const positions = new Map<string, { x: number; y: number }>()

  const byColumn = new Map<number, string[]>()
  for (const [id, col] of column.entries()) {
    if (!byColumn.has(col)) byColumn.set(col, [])
    byColumn.get(col)!.push(id)
  }

  for (const [col, ids] of [...byColumn.entries()].sort((a, b) => a[0] - b[0])) {
    const sorted = [...ids].sort(
      (a, b) => (preferredY.get(a) ?? LAYOUT_ORIGIN_Y) - (preferredY.get(b) ?? LAYOUT_ORIGIN_Y),
    )
    const resolvedY: number[] = []
    for (let i = 0; i < sorted.length; i++) {
      let y = preferredY.get(sorted[i]) ?? LAYOUT_ORIGIN_Y
      if (i > 0 && sorted.length > 1) y = Math.max(y, resolvedY[i - 1] + LAYOUT_Y_GAP)
      resolvedY.push(y)
    }
    sorted.forEach((id, index) => {
      positions.set(id, { x: LAYOUT_ORIGIN_X + col * LAYOUT_X_GAP, y: resolvedY[index] })
    })
  }

  if (orphans.length > 0) {
    sortNodesByFlowOrder(orphans).forEach((node, index) => {
      if (positions.has(node.id)) return
      positions.set(node.id, {
        x: LAYOUT_ORIGIN_X + index * LAYOUT_X_GAP,
        y: LAYOUT_ORIGIN_Y - LAYOUT_Y_GAP,
      })
    })
  }

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? { x: LAYOUT_ORIGIN_X, y: LAYOUT_ORIGIN_Y },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }))
}

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
        conditions: [{ leftExpr: "idade", operator: ">=", rightExpr: "18" }],
        trueLabel: "sim",
        falseLabel: "não",
      }
    case "switch":
      return {
        ...base,
        switchExpr: "categoria",
        switchCases: [
          { id: "case-a", matchExpr: '"A"', label: "tipo A" },
          { id: "case-b", matchExpr: '"B"', label: "tipo B" },
        ],
        defaultLabel: "outro",
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
