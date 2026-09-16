"use client"

import dynamic from "next/dynamic"

const WorkflowBuilder = dynamic(() => import("@/components/workflow-builder"), {
  ssr: false,
  loading: () => (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center space-bg text-muted-foreground">
      <div className="relative flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <span className="font-display text-2xl text-[#d4b483]">LF</span>
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Logic Flow</p>
        <p className="mt-2 text-sm text-muted-foreground">Carregando o estúdio...</p>
        <div className="relative mt-5 h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div className="boot-bar h-full w-full" />
        </div>
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
