"use client"

import type React from "react"
import {
  Boxes,
  Flag,
  FunctionSquare,
  GitBranch,
  Layers,
  Lightbulb,
  List,
  MessageCircleQuestion,
  Play,
  Repeat,
  Rocket,
  RotateCw,
  Shuffle,
  Speech,
  Variable,
  Workflow,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CATALOG_GROUPS, NODE_ACCENTS, NODE_CATALOG } from "@/lib/node-catalog"
import { cn } from "@/lib/utils"

const ICONS = {
  start: Play,
  end: Flag,
  variable: Variable,
  input: MessageCircleQuestion,
  print: Speech,
  condition: GitBranch,
  loop: Repeat,
  list: List,
  function: FunctionSquare,
}

const GROUP_ICONS = {
  fluxo: Workflow,
  dados: Boxes,
  funcoes: FunctionSquare,
  decisao: Shuffle,
  repeticao: RotateCw,
  colecao: Layers,
}

export default function NodeLibrary({ onPick }: { onPick: (nodeType: string) => void }) {
  const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-cyan-400">
            <Rocket className="h-3.5 w-3.5" />
            Arsenal espacial
          </p>
          <h2 className="text-sm font-bold text-foreground">Blocos de lógica</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Toque ou arraste para o canvas. O fluxo vai da esquerda para a direita.
          </p>
        </div>

        {CATALOG_GROUPS.map((group) => {
          const GroupIcon = GROUP_ICONS[group.id]

          return (
            <div key={group.id} className="space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <GroupIcon className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                {group.title}
              </p>
              {NODE_CATALOG.filter((item) => item.group === group.id).map((item) => {
                const Icon = ICONS[item.type]
                const colors = NODE_ACCENTS[item.accent]

                return (
                  <button
                    key={item.type}
                    type="button"
                    draggable
                    onDragStart={(event) => onDragStart(event, item.type)}
                    onClick={() => onPick(item.type)}
                    className={cn(
                      "group flex w-full items-start gap-2 rounded-xl border bg-card px-2.5 py-2 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md dark:bg-slate-900/60 dark:hover:bg-slate-800/80 dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]",
                      colors.border,
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                        colors.icon,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                      <p className="text-[11px] leading-snug text-muted-foreground">{item.tip}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}

        <Badge
          variant="secondary"
          className="w-full justify-center gap-1.5 border border-indigo-200 bg-indigo-50 text-center font-normal text-indigo-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200/80"
        >
          <Lightbulb className="h-3.5 w-3.5 shrink-0" />
          Clique no bloco do canvas para configurar
        </Badge>
      </div>
    </ScrollArea>
  )
}
