"use client"

import { useEffect, useRef, useState } from "react"
import { Box, Radio, Terminal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RuntimeSnapshot } from "@/lib/types"
import { DATA_TYPE_LABEL, formatValue } from "@/lib/values"
import { cn } from "@/lib/utils"

interface RuntimePanelProps {
  snapshot: RuntimeSnapshot
  onSubmitInput: (value: string) => void
}

export default function RuntimePanel({ snapshot, onSubmitInput }: RuntimePanelProps) {
  const [answer, setAnswer] = useState("")
  const outputEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    outputEnd.current?.scrollIntoView({ behavior: "smooth" })
  }, [snapshot.logs.length])

  useEffect(() => {
    if (snapshot.status === "waiting-input") setAnswer("")
  }, [snapshot.status])

  const entries = Object.entries(snapshot.memory)

  return (
    <div className="flex h-full flex-col border-t border-border glass-panel">
      <Tabs defaultValue="saida" className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <TabsList>
            <TabsTrigger value="saida" className="gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              Transmissão
            </TabsTrigger>
            <TabsTrigger value="memoria" className="gap-1.5">
              <Box className="h-3.5 w-3.5" />
              Carga
              {entries.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {entries.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <StatusBadge status={snapshot.status} />
        </div>

        <TabsContent value="saida" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-3 font-mono text-sm">
              {snapshot.logs.length === 0 && (
                <p className="font-sans text-sm text-muted-foreground">
                  <Radio className="mb-1 inline h-4 w-4 text-primary" /> Aperte Play para ouvir a nave pensando...
                </p>
              )}
              {snapshot.logs.map((line) => (
                <p
                  key={line.id}
                  className={cn(
                    "animate-fade-up rounded-md px-2 py-1",
                    line.kind === "output" &&
                      "border-2 border-emerald-300/60 bg-emerald-50 font-sans text-base font-semibold text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100",
                    line.kind === "info" && "text-muted-foreground",
                    line.kind === "system" && "font-display text-[11px] uppercase tracking-wider text-primary",
                    line.kind === "error" && "border-2 border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
                  )}
                >
                  {line.kind === "output" ? line.message : `› ${line.message}`}
                </p>
              ))}
              <div ref={outputEnd} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="memoria" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {entries.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">
                  Baú vazio. Quando o programa guardar um valor, ele aparece aqui.
                </p>
              )}
              {entries.map(([name, value]) => (
                <div
                  key={name}
                  className="game-tile rounded-xl border-2 border-violet-300/60 bg-violet-50/80 p-3 transition hover:border-violet-400 dark:border-violet-500/30 dark:bg-violet-500/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-violet-800 dark:text-violet-200">{name}</span>
                    <Badge variant="outline" className="border-violet-300 text-violet-700 dark:border-violet-500/30 dark:text-violet-200">
                      {DATA_TYPE_LABEL[value.type]}
                    </Badge>
                  </div>
                  <p className="mt-2 break-all font-mono text-sm text-foreground">{formatValue(value)}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {snapshot.inputPrompt && (
        <form
          className="flex items-center gap-2 border-t-2 border-primary/30 bg-primary/10 p-3"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmitInput(answer)
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] uppercase tracking-widest text-primary">A nave está perguntando</p>
            <p className="truncate text-sm text-foreground">{snapshot.inputPrompt.message}</p>
          </div>
          <Input
            autoFocus
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={`Resposta (${DATA_TYPE_LABEL[snapshot.inputPrompt.dataType].toLowerCase()})`}
            className="max-w-xs bg-background"
          />
          <Button type="submit">Enviar</Button>
        </form>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: RuntimeSnapshot["status"] }) {
  const map = {
    idle: { label: "Pronto", className: "border-border bg-muted text-muted-foreground" },
    running: { label: "Em jogo", className: "border-primary/50 bg-primary/15 text-primary animate-pulse" },
    paused: { label: "Pausado", className: "border-amber-400/50 bg-amber-500/15 text-amber-800 dark:text-amber-200" },
    "waiting-input": { label: "Sua vez", className: "border-sky-400/50 bg-sky-500/15 text-sky-800 dark:text-sky-200" },
    done: { label: "Vitória", className: "border-emerald-400/50 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200" },
    error: { label: "Game over", className: "border-rose-400/50 bg-rose-500/15 text-rose-700 dark:text-rose-200" },
  } as const

  const item = map[status]
  return <Badge className={cn("border font-display text-[10px] uppercase tracking-wider hover:bg-transparent", item.className)}>{item.label}</Badge>
}
