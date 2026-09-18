"use client"

import { memo } from "react"
import type { NodeProps } from "reactflow"
import {
  Cog,
  Flag,
  FunctionSquare,
  GitBranch,
  List,
  MessageCircleQuestion,
  Play,
  Repeat,
  Signpost,
  Speech,
  Variable,
} from "lucide-react"
import { FUNCTION_CATEGORY_LABEL, categoryOf, findFunction } from "@/lib/functions"
import { formatConditionsDisplay, getConditionRules } from "@/lib/condition"
import type { NodeData } from "@/lib/types"
import { DATA_TYPE_LABEL } from "@/lib/values"
import { getVariableAssignments, getVariableDeclarations } from "@/lib/workflow-utils"
import { LogicNode } from "./logic-node"

export const StartNode = memo(({ data, selected }: NodeProps<NodeData>) => (
  <LogicNode
    accent="emerald"
    icon={<Play className="h-4 w-4" />}
    title={data.label || "Início"}
    subtitle="Começa por aqui"
    selected={selected}
    running={data.running}
    target={false}
  />
))
StartNode.displayName = "StartNode"

export const EndNode = memo(({ data, selected }: NodeProps<NodeData>) => (
  <LogicNode
    accent="slate"
    icon={<Flag className="h-4 w-4" />}
    title={data.label || "Fim"}
    subtitle="Programa concluído"
    selected={selected}
    running={data.running}
    sources={[]}
  />
))
EndNode.displayName = "EndNode"

export const VariableNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const declarations = getVariableDeclarations(data).filter((item) => item.name.trim() || item.valueExpr.trim())
  const visible = declarations.slice(0, 3)
  const extra = Math.max(declarations.length - visible.length, 0)

  return (
    <LogicNode
      accent="violet"
      icon={<Variable className="h-4 w-4" />}
      title={data.label || "Variável"}
      subtitle={
        declarations.length > 1
          ? `${declarations.length} variáveis`
          : declarations[0]?.dataType
            ? DATA_TYPE_LABEL[declarations[0].dataType]
            : "Guardar valor"
      }
      selected={selected}
      running={data.running}
    >
      {visible.length === 0 ? (
        <span>nome = ?</span>
      ) : (
        <div className="space-y-0.5">
          {visible.map((item) => (
            <div key={item.id}>
              {item.name || "nome"} = {item.valueExpr || "?"}
            </div>
          ))}
          {extra > 0 && <div className="text-muted-foreground">+{extra} mais</div>}
        </div>
      )}
    </LogicNode>
  )
})
VariableNode.displayName = "VariableNode"

export const OperationNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const assignments = getVariableAssignments(data).filter(
    (item) =>
      item.targetVar.trim() ||
      item.valueExpr.trim() ||
      Boolean(item.functionName),
  )
  const visible = assignments.slice(0, 3)
  const extra = Math.max(assignments.length - visible.length, 0)

  return (
    <LogicNode
      accent="rose"
      icon={<Cog className="h-4 w-4" />}
      title={data.label || "Processar"}
      subtitle={
        assignments.length > 1 ? `${assignments.length} processamentos` : "Altera variável"
      }
      selected={selected}
      running={data.running}
    >
      {visible.length === 0 ? (
        <span>variável ← ?</span>
      ) : (
        <div className="space-y-1">
          {visible.map((item) => {
            const mode = item.mode ?? (item.functionName ? "function" : "expression")
            if (mode === "function") {
              const args = (item.functionArgs ?? []).filter(Boolean).join(", ")
              return (
                <div key={item.id} className="font-mono text-xs leading-snug">
                  {item.targetVar || "variável"}.{item.functionName || "?"}({args})
                </div>
              )
            }
            return (
              <div key={item.id} className="font-mono text-xs leading-snug">
                {item.targetVar || "variável"} = {item.valueExpr || "?"}
              </div>
            )
          })}
          {extra > 0 && <div className="text-muted-foreground">+{extra} mais</div>}
        </div>
      )}
    </LogicNode>
  )
})
OperationNode.displayName = "OperationNode"

export const InputNode = memo(({ data, selected }: NodeProps<NodeData>) => (
  <LogicNode
    accent="sky"
    icon={<MessageCircleQuestion className="h-4 w-4" />}
    title={data.label || "Perguntar"}
    subtitle={`Guarda em ${data.variableName || "variável"}`}
    selected={selected}
    running={data.running}
  >
    {data.prompt || "Digite um valor"}
  </LogicNode>
))
InputNode.displayName = "InputNode"

export const PrintNode = memo(({ data, selected }: NodeProps<NodeData>) => (
  <LogicNode
    accent="teal"
    icon={<Speech className="h-4 w-4" />}
    title={data.label || "Mostrar"}
    subtitle="Escreve na saída"
    selected={selected}
    running={data.running}
  >
    {data.template || "mensagem"}
  </LogicNode>
))
PrintNode.displayName = "PrintNode"

export const FunctionNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const fn = findFunction(data.functionName)
  const args = (data.functionArgs ?? []).filter(Boolean).join(", ")

  return (
    <LogicNode
      accent="indigo"
      icon={<FunctionSquare className="h-4 w-4" />}
      title={data.label || "Função"}
      subtitle={fn ? `${FUNCTION_CATEGORY_LABEL[categoryOf(fn)]} · ${fn.label}` : "Escolha uma função"}
      selected={selected}
      running={data.running}
    >
      {data.targetVar || "resultado"} = {data.functionName || "?"}({args})
    </LogicNode>
  )
})
FunctionNode.displayName = "FunctionNode"

export const ConditionNode = memo(({ data, selected }: NodeProps<NodeData>) => (
  <LogicNode
    accent="amber"
    icon={<GitBranch className="h-4 w-4" />}
    title={data.label || "Se / Senão"}
    subtitle="Escolhe um caminho"
    selected={selected}
    running={data.running}
    sources={[
      { id: "true", position: "right", colorClass: "!bg-emerald-500 !border-emerald-200", style: { top: "32%" } },
      { id: "false", position: "right", colorClass: "!bg-rose-500 !border-rose-200", style: { top: "72%" } },
    ]}
  >
    <div>{formatConditionsDisplay(getConditionRules(data))}</div>
    <div className="mt-1 flex flex-col items-end gap-0.5 font-semibold">
      <span className="text-emerald-600 dark:text-emerald-400">{data.trueLabel || "sim"}</span>
      <span className="text-rose-600 dark:text-rose-400">{data.falseLabel || "não"}</span>
    </div>
  </LogicNode>
))
ConditionNode.displayName = "ConditionNode"

export const SwitchNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const cases = data.switchCases ?? []
  const total = cases.length + 1
  const sources = [
    ...cases.map((item, index) => ({
      id: item.id,
      position: "right" as const,
      colorClass: "!bg-amber-500 !border-amber-200",
      style: { top: `${((index + 1) / (total + 1)) * 100}%` },
    })),
    {
      id: "default",
      position: "right" as const,
      colorClass: "!bg-slate-500 !border-slate-200",
      style: { top: `${((cases.length + 1) / (total + 1)) * 100}%` },
    },
  ]

  return (
    <LogicNode
      accent="amber"
      icon={<Signpost className="h-4 w-4" />}
      title={data.label || "Switch"}
      subtitle="Escolhe por valor"
      selected={selected}
      running={data.running}
      sources={sources}
    >
      <div className="font-mono text-xs">{data.switchExpr || "variável"}</div>
      <div className="mt-2 space-y-0.5 text-right text-[11px] font-semibold">
        {cases.map((item) => (
          <div key={item.id} className="text-amber-700 dark:text-amber-300">
            {item.label || item.matchExpr}
          </div>
        ))}
        <div className="text-slate-600 dark:text-slate-300">{data.defaultLabel || "padrão"}</div>
      </div>
    </LogicNode>
  )
})
SwitchNode.displayName = "SwitchNode"

const LOOP_SUBTITLE: Record<NonNullable<NodeData["loopType"]>, string> = {
  para: "Para (for)",
  enquanto: "Enquanto (while)",
  paraCada: "Para cada (for each)",
}

export const LoopNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const loopType = data.loopType ?? "para"
  const subtitle =
    loopType === "enquanto"
      ? formatConditionsDisplay(getConditionRules(data))
      : loopType === "paraCada"
        ? `cada ${data.itemVar || "item"} em ${data.listName || "?"}`
        : `${data.counterVar || "i"} de ${data.fromExpr || "1"} até ${data.toExpr || "5"}`

  return (
    <LogicNode
      accent="orange"
      icon={<Repeat className="h-4 w-4" />}
      title={data.label || "Repetir"}
      subtitle={LOOP_SUBTITLE[loopType]}
      selected={selected}
      running={data.running}
      sources={[
        { id: "body", position: "right", colorClass: "!bg-orange-500 !border-orange-200", style: { top: "32%" } },
        { id: "done", position: "right", colorClass: "!bg-slate-500 !border-slate-200", style: { top: "72%" } },
      ]}
    >
      <div>{subtitle}</div>
      <div className="mt-1 flex flex-col items-end gap-0.5 font-semibold">
        <span>corpo</span>
        <span>depois</span>
      </div>
    </LogicNode>
  )
})
LoopNode.displayName = "LoopNode"

const LIST_OP_LABEL = {
  criar: "Criar",
  adicionar: "Adicionar",
  obter: "Obter item",
  tamanho: "Tamanho",
}

export const ListNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const op = data.listOp ?? "criar"
  const detail =
    op === "criar"
      ? `${data.listName || "lista"} = [${data.itemsExpr || ""}]`
      : op === "adicionar"
        ? `${data.listName}.adicionar(${data.valueExpr})`
        : op === "obter"
          ? `${data.targetVar} = ${data.listName}[${data.indexExpr}]`
          : `${data.targetVar} = tamanho(${data.listName})`

  return (
    <LogicNode
      accent="pink"
      icon={<List className="h-4 w-4" />}
      title={data.label || "Lista"}
      subtitle={LIST_OP_LABEL[op]}
      selected={selected}
      running={data.running}
      sources={[{ position: "right", colorClass: "!bg-pink-500 !border-pink-200" }]}
    >
      {detail}
    </LogicNode>
  )
})
ListNode.displayName = "ListNode"
