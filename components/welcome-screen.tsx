"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { playEnterStudio } from "@/lib/celebrate"
import { isValidFirstName, normalizeFirstName } from "@/lib/personalize"
import { ThemeToggle } from "./theme-toggle"
import { WelcomeMotion } from "./welcome-motion"

interface WelcomeScreenProps {
  onSubmit: (firstName: string) => void
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const [raw, setRaw] = useState("")
  const [phase, setPhase] = useState<"idle" | "departing">("idle")
  const [lockedName, setLockedName] = useState("")
  const preview = normalizeFirstName(raw)
  const canContinue = isValidFirstName(preview)
  const departing = phase === "departing"
  const shownName = departing ? lockedName : preview
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit

  const submit = () => {
    if (!canContinue || departing) return
    if (prefersReducedMotion()) {
      onSubmit(preview)
      return
    }
    setLockedName(preview)
    setPhase("departing")
    playEnterStudio()
  }

  useEffect(() => {
    if (!departing) return
    const id = window.setTimeout(() => onSubmitRef.current(lockedName), 3180)
    return () => window.clearTimeout(id)
  }, [departing, lockedName])

  return (
    <div
      className={`relative flex h-[100dvh] flex-col overflow-hidden space-bg${departing ? " welcome-depart" : ""}`}
      aria-busy={departing}
    >
      <header className="welcome-chrome relative z-10 flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="font-display text-lg text-[#d4b483]">LF</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-lg text-foreground">Logic Flow</p>
            <p className="text-sm text-muted-foreground">Estúdio de lógica de programação</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <WelcomeMotion departing={departing} />

      {departing && (
        <>
          <div className="welcome-bloom" aria-hidden />
          <span className="welcome-portal-ring welcome-portal-a" aria-hidden />
          <span className="welcome-portal-ring welcome-portal-b" aria-hidden />
          <span className="welcome-portal-ring welcome-portal-c" aria-hidden />
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              className="welcome-burst-spark"
              style={{ "--burst-angle": `${index * 30}deg` } as CSSProperties}
              aria-hidden
            />
          ))}
          <div className="welcome-hello" aria-live="polite">
            <p className="welcome-hello-kicker">Estúdio aberto</p>
            <p className="welcome-hello-name">{shownName}</p>
            <p className="welcome-hello-sub">Vamos começar.</p>
          </div>
        </>
      )}

      <main className="welcome-stage relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-16">
        <div className="welcome-glow pointer-events-none absolute inset-0" aria-hidden />

        <form
          className="welcome-form relative w-full max-w-md animate-fade-up text-center"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <div className="welcome-logo-wrap mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <span className="welcome-logo-ring" />
            <span className="welcome-logo-ring welcome-logo-ring-delay" />
            <span className="relative font-display text-2xl text-[#d4b483]">LF</span>
          </div>

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Primeiro passo
          </p>
          <h1 className="font-display mt-3 text-3xl text-foreground sm:text-4xl">
            Qual é o seu primeiro nome?
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            Só o primeiro nome. Vamos usar nas aulas, nos avisos e no estúdio para deixar tudo com a sua cara.
          </p>

          <div className="mt-8 text-left">
            <Label htmlFor="first-name" className="sr-only">
              Primeiro nome
            </Label>
            <Input
              id="first-name"
              autoFocus
              autoComplete="given-name"
              spellCheck={false}
              maxLength={24}
              value={raw}
              disabled={departing}
              placeholder="Ex: Ana"
              className="h-14 rounded-2xl border-border/80 bg-card px-5 text-center text-lg font-medium tracking-tight shadow-sm"
              onChange={(event) => {
                const next = event.target.value.replace(/\s.*/, "")
                setRaw(next)
              }}
            />
          </div>

          <div className="mt-4 min-h-7">
            {preview ? (
              <p className="animate-fade-up text-sm text-muted-foreground">
                Prazer, <span className="font-medium text-foreground">{preview}</span>.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground/80">Sem sobrenome — só como você gosta de ser chamado.</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!canContinue || departing}
            className="mt-6 h-12 w-full sm:w-auto sm:min-w-[220px]"
          >
            Entrar no estúdio
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </main>
    </div>
  )
}
