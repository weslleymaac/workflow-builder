"use client"

import { useState } from "react"
import {
  BookOpen,
  Clock,
  FolderOpen,
  Plus,
  Rocket,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatProgramDate } from "@/lib/storage"
import type { SavedProgram } from "@/lib/types"
import { cn } from "@/lib/utils"
import AlgorithmManual from "./algorithm-manual"
import { ThemeToggle } from "./theme-toggle"

interface ProjectHubProps {
  programs: SavedProgram[]
  currentProgramId?: string
  onOpen: (programId: string) => void
  onCreate: (name: string) => void
  onDelete: (programId: string) => void
}

export default function ProjectHub({
  programs,
  currentProgramId,
  onOpen,
  onCreate,
  onDelete,
}: ProjectHubProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sorted = [...programs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  const submitCreate = () => {
    const name = newName.trim() || "Nova missão"
    onCreate(name)
    setNewName("")
    setCreateOpen(false)
  }

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden space-bg">
      <div className="pointer-events-none absolute inset-0 space-stars" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-cyan-500/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
        aria-hidden
      />

      <header className="relative z-10 flex items-center justify-between border-b border-border/60 glass-panel px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 text-xl shadow-[0_0_24px_rgba(34,211,238,0.35)]">
            🧑‍🚀
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-lg font-bold text-transparent dark:from-cyan-200 dark:to-violet-200 sm:text-xl">
              Logic Flow
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Estação Orbital · Laboratório de lógica</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20 sm:flex"
            onClick={() => setManualOpen(true)}
          >
            <BookOpen className="h-4 w-4" />
            Manual
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
            {/* Hero */}
            <section className="animate-fade-up text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
                Hangar de projetos
              </div>
              <h2 className="mt-5 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                Escolha sua missão
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
                Monte algoritmos visuais, execute em tempo real e salve suas aventuras espaciais.
              </p>
            </section>

            {/* CTAs */}
            <section className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="group relative overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-left shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-cyan-500/20 dark:from-cyan-600 dark:to-violet-600"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/20" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white">Criar novo projeto</h3>
                  <p className="mt-1 text-sm text-white/70">Decole com uma nova missão de lógica</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setManualOpen(true)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 text-left shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-indigo-300 hover:shadow-xl dark:bg-slate-900/60 dark:hover:border-cyan-500/40"
              >
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
                    <BookOpen className="h-6 w-6 text-violet-600 dark:text-violet-300" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-foreground">Manual de algoritmos</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Apresentação interativa estilo PowerPoint — 8 slides
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-cyan-400">
                    <Zap className="h-3 w-3" />
                    Abrir apresentação
                  </span>
                </div>
              </button>
            </section>

            {/* Stats rápidos */}
            <section className="mt-8 flex flex-wrap justify-center gap-4">
              {[
                { label: "Projetos salvos", value: programs.length },
                { label: "Slides no manual", value: 8 },
                { label: "Blocos disponíveis", value: "12+" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/60 bg-card/50 px-5 py-3 text-center backdrop-blur-sm"
                >
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </section>

            {/* Lista de projetos */}
            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <Rocket className="h-4 w-4 text-indigo-500 dark:text-cyan-400" />
                  Suas missões
                </h3>
                {sorted.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {sorted.length} {sorted.length === 1 ? "projeto" : "projetos"}
                  </span>
                )}
              </div>

              {sorted.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-3xl">
                    🛸
                  </div>
                  <p className="mt-4 font-semibold text-foreground">Nenhum projeto ainda</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Crie sua primeira missão ou leia o manual para começar.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button onClick={() => setCreateOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar projeto
                    </Button>
                    <Button variant="outline" onClick={() => setManualOpen(true)} className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Ver manual
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {sorted.map((program, i) => {
                    const isLast = program.id === currentProgramId
                    return (
                      <div
                        key={program.id}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border bg-card/80 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/60",
                          isLast
                            ? "border-indigo-300 shadow-md dark:border-cyan-500/40 glow-border"
                            : "border-border hover:border-indigo-200 dark:hover:border-cyan-500/20",
                        )}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        {isLast && (
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-cyan-400 dark:to-violet-400" />
                        )}
                        <div className="flex items-center gap-3 p-4">
                          <button
                            type="button"
                            onClick={() => onOpen(program.id)}
                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                          >
                            <div
                              className={cn(
                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                isLast
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-cyan-500/20 dark:text-cyan-300"
                                  : "bg-muted/80 text-muted-foreground group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:group-hover:bg-cyan-500/15 dark:group-hover:text-cyan-300",
                              )}
                            >
                              <FolderOpen className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-foreground">{program.name}</p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 shrink-0" />
                                {formatProgramDate(program.createdAt)}
                              </p>
                              {isLast && (
                                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:bg-cyan-500/15 dark:text-cyan-400">
                                  <Zap className="h-2.5 w-2.5" />
                                  Último aberto
                                </span>
                              )}
                            </div>
                          </button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive disabled:opacity-30"
                            disabled={programs.length <= 1}
                            title={programs.length <= 1 ? "Precisa de ao menos um projeto" : "Excluir projeto"}
                            onClick={() => setDeleteId(program.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </main>

      <AlgorithmManual open={manualOpen} onOpenChange={setManualOpen} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova missão espacial</DialogTitle>
            <DialogDescription>Dê um nome ao seu projeto. Você poderá renomear depois no hangar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do projeto</Label>
            <Input
              id="project-name"
              value={newName}
              placeholder="Ex: Minha primeira órbita"
              autoFocus
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitCreate}>Criar e abrir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              O fluxo e o progresso deste projeto serão apagados para sempre. Não dá para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) onDelete(deleteId)
                setDeleteId(null)
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
