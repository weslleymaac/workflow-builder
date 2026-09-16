"use client"

import dynamic from "next/dynamic"

const WorkflowBuilder = dynamic(() => import("@/components/workflow-builder"), {
  ssr: false,
  loading: () => (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center space-bg text-muted-foreground">
      <div className="pointer-events-none absolute inset-0 space-stars" aria-hidden />
      <div className="relative animate-float text-5xl">🧑‍🚀</div>
      <p className="relative mt-4 text-sm text-indigo-600 dark:text-cyan-300/80">Preparando a estação orbital...</p>
      <div className="relative mt-3 h-1 w-32 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent bg-[length:200%_100%] dark:via-cyan-400" />
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
