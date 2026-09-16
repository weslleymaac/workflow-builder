"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="h-8 w-[72px] rounded-full border border-border bg-muted/50" aria-hidden />
    )
  }

  const active = theme === "dark" ? "dark" : "light"

  return (
    <div
      className="flex items-center rounded-full border border-border bg-muted/50 p-0.5"
      role="group"
      aria-label="Tema da interface"
    >
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={cn(
          "h-7 rounded-full px-2.5",
          active === "light" && "bg-background text-foreground shadow-sm",
        )}
        aria-pressed={active === "light"}
        title="Modo claro"
        onClick={() => setTheme("light")}
      >
        <Sun className="h-3.5 w-3.5" />
        <span className="sr-only">Modo claro</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={cn(
          "h-7 rounded-full px-2.5",
          active === "dark" && "bg-background text-foreground shadow-sm",
        )}
        aria-pressed={active === "dark"}
        title="Modo escuro"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-3.5 w-3.5" />
        <span className="sr-only">Modo escuro</span>
      </Button>
    </div>
  )
}
