"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isValidFirstName, normalizeFirstName } from "@/lib/personalize"
import { ThemeToggle } from "./theme-toggle"
import { WelcomeMotion } from "./welcome-motion"

interface WelcomeScreenProps {
  onSubmit: (firstName: string) => void
}

export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const [raw, setRaw] = useState("")
  const preview = normalizeFirstName(raw)
  const canContinue = isValidFirstName(preview)

  const submit = () => {
    if (!canContinue) return
    onSubmit(preview)
  }

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden space-bg">
      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-8">
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

      <WelcomeMotion />

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-16">
        <div className="welcome-glow pointer-events-none absolute inset-0" aria-hidden />

        <form
          className="relative w-full max-w-md animate-fade-up text-center"
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

          <Button type="submit" size="lg" disabled={!canContinue} className="mt-6 h-12 w-full sm:w-auto sm:min-w-[220px]">
            Entrar no estúdio
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </main>
    </div>
  )
}
