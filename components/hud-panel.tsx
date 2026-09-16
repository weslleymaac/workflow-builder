import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface HudPanelProps extends HTMLAttributes<HTMLDivElement> {
  corners?: boolean
}

export function HudPanel({ className, children, corners = true, ...props }: HudPanelProps) {
  return (
    <div className={cn("hud-panel", className)} {...props}>
      {corners && (
        <>
          <span className="hud-corner hud-corner-tl" aria-hidden />
          <span className="hud-corner hud-corner-tr" aria-hidden />
          <span className="hud-corner hud-corner-bl" aria-hidden />
          <span className="hud-corner hud-corner-br" aria-hidden />
        </>
      )}
      {children}
    </div>
  )
}
