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

  const edgeStyle = (side?: "left" | "right" | "top" | "bottom", extra?: CSSProperties): CSSProperties => {
    if (side === "left") {
      return { top: "50%", left: -6, right: "auto", transform: "translateY(-50%)", ...extra }
    }
    if (side === "top") {
      return { top: -6, left: "50%", bottom: "auto", transform: "translateX(-50%)", ...extra }
    }
    if (side === "bottom") {
      return { bottom: -6, left: "50%", top: "auto", transform: "translateX(-50%)", ...extra }
    }
    // right (default)
    return { top: "50%", right: -6, left: "auto", transform: "translateY(-50%)", ...extra }
  }

  return (
    <div
      className={cn(
        "logic-node-shell relative min-w-[210px] max-w-[300px] rounded-2xl border bg-card px-3.5 py-3 transition-shadow",
        colors.border,
        selected && "shadow-xl",
        running && cn("running-node ring-2 ring-offset-0", colors.ring),
      )}
    >
      {target && (
        <Handle
          type="target"
          position={Position.Left}
          style={edgeStyle("left")}
          className={cn("!h-3.5 !w-3.5 cursor-crosshair", colors.handle)}
        />
      )}

      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", colors.icon)}>{icon}</div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="truncate text-[15px] font-medium text-foreground">{title}</div>
          {subtitle && <div className="truncate text-sm leading-relaxed text-muted-foreground">{subtitle}</div>}
        </div>
      </div>

      {children && (
        <div
          className={cn(
            "mt-3 min-w-0 overflow-hidden rounded-xl px-2.5 py-1.5 text-sm leading-snug",
            colors.soft,
            colors.text,
          )}
        >
          <div className="break-words [overflow-wrap:anywhere]">{children}</div>
        </div>
      )}

      {sources.map((source, index) => {
        const side = source.position ?? "right"
        return (
          <Handle
            key={`${source.id ?? "source"}-${index}`}
            type="source"
            id={source.id}
            position={handlePosition(side)}
            style={edgeStyle(side, source.style)}
            className={cn("!h-3.5 !w-3.5 cursor-crosshair", source.colorClass ?? colors.handle)}
          />
        )
      })}
    </div>
  )
}
