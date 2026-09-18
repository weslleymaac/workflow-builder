"use client"

import { useEffect, useRef, useState } from "react"
import { Box, Terminal } from "lucide-react"
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
    if (snapshot.inputPrompt) setAnswer("")
  }, [
    snapshot.inputPrompt?.nodeId,
    snapshot.inputPrompt?.variableName,
    snapshot.inputPrompt?.message,
    snapshot.inputPrompt?.dataType,
  ])

  const entries = Object.entries(snapshot.memory)

  return (
    <div className="flex h-full flex-col border-t border-border glass-panel">
      <Tabs defaultValue="saida" className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <TabsList>
            <TabsTrigger value="saida" className="gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              Saída
            </TabsTrigger>
            <TabsTrigger value="memoria" className="gap-1.5">
              <Box className="h-3.5 w-3.5" />
              Memória
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
            <div className="space-y-2 p-4 font-mono text-sm leading-relaxed">
              {snapshot.logs.length === 0 && (
                <p className="font-sans text-sm text-muted-foreground">
                  Aperte Executar para ver a saída do fluxo.
                </p>
              )}
              {snapshot.logs.map((line) => (
                <p
                  key={line.id}
                  className={cn(
                    "animate-fade-up rounded-md px-2 py-1",
                    line.kind === "output" &&
                      "border border-emerald-300/60 bg-emerald-50 font-sans text-base font-semibold text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100",
                    line.kind === "info" && "text-muted-foreground",
                    line.kind === "system" && "text-xs font-medium uppercase tracking-wide text-muted-foreground",
                    line.kind === "error" && "border border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
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
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">
                  Nenhuma variável ainda. Quando o programa guardar um valor, ele aparece aqui.
                </p>
              )}
              {entries.map(([name, value]) => (
                <div
                  key={name}
                  className="rounded-2xl border border-border bg-muted/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">{name}</span>
                    <Badge variant="outline">
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
          className="flex items-center gap-2 border-t border-border bg-muted/40 p-3"
          onSubmit={(event) => {
            event.preventDefault()
            const value = answer
            setAnswer("")
            onSubmitInput(value)
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Entrada necessária
            </p>
            <p className="truncate text-sm text-foreground">{snapshot.inputPrompt.message}</p>
          </div>
          <Input
            key={`${snapshot.inputPrompt.nodeId}-${snapshot.inputPrompt.variableName}-${snapshot.inputPrompt.message}`}
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
    running: { label: "Executando", className: "border-primary/30 bg-primary/10 text-primary" },
    paused: { label: "Pausado", className: "border-amber-400/50 bg-amber-500/15 text-amber-800 dark:text-amber-200" },
    "waiting-input": { label: "Aguardando", className: "border-sky-400/50 bg-sky-500/15 text-sky-800 dark:text-sky-200" },
    done: { label: "Concluído", className: "border-emerald-400/50 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200" },
    error: { label: "Erro", className: "border-rose-400/50 bg-rose-500/15 text-rose-700 dark:text-rose-200" },
  } as const

  const item = map[status]
  return <Badge className={cn("border text-xs font-medium hover:bg-transparent", item.className)}>{item.label}</Badge>
}
