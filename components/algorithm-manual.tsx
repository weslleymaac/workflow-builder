"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Divide,
  Equal,
  GitBranch,
  Hash,
  Lightbulb,
  List,
  Lock,
  Menu,
  Minus,
  Plus,
  Repeat,
  Table2,
  Type,
  Variable,
  Workflow,
  X,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MANUAL_LESSONS,
  flattenLessonSteps,
  getLessonStepCount,
  type ManualExercise,
  type ManualLesson,
  type ManualSlide,
  type ManualStep,
  type ManualVisual,
} from "@/lib/manual-lessons"
import { celebrateCorrect } from "@/lib/celebrate"
import { cn } from "@/lib/utils"
import { useSay, useUserName } from "./user-name"

function DiagramCard({
  children,
  className,
  delay,
}: {
  children: ReactNode
  className?: string
  delay?: string
}) {
  return (
    <div
      className={cn(
        "manual-step-bar rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left",
        className,
      )}
      style={delay ? { animationDelay: delay } : undefined}
    >
      {children}
    </div>
  )
}

function SlideVisual({ visual, active }: { visual: ManualVisual; active: boolean }) {
  const name = useUserName()
  const base = cn("manual-visual w-full max-w-md px-6", active && "manual-visual-active")

  if (visual === "welcome") {
    const steps = ["Problema", "Instruções", "Execução", "Resultado"]
    return (
      <div className={cn(base, "flex flex-col gap-3")}>
        {steps.map((label, i) => (
          <DiagramCard key={label} delay={`${i * 0.08}s`} className="flex items-center gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d4b483]/15 font-display text-sm text-[#d4b483]">
              {i + 1}
            </span>
            <span className="text-sm font-medium text-white/90">{label}</span>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "definition") {
    const steps = [
      { n: "01", label: "Início" },
      { n: "02", label: "Processar" },
      { n: "03", label: "Validar" },
      { n: "04", label: "Fim" },
    ]
    return (
      <div className={cn(base, "relative flex flex-col gap-2.5")}>
        <div className="absolute bottom-5 left-[34px] top-5 w-px bg-white/10" />
        {steps.map((step, i) => (
          <DiagramCard key={step.label} delay={`${i * 0.1}s`} className="relative z-[1] flex items-center gap-4">
            <span className="font-display text-xs text-[#d4b483]">{step.n}</span>
            <span className="text-sm font-medium text-white">{step.label}</span>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "how") {
    const cols = [
      { title: "Entrada", detail: "Dados" },
      { title: "Processar", detail: "Regras" },
      { title: "Saída", detail: "Resultado" },
    ]
    return (
      <div className={cn(base, "flex items-center justify-center gap-2")}>
        {cols.map((col, i) => (
          <div key={col.title} className="flex items-center gap-2">
            <DiagramCard delay={`${i * 0.12}s`} className="flex w-[7.5rem] flex-col items-center py-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#d4b483]">{col.title}</p>
              <p className="mt-2 text-sm text-white/70">{col.detail}</p>
            </DiagramCard>
            {i < cols.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-white/30" />}
          </div>
        ))}
      </div>
    )
  }

  if (visual === "daily") {
    const lines = ["Preparar recursos", "Tratar a condição", "Executar a ação", "Verificar o resultado"]
    return (
      <div className={cn(base, "flex flex-col gap-2.5")}>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-white/40">Procedimento</p>
        {lines.map((line, i) => (
          <DiagramCard key={line} delay={`${i * 0.08}s`} className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#d4b483]">{i + 1}.</span>
            <span className="text-sm text-white/90">{line}</span>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "variables") {
    const boxes = [
      { name: "nome", value: `"${name}"`, kind: "texto" },
      { name: "idade", value: "15", kind: "inteiro" },
      { name: "ativo", value: "verdadeiro", kind: "lógico" },
    ]
    return (
      <div className={cn(base, "flex flex-col gap-2.5")}>
        {boxes.map((box, i) => (
          <DiagramCard key={box.name} delay={`${i * 0.1}s`} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div>
              <p className="font-mono text-sm font-semibold text-white">{box.name}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-white/40">{box.kind}</p>
            </div>
            <span className="font-mono text-sm text-[#d4b483]">{box.value}</span>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "constants") {
    const items = [
      { name: "PI", value: "3.14159" },
      { name: "LIMITE", value: "10" },
    ]
    return (
      <div className={cn(base, "flex flex-col gap-3")}>
        {items.map((item, i) => (
          <DiagramCard key={item.name} delay={`${i * 0.1}s`} className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-[#d4b483]" />
            <span className="font-mono text-sm font-semibold text-white">{item.name}</span>
            <span className="ml-auto font-mono text-sm text-[#d4b483]">{item.value}</span>
          </DiagramCard>
        ))}
        <p className="text-center text-xs text-white/40">Valor definido uma vez</p>
      </div>
    )
  }

  if (visual === "types") {
    const types = [
      { label: "Inteiro", example: "42", icon: Hash },
      { label: "Real", example: "7.5", icon: Variable },
      { label: "Texto", example: `"${name}"`, icon: Type },
      { label: "Lógico", example: "true", icon: CheckCircle2 },
    ]
    return (
      <div className={cn(base, "grid grid-cols-2 gap-3")}>
        {types.map((type, i) => (
          <DiagramCard key={type.label} delay={`${i * 0.08}s`} className="flex flex-col items-center py-4">
            <type.icon className="h-5 w-5 text-[#d4b483]" />
            <p className="mt-2 text-sm font-medium text-white">{type.label}</p>
            <p className="mt-1 font-mono text-xs text-white/50">{type.example}</p>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "memory") {
    return (
      <div className={cn(base, "flex flex-col gap-3")}>
        {[
          { step: "x ← 10", note: "grava 10" },
          { step: "x ← x + 5", note: "lê 10, soma, grava 15" },
          { step: "escreva(x)", note: "saída: 15" },
        ].map((row, i) => (
          <DiagramCard key={row.step} delay={`${i * 0.1}s`}>
            <p className="font-mono text-sm text-[#d4b483]">{row.step}</p>
            <p className="mt-1 text-xs text-white/50">{row.note}</p>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "operators") {
    const ops = [
      { icon: Plus, label: "soma" },
      { icon: Minus, label: "subtração" },
      { icon: null, symbol: "×", label: "produto" },
      { icon: Divide, label: "divisão" },
      { icon: Equal, label: "resto %" },
    ]
    return (
      <div className={cn(base, "grid grid-cols-5 gap-2")}>
        {ops.map((op, i) => (
          <DiagramCard key={op.label} delay={`${i * 0.06}s`} className="flex flex-col items-center px-2 py-4">
            {op.icon ? <op.icon className="h-5 w-5 text-[#d4b483]" /> : <span className="text-lg text-[#d4b483]">{op.symbol}</span>}
            <p className="mt-2 text-center text-[11px] leading-snug text-white/60">{op.label}</p>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "relational") {
    const ops = [">", "<", ">=", "<=", "==", "!="]
    return (
      <div className={cn(base, "grid grid-cols-3 gap-3")}>
        {ops.map((op, i) => (
          <DiagramCard key={op} delay={`${i * 0.06}s`} className="flex items-center justify-center py-4">
            <span className="font-mono text-lg text-[#d4b483]">{op}</span>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "logical") {
    const ops = [
      { title: "E", detail: "ambas verdadeiras" },
      { title: "OU", detail: "ao menos uma" },
      { title: "NÃO", detail: "inverte o valor" },
    ]
    return (
      <div className={cn(base, "flex flex-col gap-2.5")}>
        {ops.map((op, i) => (
          <DiagramCard key={op.title} delay={`${i * 0.1}s`} className="flex items-center justify-between gap-4">
            <span className="font-display text-sm text-[#d4b483]">{op.title}</span>
            <span className="text-sm text-white/60">{op.detail}</span>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "expression") {
    return (
      <div className={cn(base, "flex flex-col items-center gap-3")}>
        <DiagramCard className="w-full text-center font-mono text-sm text-white/90">{"(nota >= 7) E (faltas < 5)"}</DiagramCard>
        <ArrowRight className="h-4 w-4 rotate-90 text-white/30" />
        <div className="grid w-full grid-cols-2 gap-3">
          <DiagramCard className="text-center text-sm text-emerald-200">verdadeiro</DiagramCard>
          <DiagramCard className="text-center text-sm text-emerald-200">verdadeiro</DiagramCard>
        </div>
        <ArrowRight className="h-4 w-4 rotate-90 text-white/30" />
        <DiagramCard className="w-full text-center text-sm font-medium text-[#d4b483]">resultado: verdadeiro</DiagramCard>
      </div>
    )
  }

  if (visual === "condition" || visual === "ifelse") {
    return (
      <div className={cn(base, "flex flex-col items-center gap-4")}>
        <DiagramCard className="px-6 py-3 font-mono text-sm text-white">se (condição)</DiagramCard>
        <div className="grid w-full grid-cols-2 gap-4">
          <DiagramCard className="flex flex-col items-center py-4">
            <GitBranch className="h-5 w-5 text-emerald-300" />
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-emerald-200">Sim</p>
            <p className="mt-1 text-sm text-white/60">executa o bloco</p>
          </DiagramCard>
          <DiagramCard className="flex flex-col items-center py-4">
            <GitBranch className="h-5 w-5 rotate-90 text-rose-300" />
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-rose-200">Não</p>
            <p className="mt-1 text-sm text-white/60">{visual === "ifelse" ? "caminho senão" : "segue em frente"}</p>
          </DiagramCard>
        </div>
      </div>
    )
  }

  if (visual === "chain") {
    const rules = [
      { test: "nota >= 9", out: "A" },
      { test: "nota >= 7", out: "B" },
      { test: "senão", out: "C" },
    ]
    return (
      <div className={cn(base, "flex flex-col gap-2.5")}>
        {rules.map((rule, i) => (
          <DiagramCard key={rule.out} delay={`${i * 0.1}s`} className="flex items-center justify-between">
            <span className="font-mono text-sm text-white/80">{rule.test}</span>
            <span className="font-display text-sm text-[#d4b483]">{rule.out}</span>
          </DiagramCard>
        ))}
      </div>
    )
  }

  if (visual === "loop" || visual === "while" || visual === "for" || visual === "control") {
    const caption =
      visual === "while"
        ? "enquanto condição"
        : visual === "for"
          ? "para i de 1 até n"
          : visual === "control"
            ? "condição de parada"
            : "repetir o bloco"
    return (
      <div className={cn(base, "flex flex-col items-center gap-4")}>
        <Repeat className="h-12 w-12 text-[#d4b483]/80" />
        <DiagramCard className="w-full text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#d4b483]">{caption}</p>
          <p className="mt-2 font-mono text-sm text-white/80">corpo → atualizar estado → testar de novo</p>
        </DiagramCard>
      </div>
    )
  }

  if (visual === "array" || visual === "index") {
    const cells = [name, "Bia", "Caio"]
    return (
      <div className={cn(base, "flex flex-col items-center gap-4")}>
        <div className="flex w-full gap-2">
          {cells.map((cell, i) => (
            <DiagramCard
              key={cell}
              delay={`${i * 0.1}s`}
              className={cn("flex flex-1 flex-col items-center py-4", visual === "index" && i === 1 && "border-[#d4b483]/40 bg-[#d4b483]/10")}
            >
              <span className="font-mono text-xs text-white/40">[{i}]</span>
              <span className="mt-1 text-sm font-medium text-white">{cell}</span>
            </DiagramCard>
          ))}
        </div>
        {visual === "index" && <p className="text-sm text-white/50">nomes[1] → Bia</p>}
      </div>
    )
  }

  if (visual === "matrix") {
    const grid = [
      [1, 2],
      [3, 4],
      [5, 6],
    ]
    return (
      <div className={cn(base, "flex flex-col items-center gap-3")}>
        <div className="grid grid-cols-2 gap-2">
          {grid.flatMap((row, r) =>
            row.map((value, c) => (
              <DiagramCard
                key={`${r}-${c}`}
                className={cn("flex h-14 w-14 items-center justify-center", r === 1 && c === 0 && "border-[#d4b483]/40 bg-[#d4b483]/10")}
              >
                <span className="font-mono text-sm text-white">{value}</span>
              </DiagramCard>
            )),
          )}
        </div>
        <p className="font-mono text-sm text-white/55">mat[1][0] = 3</p>
      </div>
    )
  }

  if (visual === "iterate") {
    return (
      <div className={cn(base, "flex flex-col gap-3")}>
        {["i = 0 → lista[0]", "i = 1 → lista[1]", "i = 2 → lista[2]"].map((line, i) => (
          <DiagramCard key={line} delay={`${i * 0.1}s`} className="font-mono text-sm text-white/85">
            {line}
          </DiagramCard>
        ))}
      </div>
    )
  }

  return (
    <div className={cn(base, "flex flex-col items-center gap-4")}>
      <div className="flex gap-2">
        {[1, 2, 3].map((n) => (
          <span key={n} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 font-display text-sm text-[#d4b483]">
            {n}
          </span>
        ))}
      </div>
      <p className="text-sm text-white/50">Pratique o conceito da aula</p>
    </div>
  )
}

function stepTitle(step: ManualStep) {
  return step.kind === "slide" ? (step.data as ManualSlide).title : (step.data as ManualExercise).title
}

const LESSON_ICONS: Record<string, typeof Variable> = {
  "algoritmo-logica": Workflow,
  "variaveis-tipos": Variable,
  operadores: Equal,
  condicionais: GitBranch,
  repeticao: Repeat,
  "vetores-matrizes": Table2,
}

function ExerciseChoices({
  options,
  correctIndex,
  selected,
  onSelect,
}: {
  options: string[]
  correctIndex: number
  selected: number | null
  onSelect: (index: number) => void
}) {
  const answered = selected !== null

  return (
    <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Alternativas">
      {options.map((option, i) => {
        const isSelected = selected === i
        const isCorrect = i === correctIndex
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={answered}
            onClick={() => onSelect(i)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm leading-relaxed transition-colors",
              !answered && "border-border bg-card hover:border-primary/40 hover:bg-muted/50",
              !answered && "cursor-pointer",
              answered && isCorrect && "border-emerald-500/40 bg-emerald-500/10",
              answered && isSelected && !isCorrect && "border-rose-400/50 bg-rose-500/10",
              answered && !isSelected && !isCorrect && "border-border bg-card opacity-55",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                !answered && "border-border text-muted-foreground",
                answered && isCorrect && "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
                answered && isSelected && !isCorrect && "border-rose-400/50 text-rose-700 dark:text-rose-300",
              )}
            >
              {answered && isCorrect ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : answered && isSelected ? (
                <XCircle className="h-4 w-4" />
              ) : (
                String.fromCharCode(65 + i)
              )}
            </span>
            <span className="min-w-0 flex-1">{option}</span>
          </button>
        )
      })}
    </div>
  )
}

function CourseSidebar({
  activeLesson,
  activeStepId,
  onSelectLesson,
  onSelectStep,
}: {
  activeLesson: ManualLesson | null
  activeStepId?: string
  onSelectLesson: (lesson: ManualLesson) => void
  onSelectStep: (lesson: ManualLesson, stepIndex: number) => void
}) {
  const [openId, setOpenId] = useState(activeLesson?.id ?? "")
  const currentNumber = activeLesson?.number ?? 0
  const progress = (currentNumber / MANUAL_LESSONS.length) * 100

  useEffect(() => {
    if (activeLesson?.id) setOpenId(activeLesson.id)
  }, [activeLesson?.id])

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-sm text-[#d4b483]">LF</span>
          </div>
          <p className="text-sm font-medium text-foreground">Logic Flow</p>
        </div>
        <h2 className="mt-5 text-[15px] font-medium leading-snug text-foreground">
          Manual de lógica
        </h2>
        <div className="mt-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <span>
            {currentNumber} de {MANUAL_LESSONS.length} aulas
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-[hsl(var(--energy))] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Accordion
          type="single"
          collapsible
          value={openId}
          onValueChange={(lessonId) => {
            setOpenId(lessonId)
            if (!lessonId) return
            const lesson = MANUAL_LESSONS.find((item) => item.id === lessonId)
            if (lesson && lesson.id !== activeLesson?.id) onSelectLesson(lesson)
          }}
          className="px-3 py-5"
        >
          {MANUAL_LESSONS.map((lesson) => {
            const steps = flattenLessonSteps(lesson)
            const isActive = activeLesson?.id === lesson.id
            const count = getLessonStepCount(lesson)
            const Icon = LESSON_ICONS[lesson.id] ?? Workflow
            const currentStep = isActive
              ? Math.max(1, steps.findIndex((item) => item.data.id === activeStepId) + 1)
              : 0
            return (
              <AccordionItem key={lesson.id} value={lesson.id} className="border-0">
                <AccordionTrigger className="gap-2 py-2 hover:no-underline [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-muted-foreground [&>svg]:duration-500 [&>svg]:ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <span className="flex min-w-0 flex-1 items-start gap-2 text-left">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-foreground" strokeWidth={2.4} />
                    <span className="min-w-0 flex-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">
                      {lesson.title}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {isActive ? `${currentStep}/${count}` : `0/${count}`}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3 pt-1">
                  <ul className="space-y-1">
                    {steps.map((item, i) => {
                      const selected = item.data.id === activeStepId
                      return (
                        <li
                          key={item.data.id}
                          className="manual-accordion-item"
                          style={{ animationDelay: `${i * 45}ms` }}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectStep(lesson, i)}
                            className={cn(
                              "flex w-full items-start gap-2 rounded-full px-3 py-2.5 text-left text-sm leading-snug transition-[background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            <span className="min-w-0 flex-1 truncate">{stepTitle(item)}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </ScrollArea>
    </div>
  )
}

interface AlgorithmManualProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AlgorithmManual({ open, onOpenChange }: AlgorithmManualProps) {
  const t = useSay()
  const [view, setView] = useState<"catalog" | "lesson">("catalog")
  const [activeLesson, setActiveLesson] = useState<ManualLesson | null>(null)
  const [steps, setSteps] = useState<ManualStep[]>([])
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [animating, setAnimating] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const animTimer = useRef<number | null>(null)
  const confettiRef = useRef<HTMLCanvasElement>(null)

  const step = steps[index]
  const total = steps.length
  const isLastStep = index === total - 1
  const isExercise = step?.kind === "exercise"

  const clearAnimTimer = useCallback(() => {
    if (animTimer.current) {
      window.clearTimeout(animTimer.current)
      animTimer.current = null
    }
  }, [])

  const openLesson = useCallback(
    (lesson: ManualLesson, stepIndex = 0) => {
      clearAnimTimer()
      setAnimating(false)
      setActiveLesson(lesson)
      const nextSteps = flattenLessonSteps(lesson)
      setSteps(nextSteps)
      setIndex(Math.min(stepIndex, nextSteps.length - 1))
      setSelectedOption(null)
      setView("lesson")
      setSidebarOpen(false)
    },
    [clearAnimTimer],
  )

  const go = useCallback(
    (nextIndex: number, dir: "next" | "prev") => {
      if (animating || nextIndex === index || nextIndex < 0 || nextIndex >= total) return
      setSelectedOption(null)
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setIndex(nextIndex)
        return
      }
      setDirection(dir)
      setAnimating(true)
      clearAnimTimer()
      animTimer.current = window.setTimeout(() => {
        setIndex(nextIndex)
        setAnimating(false)
        animTimer.current = null
      }, 200)
    },
    [animating, clearAnimTimer, index, total],
  )

  const next = useCallback(() => go(index + 1, "next"), [go, index])
  const prev = useCallback(() => go(index - 1, "prev"), [go, index])

  const goToNextLesson = useCallback(() => {
    if (!activeLesson) return
    const lessonIndex = MANUAL_LESSONS.findIndex((item) => item.id === activeLesson.id)
    const upcoming = MANUAL_LESSONS[lessonIndex + 1]
    if (upcoming) openLesson(upcoming)
  }, [activeLesson, openLesson])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (view !== "lesson") return
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault()
        if (index < total - 1) next()
      }
      if (event.key === "ArrowLeft" && index > 0) prev()
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, view, index, total, next, prev, onOpenChange])

  useEffect(() => {
    if (!open) {
      clearAnimTimer()
      setView("catalog")
      setActiveLesson(null)
      setSteps([])
      setIndex(0)
      setAnimating(false)
      setSelectedOption(null)
      setSidebarOpen(false)
    }
  }, [clearAnimTimer, open])

  useEffect(() => () => clearAnimTimer(), [clearAnimTimer])

  const slide = step?.kind === "slide" ? (step.data as ManualSlide) : null
  const exercise = step?.kind === "exercise" ? (step.data as ManualExercise) : null
  const motion = cn(
    "manual-ppt-slide grid h-full min-h-0 grid-cols-1 lg:grid-cols-2",
    animating && direction === "next" && "manual-ppt-exit-left",
    animating && direction === "prev" && "manual-ppt-exit-right",
    !animating && "manual-ppt-enter",
  )
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0

  const answerExercise = (optionIndex: number) => {
    if (selectedOption !== null || !exercise) return
    setSelectedOption(optionIndex)
    if (optionIndex === exercise.correctIndex) {
      celebrateCorrect(confettiRef.current)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex outline-none md:inset-4 md:overflow-hidden md:rounded-2xl md:border md:border-border md:shadow-2xl"
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogTitle className="sr-only">Manual de lógica — aulas e exercícios</DialogTitle>

          <div className="relative flex min-h-0 w-full flex-1 overflow-hidden bg-background">
            <canvas
              ref={confettiRef}
              className="pointer-events-none absolute inset-0 z-[30]"
              aria-hidden
            />
            <aside
              className={cn(
                "absolute inset-y-0 left-0 z-20 w-[min(86vw,300px)] border-r border-border bg-card md:static md:block md:w-[280px] md:shrink-0",
                sidebarOpen ? "block" : "hidden md:block",
              )}
            >
              <CourseSidebar
                activeLesson={activeLesson}
                activeStepId={step?.data.id}
                onSelectLesson={(lesson) => openLesson(lesson)}
                onSelectStep={(lesson, stepIndex) => {
                  if (activeLesson?.id === lesson.id) {
                    go(stepIndex, stepIndex > index ? "next" : "prev")
                    setSidebarOpen(false)
                    return
                  }
                  openLesson(lesson, stepIndex)
                }}
              />
            </aside>
            {sidebarOpen && (
              <button
                type="button"
                className="absolute inset-0 z-10 bg-black/30 md:hidden"
                aria-label="Fechar menu de aulas"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div className="relative flex min-w-0 flex-1 flex-col">
              <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 md:px-6">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted md:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Abrir aulas"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <p className="hidden text-sm text-muted-foreground md:block">
                  {view === "catalog" ? "Visão geral" : activeLesson?.title}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Fechar manual"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="relative min-h-0 flex-1 overflow-hidden">
                {view === "catalog" ? (
                  <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-2">
                    <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-[#0f1c2e] lg:min-h-0">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,180,131,0.12),transparent_58%)]" />
                      <div className="relative flex flex-col items-center px-6">
                        <span className="text-6xl font-semibold tracking-tight text-[#d4b483] sm:text-7xl">LF</span>
                        <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-white/45">Logic Flow</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center bg-background px-8 py-10 sm:px-12">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        Manual de lógica
                      </p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        {t("{name}, seis aulas para pensar como um programa")}
                      </h2>
                      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                        Conceitos, exemplos em pseudocódigo e exercícios de checagem. Escolha um módulo na barra ao lado
                        ou comece pela primeira aula.
                      </p>
                      <Button className="mt-8 w-fit" onClick={() => openLesson(MANUAL_LESSONS[0])}>
                        Começar primeira aula
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  step && (
                    <>
                      <div className={motion} key={step.data.id}>
                        <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-[#0f1c2e] lg:min-h-0">
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,180,131,0.08),transparent_55%)]" />
                          <SlideVisual visual={slide?.visual ?? "exercise"} active={!animating} />
                        </div>
                        <div className="flex flex-col justify-center overflow-y-auto bg-background px-8 py-8 sm:px-12">
                          {slide && (
                            <>
                              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                Aula {String(step.lessonNumber).padStart(2, "0")} · Conceito
                              </p>
                              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                {t(slide.title)}
                              </h2>
                              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{t(slide.subtitle)}</p>
                              <ul className="mt-6 space-y-3">
                                {slide.points.map((point) => (
                                  <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-foreground/85">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--energy))]" />
                                    <span>{t(point)}</span>
                                  </li>
                                ))}
                              </ul>
                              {slide.snippet && (
                                <pre className="mt-6 overflow-x-auto rounded-xl border border-border bg-muted/40 px-4 py-3 font-mono text-sm leading-relaxed text-foreground">
                                  {t(slide.snippet)}
                                </pre>
                              )}
                            </>
                          )}
                          {exercise && (
                            <>
                              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                Exercício {exercise.number} de 3
                              </p>
                              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                {t(exercise.title)}
                              </h2>
                              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
                                {t(exercise.question)}
                              </p>
                              <ExerciseChoices
                                options={exercise.options.map((option) => t(option))}
                                correctIndex={exercise.correctIndex}
                                selected={selectedOption}
                                onSelect={answerExercise}
                              />
                              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
                                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--energy))]" />
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  <span className="font-medium text-foreground">Dica. </span>
                                  {t(exercise.hint)}
                                </p>
                              </div>
                              {selectedOption !== null && (
                                <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4">
                                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {selectedOption === exercise.correctIndex ? t("Isso, {name}") : "Resolução"}
                                  </p>
                                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">{t(exercise.answer)}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={prev}
                        disabled={index === 0 || animating}
                        className="manual-ppt-nav manual-ppt-nav-left"
                        aria-label="Anterior"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        disabled={isLastStep || animating}
                        className="manual-ppt-nav manual-ppt-nav-right"
                        aria-label="Próximo"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )
                )}
              </div>

              {view === "lesson" && step && (
                <div className="shrink-0 border-t border-border bg-card px-5 py-3 sm:px-6">
                  <div className="mb-3 h-0.5 overflow-hidden rounded-full bg-border">
                    <div className="h-full bg-[hsl(var(--energy))] transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      {isExercise ? "Exercício" : "Slide"} {index + 1} de {total}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={prev} disabled={index === 0 || animating}>
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      {isLastStep ? (
                        MANUAL_LESSONS.findIndex((item) => item.id === activeLesson?.id) < MANUAL_LESSONS.length - 1 ? (
                          <Button size="sm" onClick={goToNextLesson}>
                            Próxima aula
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setView("catalog")}>
                            <List className="h-4 w-4" />
                            Índice
                          </Button>
                        )
                      ) : (
                        <Button size="sm" onClick={next} disabled={animating}>
                          Próximo
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
