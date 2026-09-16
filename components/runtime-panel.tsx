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
            <TabsTrigger value="saida" className="gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-cyan-500/20 dark:data-[state=active]:text-cyan-200">
              <Terminal className="h-3.5 w-3.5" />
              Transmissão
            </TabsTrigger>
            <TabsTrigger value="memoria" className="gap-1.5 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-500/20 dark:data-[state=active]:text-violet-200">
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
                  <Radio className="mb-1 inline h-4 w-4 text-indigo-500 dark:text-cyan-500/60" /> Aperte Play para ouvir a nave pensando...
                </p>
              )}
              {snapshot.logs.map((line) => (
                <p
                  key={line.id}
                  className={cn(
                    "animate-fade-up rounded-md px-2 py-1",
                    line.kind === "output" &&
                      "border border-teal-200 bg-teal-50 font-sans text-base font-semibold text-teal-900 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-100 dark:shadow-[0_0_12px_rgba(34,211,238,0.08)]",
                    line.kind === "info" && "text-muted-foreground",
                    line.kind === "system" && "text-indigo-600 dark:text-violet-300",
                    line.kind === "error" && "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
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
                  className="rounded-xl border border-violet-200 bg-violet-50/80 p-3 transition hover:border-violet-300 dark:border-violet-500/25 dark:bg-violet-500/10 dark:hover:border-violet-400/40 dark:hover:shadow-[0_0_16px_rgba(139,92,246,0.12)]"
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
          className="flex items-center gap-2 border-t border-sky-200 bg-sky-50 p-3 dark:border-sky-500/20 dark:bg-sky-500/10"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmitInput(answer)
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">📡 A nave está perguntando</p>
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
    running: { label: "Executando", className: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-200 animate-pulse" },
    paused: { label: "Pausado", className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200" },
    "waiting-input": { label: "Esperando você", className: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200" },
    done: { label: "Concluído", className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200" },
    error: { label: "Ops", className: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200" },
  } as const

  const item = map[status]
  return <Badge className={cn("border hover:bg-transparent", item.className)}>{item.label}</Badge>
}
