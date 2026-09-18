"use client"

import type React from "react"
import {
  Boxes,
  Cog,
  Flag,
  FunctionSquare,
  GitBranch,
  Layers,
  Lightbulb,
  List,
  MessageCircleQuestion,
  Play,
  Repeat,
  RotateCw,
  Shuffle,
  Signpost,
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
  operation: Cog,
  input: MessageCircleQuestion,
  print: Speech,
  condition: GitBranch,
  switch: Signpost,
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
      <div className="space-y-6 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Biblioteca
          </p>
          <h2 className="font-display mt-1.5 text-xl text-foreground">Blocos de lógica</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Toque ou arraste para o canvas. O fluxo vai da esquerda para a direita.
          </p>
        </div>

        {CATALOG_GROUPS.map((group) => {
          const GroupIcon = GROUP_ICONS[group.id]

          return (
            <div key={group.id} className="space-y-2.5">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <GroupIcon className="h-4 w-4" />
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
                      "group flex w-full items-start gap-3 rounded-2xl border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/50",
                      colors.border,
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        colors.icon,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <span className="block text-[15px] font-medium text-foreground">{item.label}</span>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.tip}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}

        <Badge
          variant="secondary"
          className="w-full justify-center gap-2 border-border bg-secondary/70 px-3 py-2 text-center text-sm font-normal leading-relaxed text-secondary-foreground"
        >
          <Lightbulb className="h-3.5 w-3.5 shrink-0" />
          Clique no bloco do canvas para configurar
        </Badge>
      </div>
    </ScrollArea>
  )
}
