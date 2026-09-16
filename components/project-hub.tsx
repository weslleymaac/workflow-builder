"use client"

import { useState } from "react"
import { BookOpen, Clock, FolderOpen, Plus, Rocket, Sparkles, Trash2 } from "lucide-react"
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
import { HudPanel } from "./hud-panel"
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
      <div className="pointer-events-none absolute inset-0 hex-grid" aria-hidden />
      <div className="pointer-events-none absolute inset-0 scanlines" aria-hidden />

      <header className="relative z-10 flex items-center justify-between border-b border-border glass-panel px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 animate-float items-center justify-center rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-amber-300 via-violet-500 to-cyan-400 text-xl shadow-[0_0_28px_hsl(var(--primary)/0.45)]">
            🧑‍🚀
          </div>
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.32em] text-primary">Arcade espacial</p>
            <h1 className="font-display text-lg text-foreground sm:text-xl">Logic Flow</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Hangar · escolha uma missão e decole</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 font-display text-[11px] uppercase tracking-wider" onClick={() => setManualOpen(true)}>
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Como jogar</span>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <AlgorithmManual open={manualOpen} onOpenChange={setManualOpen} />

      <main className="relative z-10 flex min-h-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-stretch lg:gap-8 lg:px-8">
        <HudPanel className="flex min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 lg:max-w-[440px] lg:shrink-0">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.28em] text-primary">Tela inicial</p>
            <h2 className="font-display mt-2 text-3xl text-foreground">Monte fluxos. Complete missões.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Arraste blocos, ligue o caminho da nave e aperte Play. Cada quest ensina um pedaço da lógica — como um jogo de fases.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                { emoji: "🧱", label: "Blocos" },
                { emoji: "🎯", label: "Quests" },
                { emoji: "🏆", label: "XP" },
              ].map((item) => (
                <div key={item.label} className="game-tile rounded-xl border-2 border-border bg-background/60 px-2 py-3">
                  <div className="text-2xl">{item.emoji}</div>
                  <p className="mt-1 font-display text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <Button className="mt-6 h-11 w-full gap-2 font-display text-xs uppercase tracking-wider" onClick={() => setManualOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Abrir tutorial
          </Button>
        </HudPanel>

        <div className="flex min-h-0 flex-1 flex-col lg:min-w-0">
          <div className="animate-fade-up text-center lg:text-left">
            <p className="flex items-center justify-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] text-primary lg:justify-start">
              <Rocket className="h-4 w-4" />
              Seleção de missão
            </p>
            <h2 className="font-display mt-2 text-2xl text-foreground sm:text-3xl">Player, escolha sua rota</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Continue um save ou comece uma nova aventura de lógica.
            </p>
          </div>

          <div className="mt-6">
            <Button className="h-12 w-full gap-2 font-display text-sm uppercase tracking-wider" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova missão
            </Button>
          </div>

          <ScrollArea className="mt-6 min-h-0 flex-1">
            <div className="space-y-3 pb-4">
              {sorted.length === 0 && (
                <HudPanel className="rounded-2xl border-dashed p-8 text-center text-sm text-muted-foreground">
                  Nenhum save ainda. Crie a primeira missão acima!
                </HudPanel>
              )}
              {sorted.map((program, index) => {
                const isLast = program.id === currentProgramId
                return (
                  <HudPanel
                    key={program.id}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5",
                      isLast && "glow-border",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onOpen(program.id)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-primary/30 bg-secondary text-lg">
                        {["🚀", "🪐", "🛸", "⭐", "🛰️"][index % 5]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm text-foreground">{program.name}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          Save de {formatProgramDate(program.createdAt)}
                        </p>
                        {isLast && (
                          <span className="mt-1 inline-flex items-center gap-1 font-display text-[10px] uppercase tracking-widest text-primary">
                            <FolderOpen className="h-3 w-3" />
                            Último save
                          </span>
                        )}
                      </div>
                    </button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground opacity-0 shadow-none transition group-hover:opacity-100 hover:text-destructive disabled:opacity-30"
                      disabled={programs.length <= 1}
                      title={programs.length <= 1 ? "Precisa de ao menos um projeto" : "Excluir projeto"}
                      onClick={() => setDeleteId(program.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </HudPanel>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova missão espacial</DialogTitle>
            <DialogDescription>Dê um nome ao save. Você poderá renomear depois no hangar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome da missão</Label>
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
            <Button onClick={submitCreate}>Decolar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar este save?</AlertDialogTitle>
            <AlertDialogDescription>
              O fluxo e o progresso desta missão serão apagados para sempre. Não dá para desfazer.
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
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
