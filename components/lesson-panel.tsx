"use client"

import { useState } from "react"
import { CheckCircle2, ChevronDown, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EXAMPLE_CATEGORIES, LEVEL_LABEL, LEVEL_STYLE } from "@/lib/example-catalog"
import { EXAMPLE_PROGRAMS } from "@/lib/examples"
import { isLessonComplete, LESSONS, lessonProgress } from "@/lib/lessons"
import type { RuntimeSnapshot, WorkflowNode } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useSay } from "./user-name"

interface LessonPanelProps {
  lessonId?: string
  completedLessons: string[]
  nodes: WorkflowNode[]
  snapshot: RuntimeSnapshot
  onSelectLesson: (lessonId: string) => void
  onLoadExample: (exampleId: string) => void
}

export default function LessonPanel({
  lessonId,
  completedLessons,
  nodes,
  snapshot,
  onSelectLesson,
  onLoadExample,
}: LessonPanelProps) {
  const t = useSay()
  const [openCategory, setOpenCategory] = useState<string | null>(EXAMPLE_CATEGORIES[0]?.id ?? null)
  const lesson = LESSONS.find((item) => item.id === lessonId) ?? LESSONS[0]
  const checks = lessonProgress(lesson, nodes, snapshot)
  const complete = completedLessons.includes(lesson.id) || isLessonComplete(lesson, nodes, snapshot)
  const progress = Math.min(100, Math.round((checks.filter((check) => check.done).length / checks.length) * 100))

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Trilha
        </p>
        <h2 className="font-display mt-1.5 text-xl text-foreground">Escolha a aula</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-3 gap-2.5">
            {LESSONS.map((item) => {
              const done = completedLessons.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectLesson(item.id)}
                  className={cn(
                    "flex min-w-0 flex-col items-center rounded-2xl border px-2 py-3 text-center text-sm transition-colors",
                    item.id === lesson.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted",
                  )}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="mt-1.5 w-full break-words font-semibold leading-snug">{item.title}</span>
                  {done && (
                    <CheckCircle2
                      className={cn(
                        "mt-1 h-3.5 w-3.5",
                        item.id === lesson.id ? "text-primary-foreground" : "text-emerald-500",
                      )}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <Card className="border-border bg-card">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-xl leading-snug text-foreground">
                    {lesson.emoji} {lesson.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(lesson.concept)}</p>
                </div>
                {complete && (
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-200">
                    Concluída
                  </Badge>
                )}
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-3.5 text-sm">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Objetivo</p>
                <p className="mt-2 leading-relaxed text-muted-foreground">{t(lesson.goal)}</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm leading-relaxed text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                <span className="font-semibold">Dica: </span>
                {t(lesson.hint)}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Progresso da aula</span>
                  <span>
                    {checks.filter((check) => check.done).length}/{checks.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {checks.map((check) => (
                    <li key={check.label} className="flex items-start gap-2 leading-snug">
                      <CheckCircle2 className={cn("h-3.5 w-3.5", check.done ? "text-emerald-500 dark:text-emerald-400" : "text-muted-foreground/50")} />
                      {check.label}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="w-full"
                onClick={() => onLoadExample(lesson.exampleId)}
              >
                <Sparkles className="h-4 w-4" />
                Carregar exemplo da aula
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Exemplos
            </p>
            {EXAMPLE_CATEGORIES.map((category) => {
              const isOpen = openCategory === category.id
              return (
                <div
                  key={category.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <button
                    type="button"
                    onClick={() => setOpenCategory(isOpen ? null : category.id)}
                    className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition hover:bg-muted dark:hover:bg-slate-800/50"
                  >
                    <span className="text-lg">{category.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm text-foreground">{category.title}</p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{category.tagline}</p>
                    </div>
                    <ChevronDown
                      className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", isOpen && "rotate-180")}
                    />
                  </button>
                  {isOpen && (
                    <div className="animate-fade-up space-y-1.5 border-t border-border p-2.5 dark:border-slate-700/50">
                      {category.examples.map((meta) => {
                        const example = EXAMPLE_PROGRAMS[meta.id]
                        if (!example) return null
                        return (
                          <button
                            key={meta.id}
                            type="button"
                            onClick={() => onLoadExample(meta.id)}
                            className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2.5 text-left transition hover:bg-primary/10"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{example.name}</p>
                              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{example.description}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn("shrink-0 text-xs", LEVEL_STYLE[meta.level])}
                            >
                              {LEVEL_LABEL[meta.level]}
                            </Badge>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
