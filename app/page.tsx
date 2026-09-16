"use client"

import dynamic from "next/dynamic"

const WorkflowBuilder = dynamic(() => import("@/components/workflow-builder"), {
  ssr: false,
  loading: () => (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center space-bg text-muted-foreground">
      <div className="pointer-events-none absolute inset-0 space-stars" aria-hidden />
      <div className="pointer-events-none absolute inset-0 hex-grid" aria-hidden />
      <div className="pointer-events-none absolute inset-0 scanlines" aria-hidden />
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/60 bg-card/80 text-5xl shadow-[0_0_40px_hsl(var(--primary)/0.35)]">
          <span className="animate-float">🧑‍🚀</span>
        </div>
        <p className="font-display mt-6 text-sm uppercase tracking-[0.28em] text-primary">Logic Flow</p>
        <p className="mt-2 text-sm text-muted-foreground">Inicializando o hangar...</p>
        <div className="relative mt-4 h-2 w-44 overflow-hidden rounded-full border border-border bg-muted">
          <div className="boot-bar h-full w-full" />
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
          sistema · pronto para decolar
        </p>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <main className="h-[100dvh] overflow-hidden">
      <WorkflowBuilder />
    </main>
  )
}
