"use client"

import type { CSSProperties, ReactNode } from "react"
import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"
import { NODE_ACCENTS, type NodeAccent } from "@/lib/node-catalog"

interface LogicNodeProps {
  accent: NodeAccent
  icon: ReactNode
  title: string
  subtitle?: string
  selected?: boolean
  running?: boolean
  children?: ReactNode
  target?: boolean
  sources?: Array<{ id?: string; position?: "left" | "right" | "top" | "bottom"; colorClass?: string; style?: CSSProperties }>
}

export function LogicNode({
  accent,
  icon,
  title,
  subtitle,
  selected,
  running,
  children,
  target = true,
  sources = [{ position: "right", colorClass: NODE_ACCENTS[accent].handle }],
}: LogicNodeProps) {
  const colors = NODE_ACCENTS[accent]

  const handlePosition = (side?: "left" | "right" | "top" | "bottom") => {
    if (side === "left") return Position.Left
    if (side === "top") return Position.Top
    if (side === "bottom") return Position.Bottom
    return Position.Right
  }

  return (
    <div
      className={cn(
        "logic-node-shell min-w-[180px] max-w-[240px] rounded-2xl border-2 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm transition-all dark:bg-slate-900/90",
        colors.border,
        selected && "shadow-xl",
        running && cn("running-node ring-2 ring-offset-0", colors.ring),
      )}
    >
      {target && (
        <Handle type="target" position={Position.Left} className={cn("h-3 w-3", colors.handle)} />
      )}

      <div className="flex items-center gap-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", colors.icon)}>{icon}</div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{title}</div>
          {subtitle && <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</div>}
        </div>
      </div>

      {children && <div className={cn("mt-2 rounded-lg px-2 py-1 text-[11px] leading-snug", colors.soft, colors.text)}>{children}</div>}

      {sources.map((source, index) => (
        <Handle
          key={`${source.id ?? "source"}-${index}`}
          type="source"
          id={source.id}
          position={handlePosition(source.position)}
          style={source.style}
          className={cn("h-3 w-3", source.colorClass ?? colors.handle)}
        />
      ))}
    </div>
  )
}
