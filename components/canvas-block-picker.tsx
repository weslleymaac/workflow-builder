"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
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

const MENU_WIDTH = 288
const MENU_MAX_HEIGHT = 360

interface CanvasBlockPickerProps {
  open: boolean
  x: number
  y: number
  excludeTypes?: string[]
  onClose: () => void
  onPick: (nodeType: string) => void
}

export default function CanvasBlockPicker({
  open,
  x,
  y,
  excludeTypes = [],
  onClose,
  onPick,
}: CanvasBlockPickerProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ left: x, top: y })

  useLayoutEffect(() => {
    if (!open) return
    const padding = 8
    const width = menuRef.current?.offsetWidth ?? MENU_WIDTH
    const height = menuRef.current?.offsetHeight ?? MENU_MAX_HEIGHT
    const left = Math.min(x, window.innerWidth - width - padding)
    const top = Math.min(y, window.innerHeight - height - padding)
    setPosition({
      left: Math.max(padding, left),
      top: Math.max(padding, top),
    })
  }, [open, x, y])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        aria-hidden
        onClick={onClose}
        onContextMenu={(event) => {
          event.preventDefault()
          onClose()
        }}
      />
      <div
        ref={menuRef}
        role="dialog"
        aria-label="Adicionar bloco"
        className="fixed z-[70] w-72 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl"
        style={{ left: position.left, top: position.top }}
      >
        <Command className="max-h-[min(360px,70vh)]">
          <CommandInput placeholder="Buscar bloco..." autoFocus />
          <CommandList className="max-h-[min(300px,60vh)]">
            <CommandEmpty>Nenhum bloco encontrado.</CommandEmpty>
            {CATALOG_GROUPS.map((group) => {
              const items = NODE_CATALOG.filter(
                (item) => item.group === group.id && !excludeTypes.includes(item.type),
              )
              if (items.length === 0) return null

              return (
                <CommandGroup key={group.id} heading={group.title}>
                  {items.map((item) => {
                    const Icon = ICONS[item.type]
                    const colors = NODE_ACCENTS[item.accent]
                    return (
                      <CommandItem
                        key={item.type}
                        value={`${item.label} ${item.tip} ${item.type} ${group.title}`}
                        onSelect={() => onPick(item.type)}
                        className="gap-2.5"
                      >
                        <div
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                            colors.icon,
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </div>
    </>
  )
}
