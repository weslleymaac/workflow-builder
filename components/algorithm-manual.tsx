"use client"

import { useCallback, useEffect, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Gamepad2,
  Globe,
  Lightbulb,
  MapPin,
  Maximize2,
  Rocket,
  Sparkles,
  Stethoscope,
  Variable,
  GitBranch,
  Repeat,
  List,
  FunctionSquare,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { MANUAL_SLIDES, type ManualSlide } from "@/lib/manual-slides"
import { cn } from "@/lib/utils"

const ACCENT: Record<ManualSlide["accent"], string> = {
  cyan: "from-cyan-500/25 via-cyan-500/10 to-transparent border-cyan-400/40",
  violet: "from-violet-500/25 via-violet-500/10 to-transparent border-violet-400/40",
  amber: "from-amber-500/25 via-amber-500/10 to-transparent border-amber-400/40",
  emerald: "from-emerald-500/25 via-emerald-500/10 to-transparent border-emerald-400/40",
  rose: "from-rose-500/25 via-rose-500/10 to-transparent border-rose-400/40",
  sky: "from-sky-500/25 via-sky-500/10 to-transparent border-sky-400/40",
}

const ACCENT_TEXT: Record<ManualSlide["accent"], string> = {
  cyan: "text-cyan-600 dark:text-cyan-300",
  violet: "text-violet-600 dark:text-violet-300",
  amber: "text-amber-700 dark:text-amber-300",
  emerald: "text-emerald-600 dark:text-emerald-300",
  rose: "text-rose-600 dark:text-rose-300",
  sky: "text-sky-600 dark:text-sky-300",
}

const ACCENT_DOT: Record<ManualSlide["accent"], string> = {
  cyan: "bg-cyan-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
}

function SlideVisual({ slide, active }: { slide: ManualSlide; active: boolean }) {
  const base = cn("manual-visual", active && "manual-visual-active")

  if (slide.visual === "welcome") {
    return (
      <div className={base}>
        <div className="manual-orbit-ring" />
        <div className="manual-float text-7xl sm:text-8xl">{slide.emoji}</div>
        <div className="manual-spark manual-spark-1">✦</div>
        <div className="manual-spark manual-spark-2">✦</div>
        <div className="manual-spark manual-spark-3">★</div>
      </div>
    )
  }

  if (slide.visual === "learn") {
    const icons = [Variable, GitBranch, Repeat, List, FunctionSquare]
    return (
      <div className={cn(base, "grid grid-cols-3 gap-3 p-4 sm:grid-cols-5")}>
        {icons.map((Icon, i) => (
          <div
            key={Icon.name}
            className="manual-learn-chip flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <Icon className="h-7 w-7 text-white/90" />
            <span className="text-[10px] font-semibold text-white/70">
              {["Variável", "Se/Senão", "Loop", "Lista", "Função"][i]}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (slide.visual === "definition") {
    return (
      <div className={cn(base, "flex w-full max-w-xs flex-col gap-3 px-4")}>
        {["Início", "Passo 1", "Passo 2", "Fim"].map((label, i) => (
          <div
            key={label}
            className="manual-step-bar flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/30 text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="text-sm font-semibold text-white/90">{label}</span>
          </div>
        ))}
      </div>
    )
  }

  if (slide.visual === "purpose") {
    const items = [
      { icon: Lightbulb, label: "Automatizar" },
      { icon: GitBranch, label: "Decidir" },
      { icon: Sparkles, label: "Criar" },
    ]
    return (
      <div className={cn(base, "flex justify-center gap-6")}>
        {items.map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            className="manual-purpose-bubble flex flex-col items-center gap-3"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-xl backdrop-blur-sm">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide text-white/70">{label}</span>
          </div>
        ))}
      </div>
    )
  }

  if (slide.visual === "how") {
    return (
      <div className={cn(base, "flex items-center justify-center gap-3 px-4")}>
        {[
          { label: "Entrada", emoji: "📥" },
          { label: "Processar", emoji: "⚙️" },
          { label: "Saída", emoji: "📤" },
        ].map((item, i) => (
          <div key={item.label} className="flex items-center gap-3">
            <div
              className="manual-flow-box flex flex-col items-center rounded-2xl border border-white/25 bg-white/10 px-5 py-4 backdrop-blur-sm"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="mt-2 text-xs font-bold uppercase tracking-wide text-white/80">{item.label}</span>
            </div>
            {i < 2 && <ChevronRight className="manual-flow-arrow h-5 w-5 text-white/50" />}
          </div>
        ))}
      </div>
    )
  }

  if (slide.visual === "daily") {
    return (
      <div className={cn(base, "relative flex items-center justify-center")}>
        <Coffee className="manual-coffee h-24 w-24 text-amber-200" />
        <div className="manual-steam manual-steam-1" />
        <div className="manual-steam manual-steam-2" />
        <div className="manual-steam manual-steam-3" />
      </div>
    )
  }

  if (slide.visual === "everywhere") {
    const spots = [
      { icon: Gamepad2, x: "8%", y: "18%" },
      { icon: MapPin, x: "72%", y: "12%" },
      { icon: Stethoscope, x: "78%", y: "68%" },
      { icon: Globe, x: "12%", y: "72%" },
    ]
    return (
      <div className={cn(base, "relative h-full min-h-[180px] w-full")}>
        <Globe className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-white/25" />
        {spots.map(({ icon: Icon, x, y }, i) => (
          <div
            key={i}
            className="manual-map-pin absolute flex h-10 w-10 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-sm"
            style={{ left: x, top: y, animationDelay: `${i * 0.15}s` }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={base}>
      <Rocket className="manual-launch h-24 w-24 text-cyan-200" />
      <div className="manual-launch-trail" />
    </div>
  )
}

interface AlgorithmManualProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AlgorithmManual({ open, onOpenChange }: AlgorithmManualProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [animating, setAnimating] = useState(false)
  const slide = MANUAL_SLIDES[index]
  const total = MANUAL_SLIDES.length
  const progress = ((index + 1) / total) * 100

  const go = useCallback(
    (next: number, dir: "next" | "prev") => {
      if (animating || next < 0 || next >= total) return
      setDirection(dir)
      setAnimating(true)
      window.setTimeout(() => {
        setIndex(next)
        setAnimating(false)
      }, 320)
    },
    [animating, total],
  )

  const next = useCallback(() => go(index + 1, "next"), [go, index])
  const prev = useCallback(() => go(index - 1, "prev"), [go, index])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault()
        next()
      }
      if (event.key === "ArrowLeft") prev()
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, next, prev, onOpenChange])

  useEffect(() => {
    if (!open) {
      setIndex(0)
      setAnimating(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "manual-ppt-dialog fixed left-1/2 top-1/2 z-50 flex w-[min(96vw,1100px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.97] data-[state=open]:zoom-in-[0.97] duration-300",
          )}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          {/* Toolbar estilo apresentação */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-2.5 sm:px-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                <BookOpen className="h-4 w-4 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Manual</p>
                <p className="text-sm font-semibold text-white">Algoritmos na prática</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60 sm:inline">
                ← → ou Espaço para navegar
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold tabular-nums text-white">
                {index + 1} / {total}
              </span>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Fechar apresentação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Área do slide — layout horizontal PowerPoint */}
          <div className="relative min-h-[min(62vh,520px)] overflow-hidden">
            <div
              key={slide.id}
              className={cn(
                "manual-ppt-slide grid h-full min-h-[min(62vh,520px)] grid-cols-1 lg:grid-cols-[1fr_1.1fr]",
                animating && direction === "next" && "manual-ppt-exit-left",
                animating && direction === "prev" && "manual-ppt-exit-right",
                !animating && "manual-ppt-enter",
              )}
            >
              {/* Painel visual esquerdo */}
              <div
                className={cn(
                  "relative flex min-h-[220px] items-center justify-center overflow-hidden bg-gradient-to-br lg:min-h-0",
                  ACCENT[slide.accent],
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <SlideVisual slide={slide} active={!animating} />
              </div>

              {/* Conteúdo direito */}
              <div className="flex flex-col justify-center bg-slate-950 px-6 py-8 sm:px-10 sm:py-10">
                <span className="manual-emoji-pop mb-4 text-5xl">{slide.emoji}</span>
                <h2 className={cn("text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl", ACCENT_TEXT[slide.accent])}>
                  {slide.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-white/60 sm:text-lg">{slide.subtitle}</p>
                <ul className="mt-6 space-y-3">
                  {slide.points.map((point, i) => (
                    <li
                      key={point}
                      className="manual-bullet flex gap-3 text-sm text-white/85 sm:text-base"
                      style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                    >
                      <span className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", ACCENT_DOT[slide.accent])} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Setas laterais estilo PowerPoint */}
            <button
              type="button"
              onClick={prev}
              disabled={index === 0 || animating}
              className="manual-ppt-nav manual-ppt-nav-left"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={index === total - 1 || animating}
              className="manual-ppt-nav manual-ppt-nav-right"
              aria-label="Próximo slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Rodapé com progresso e miniaturas */}
          <div className="border-t border-white/10 bg-slate-900/80 px-4 py-3 sm:px-5">
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn("h-full rounded-full transition-all duration-500 ease-out", ACCENT_DOT[slide.accent])}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="hidden gap-1.5 overflow-x-auto sm:flex">
                {MANUAL_SLIDES.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Ir para slide ${i + 1}: ${item.title}`}
                    onClick={() => go(i, i > index ? "next" : "prev")}
                    className={cn(
                      "flex h-8 min-w-[2rem] items-center justify-center rounded-lg text-xs font-bold transition-all",
                      i === index
                        ? cn("text-white shadow-lg", ACCENT_DOT[slide.accent])
                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70",
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prev}
                  disabled={index === 0 || animating}
                  className="gap-1 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                {index === total - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="gap-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400"
                  >
                    <Maximize2 className="h-4 w-4" />
                    Começar missão
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={next}
                    disabled={animating}
                    className="gap-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
