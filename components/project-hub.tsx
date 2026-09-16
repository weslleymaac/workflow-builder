"use client"

import { useState } from "react"
import { BookOpen, Clock, FolderOpen, LogOut, Plus, Trash2 } from "lucide-react"
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
import { useSay } from "./user-name"

interface ProjectHubProps {
  programs: SavedProgram[]
  currentProgramId?: string
  onOpen: (programId: string) => void
  onCreate: (name: string) => void
  onDelete: (programId: string) => void
  onSignOut: () => void
}

export default function ProjectHub({
  programs,
  currentProgramId,
  onOpen,
  onCreate,
  onDelete,
  onSignOut,
}: ProjectHubProps) {
  const t = useSay()
  const [createOpen, setCreateOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const pendingDelete = programs.find((program) => program.id === deleteId)

  const sorted = [...programs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  const submitCreate = () => {
    const name = newName.trim() || "Novo fluxo"
    onCreate(name)
    setNewName("")
    setCreateOpen(false)
  }

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden space-bg">
      <header className="relative z-10 flex items-center justify-between border-b border-border bg-card px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="font-display text-lg text-[#d4b483]">LF</span>
          </div>
          <div>
            <h1 className="font-display text-2xl text-foreground">Logic Flow</h1>
            <p className="text-sm text-muted-foreground">Estúdio de lógica de programação</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => setManualOpen(true)}>
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Manual</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setSignOutOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <AlgorithmManual open={manualOpen} onOpenChange={setManualOpen} />

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <div className="animate-fade-up">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Seus projetos</p>
          <h2 className="font-display mt-3 text-3xl text-foreground sm:text-4xl">
            {t("Olá, {name}")}
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Continue de onde parou. Abra um fluxo salvo ou comece um novo. O manual cobre os conceitos antes de você
            montar o canvas.
          </p>
        </div>

        <div className="mt-8">
          <Button className="h-11 w-full gap-2 sm:w-auto" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo fluxo
          </Button>
        </div>

        <ScrollArea className="mt-8 min-h-0 flex-1">
          <div className="space-y-2 pb-4">
            {sorted.length === 0 && (
              <HudPanel className="rounded-2xl border-dashed p-10 text-center text-sm text-muted-foreground">
                Nenhum projeto ainda. Crie o primeiro fluxo acima.
              </HudPanel>
            )}
            {sorted.map((program) => {
              const isLast = program.id === currentProgramId
              return (
                <HudPanel
                  key={program.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl p-4 transition-colors hover:bg-muted/40",
                    isLast && "ring-1 ring-primary/20",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onOpen(program.id)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-medium text-muted-foreground">
                      {program.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-foreground">{program.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        Atualizado em {formatProgramDate(program.createdAt)}
                      </p>
                      {isLast && (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <FolderOpen className="h-3 w-3" />
                          Último aberto
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
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo fluxo</DialogTitle>
            <DialogDescription>Dê um nome ao projeto. Você pode renomear depois no estúdio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do projeto</Label>
            <Input
              id="project-name"
              value={newName}
              placeholder="Ex: Condicionais"
              autoFocus
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitCreate}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar este projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `O fluxo “${pendingDelete.name}” e o progresso desta aula serão apagados. Essa ação não pode ser desfeita.`
                : "O fluxo e o progresso desta aula serão apagados. Essa ação não pode ser desfeita."}
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

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do estúdio?</AlertDialogTitle>
            <AlertDialogDescription>
              Você volta para a tela do primeiro nome. Os projetos continuam salvos neste navegador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onSignOut}>Sair</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
