"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react"
import ReactFlow, {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  Position,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
} from "reactflow"
import {
  AlignHorizontalSpaceAround,
  CircleDot,
  FastForward,
  FolderKanban,
  Gauge,
  GraduationCap,
  LayoutGrid,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Trash2,
} from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import CustomEdge from "./custom-edge"
import LessonPanel from "./lesson-panel"
import NodeConfigPanel from "./node-config-panel"
import NodeLibrary from "./node-library"
import ProjectHub from "./project-hub"
import RuntimePanel from "./runtime-panel"
import { ThemeToggle } from "./theme-toggle"
import { UserNameProvider } from "./user-name"
import WelcomeScreen from "./welcome-screen"
import { useTheme } from "next-themes"
import {
  ConditionNode,
  EndNode,
  FunctionNode,
  InputNode,
  ListNode,
  LoopNode,
  PrintNode,
  StartNode,
  SwitchNode,
  VariableNode,
} from "./nodes/logic-nodes"
import { LogicRuntime } from "@/lib/executor"
import { DEFAULT_GRAPH, EXAMPLE_PROGRAMS } from "@/lib/examples"
import { isLessonComplete, LESSONS } from "@/lib/lessons"
import { getCatalogItem } from "@/lib/node-catalog"
import {
  createSavedProgram,
  currentProgram,
  emptyPersistedState,
  loadState,
  saveState,
} from "@/lib/storage"
import type { PersistedState, RuntimeSnapshot, WorkflowEdge, WorkflowNode } from "@/lib/types"
import {
  autoLayoutGraph,
  collectListVariables,
  collectProgramVariables,
  createNode,
  generateNodeId,
  syncNodeIdCounter,
} from "@/lib/workflow-utils"
import { say } from "@/lib/personalize"

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  variable: VariableNode,
  input: InputNode,
  print: PrintNode,
  condition: ConditionNode,
  switch: SwitchNode,
  loop: LoopNode,
  list: ListNode,
  function: FunctionNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

const HANDLE_LABELS: Record<string, string> = {
  true: "sim",
  false: "não",
  body: "corpo",
  done: "depois",
}

function LogicFlowStudio() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const runtimeRef = useRef(new LogicRuntime())
  const saveTimer = useRef<number | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [persisted, setPersisted] = useState<PersistedState>(() => emptyPersistedState(DEFAULT_GRAPH))
  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_GRAPH.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_GRAPH.edges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [rightTab, setRightTab] = useState("licao")
  const [confirmAction, setConfirmAction] = useState<"reset" | "clear" | null>(null)
  const [studioOpen, setStudioOpen] = useState(false)
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(runtimeRef.current.getSnapshot())
  // A paleta cabe antes do painel de missão, então cada um tem seu ponto de quebra.
  const canDockPalette = useMediaQuery("(min-width: 1024px)")
  const canDockMission = useMediaQuery("(min-width: 1320px)")
  const { resolvedTheme } = useTheme()
  const isDarkCanvas = resolvedTheme !== "light"
  const showMiniMap = useMediaQuery("(min-width: 768px)")
  const [paletteOpen, setPaletteOpen] = useState(true)
  const [missionOpen, setMissionOpen] = useState(true)
  const [mobilePanel, setMobilePanel] = useState<"blocos" | "missao" | null>(null)
  const celebratedLessons = useRef(new Set<string>())

  const paletteDocked = canDockPalette && paletteOpen
  const missionDocked = canDockMission && missionOpen
  const paletteVisible = canDockPalette ? paletteOpen : mobilePanel === "blocos"
  const missionVisible = canDockMission ? missionOpen : mobilePanel === "missao"

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) as WorkflowNode | undefined
  const program = currentProgram(persisted)
  const firstName = persisted.firstName ?? ""

  useEffect(() => {
    const saved = loadState()
    if (saved) {
      const current = currentProgram(saved)
      setPersisted(saved)
      celebratedLessons.current = new Set(saved.completedLessons)
      if (current) {
        syncNodeIdCounter(current.graph.nodes)
        setNodes(current.graph.nodes)
        setEdges(current.graph.edges)
      }
    }
    setHydrated(true)
  }, [setEdges, setNodes])

  useEffect(() => runtimeRef.current.subscribe(setSnapshot), [])

  useEffect(() => {
    runtimeRef.current.configure(nodes as WorkflowNode[], edges as WorkflowEdge[], {
      delayMs: persisted.speedMs,
      stepMode: persisted.stepMode,
    })
  }, [nodes, edges, persisted.speedMs, persisted.stepMode])

  const persistGraph = useCallback((nextNodes: Node[], nextEdges: Edge[]) => {
    setPersisted((current) => {
      const sanitizedNodes = nextNodes.map((node) => {
        const { running: _running, ...data } = node.data as WorkflowNode["data"]
        return { ...node, data } as WorkflowNode
      })
      const next: PersistedState = {
        ...current,
        programs: current.programs.map((item) =>
          item.id === current.currentProgramId
            ? {
                ...item,
                graph: { nodes: sanitizedNodes, edges: nextEdges as WorkflowEdge[] },
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      }
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => saveState(next), 400)
      return next
    })
  }, [])

  useEffect(() => {
    if (!hydrated || !studioOpen) return
    persistGraph(nodes, edges)
  }, [nodes, edges, hydrated, studioOpen, persistGraph])

  useEffect(() => {
    const lessonId = program?.lessonId
    if (!lessonId || snapshot.status !== "done") return
    const lesson = LESSONS.find((item) => item.id === lessonId)
    if (!lesson || !isLessonComplete(lesson, nodes as WorkflowNode[], snapshot)) return

    setPersisted((current) => {
      if (current.completedLessons.includes(lessonId) || celebratedLessons.current.has(lessonId)) return current
      celebratedLessons.current.add(lessonId)
      const next = {
        ...current,
        completedLessons: [...current.completedLessons, lessonId],
      }
      saveState(next)
      toast({
        title: say("{name}, aula concluída", firstName),
        description: say(`Mandou bem em ${lesson.title}.`, firstName),
      })
      return next
    })
  }, [nodes, program?.lessonId, snapshot])

  const resolveHandleLabel = useCallback(
    (sourceId: string | null | undefined, sourceHandle?: string | null) => {
      if (!sourceHandle) return undefined
      if (HANDLE_LABELS[sourceHandle]) return HANDLE_LABELS[sourceHandle]

      const source = nodes.find((item) => item.id === sourceId) as WorkflowNode | undefined
      if (source?.type === "switch") {
        if (sourceHandle === "default") return source.data.defaultLabel || "padrão"
        const match = source.data.switchCases?.find((item) => item.id === sourceHandle)
        return match?.label || match?.matchExpr || sourceHandle
      }

      return sourceHandle
    },
    [nodes],
  )

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const sourceHandle = "sourceHandle" in params ? params.sourceHandle : undefined
      const label = resolveHandleLabel(params.source, sourceHandle)
      setEdges((current) =>
        addEdge(
          {
            ...params,
            type: "custom",
            markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
            data: label ? { label } : undefined,
          },
          current,
        ),
      )
    },
    [resolveHandleLabel, setEdges],
  )

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const type = event.dataTransfer.getData("application/reactflow")
      if (!type || !reactFlowInstance) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const catalog = getCatalogItem(type)
      if (type === "start" && nodes.some((node) => node.type === "start")) {
        toast({
          title: "Já existe um Início",
          description: "Um programa só pode ter um ponto de partida.",
          variant: "destructive",
        })
        return
      }

      const newNode = createNode({
        type,
        position,
        id: generateNodeId(type),
        data: catalog ? { label: catalog.label, description: catalog.description, tip: catalog.tip } : undefined,
      })
      setNodes((current) => current.concat(newNode))
      setSelectedNodeId(newNode.id)
      setRightTab("bloco")
    },
    [nodes, reactFlowInstance, setNodes, firstName],
  )

  const updateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...data,
                },
              }
            : node,
        ),
      )
    },
    [setNodes],
  )

  const loadGraph = useCallback(
    (graph: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }, extra?: Partial<PersistedState>) => {
      runtimeRef.current.stop()
      syncNodeIdCounter(graph.nodes)
      setNodes(graph.nodes)
      setEdges(graph.edges)
      setSelectedNodeId(null)
      requestAnimationFrame(() => reactFlowInstance?.fitView({ padding: 0.2 }))
      if (extra) {
        setPersisted((current) => {
          const next = { ...current, ...extra }
          saveState(next)
          return next
        })
      }
    },
    [reactFlowInstance, setEdges, setNodes],
  )

  const loadExample = (exampleId: string) => {
    const example = EXAMPLE_PROGRAMS[exampleId]
    if (!example) return
    const linkedLesson = LESSONS.find((item) => item.exampleId === exampleId)
    setPersisted((current) => {
      const nextPrograms = current.programs.map((item) =>
        item.id === current.currentProgramId
          ? {
              ...item,
              name: example.name,
              lessonId: linkedLesson?.id ?? item.lessonId,
              graph: example.graph,
              updatedAt: new Date().toISOString(),
            }
          : item,
      )
      const next = { ...current, programs: nextPrograms }
      saveState(next)
      return next
    })
    loadGraph(example.graph)
    toast({ title: "Exemplo carregado", description: example.description })
  }

  const resetCanvas = () => {
    loadExample("hello")
  }

  const clearCanvas = () => {
    runtimeRef.current.stop()
    const start = createNode({ type: "start", position: { x: 80, y: 180 } })
    setNodes([start])
    setEdges([])
    setSelectedNodeId(start.id)
  }

  const autoLayoutNodes = useCallback(() => {
    setNodes((current) => {
      const laidOut = autoLayoutGraph(current as WorkflowNode[], edges as WorkflowEdge[])
      requestAnimationFrame(() => reactFlowInstance?.fitView({ padding: 0.25, duration: 300 }))
      return laidOut
    })
    toast({
      title: "Layout ajustado",
      description: "Os blocos foram reorganizados automaticamente.",
    })
  }, [edges, reactFlowInstance, setNodes, firstName])

  const toggleCanvasDots = useCallback(() => {
    setPersisted((current) => {
      const next = { ...current, showCanvasDots: !current.showCanvasDots }
      saveState(next)
      return next
    })
  }, [])

  const renameProgram = (name: string) => {
    setPersisted((current) => {
      const next = {
        ...current,
        programs: current.programs.map((item) =>
          item.id === current.currentProgramId ? { ...item, name, updatedAt: new Date().toISOString() } : item,
        ),
      }
      saveState(next)
      return next
    })
  }

  const openProject = (programId: string) => {
    const target = persisted.programs.find((item) => item.id === programId)
    if (!target) return
    runtimeRef.current.stop()
    setPersisted((current) => {
      const next = { ...current, currentProgramId: programId }
      saveState(next)
      return next
    })
    loadGraph(target.graph)
    setStudioOpen(true)
  }

  const createProject = (name: string) => {
    const created = createSavedProgram(name, DEFAULT_GRAPH)
    setPersisted((current) => {
      const next = {
        ...current,
        programs: [...current.programs, created],
        currentProgramId: created.id,
      }
      saveState(next)
      return next
    })
    loadGraph(created.graph)
    setStudioOpen(true)
    toast({
      title: "Fluxo criado",
      description: `“${name}” está pronto no estúdio.`,
    })
  }

  const deleteProject = (programId: string) => {
    setPersisted((current) => {
      const remaining = current.programs.filter((item) => item.id !== programId)
      if (remaining.length === 0) return current
      const nextCurrent =
        current.currentProgramId === programId ? remaining[0].id : current.currentProgramId
      const next = { ...current, programs: remaining, currentProgramId: nextCurrent }
      saveState(next)
      return next
    })
    toast({ title: "Projeto excluído" })
  }

  const saveFirstName = (name: string) => {
    setPersisted((current) => {
      const next = { ...current, firstName: name }
      saveState(next)
      return next
    })
  }

  const signOut = () => {
    runtimeRef.current.stop()
    if (hydrated) persistGraph(nodes, edges)
    setStudioOpen(false)
    setPersisted((current) => {
      const next = { ...current, firstName: undefined }
      saveState(next)
      return next
    })
  }

  const exitToHub = () => {
    runtimeRef.current.stop()
    if (hydrated) persistGraph(nodes, edges)
    setStudioOpen(false)
  }

  const selectLesson = (lessonId: string) => {
    setPersisted((current) => {
      const next = {
        ...current,
        programs: current.programs.map((item) =>
          item.id === current.currentProgramId ? { ...item, lessonId } : item,
        ),
      }
      saveState(next)
      return next
    })
    setRightTab("licao")
  }

  const busy = snapshot.status === "running" || snapshot.status === "waiting-input" || snapshot.status === "paused"

  const listVariables = useMemo(() => collectListVariables(nodes as WorkflowNode[]), [nodes])
  const programVariables = useMemo(() => collectProgramVariables(nodes as WorkflowNode[]), [nodes])

  const togglePalette = () => {
    if (canDockPalette) setPaletteOpen((value) => !value)
    else setMobilePanel((panel) => (panel === "blocos" ? null : "blocos"))
  }

  const toggleMission = () => {
    setRightTab("licao")
    if (canDockMission) setMissionOpen((value) => !value)
    else setMobilePanel((panel) => (panel === "missao" ? null : "missao"))
  }

  const openBlockConfig = () => {
    setRightTab("bloco")
    if (canDockMission) setMissionOpen(true)
    else setMobilePanel("missao")
  }

  /** Em telas estreitas (e no toque) arrastar não funciona, então o clique adiciona no centro. */
  const addNodeAtCenter = useCallback(
    (type: string) => {
      if (!reactFlowInstance) return

      if (type === "start" && nodes.some((node) => node.type === "start")) {
        toast({
          title: "Já existe um Início",
          description: "Um programa só pode ter um ponto de partida.",
          variant: "destructive",
        })
        return
      }

      const bounds = reactFlowWrapper.current?.getBoundingClientRect()
      const position = reactFlowInstance.screenToFlowPosition({
        x: bounds ? bounds.x + bounds.width / 2 : window.innerWidth / 2,
        y: bounds ? bounds.y + bounds.height / 2 : window.innerHeight / 2,
      })

      const catalog = getCatalogItem(type)
      const newNode = createNode({
        type,
        position,
        id: generateNodeId(type),
        data: catalog ? { label: catalog.label, description: catalog.description, tip: catalog.tip } : undefined,
      })

      setNodes((current) => current.concat(newNode))
      setSelectedNodeId(newNode.id)
      setMobilePanel(null)
      openBlockConfig()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canDockMission, nodes, reactFlowInstance, setNodes, firstName],
  )

  const sidePanel = (
    <Tabs value={rightTab} onValueChange={setRightTab} className="flex h-full flex-col">
      <div className="border-b border-border px-4 pt-4">
        <TabsList className="grid h-11 w-full grid-cols-2">
          <TabsTrigger value="licao">Aula</TabsTrigger>
          <TabsTrigger value="bloco" disabled={!selectedNode}>
            Bloco
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="licao" className="mt-0 min-h-0 flex-1">
        <LessonPanel
          lessonId={program?.lessonId}
          completedLessons={persisted.completedLessons}
          nodes={nodes as WorkflowNode[]}
          snapshot={snapshot}
          onSelectLesson={selectLesson}
          onLoadExample={loadExample}
        />
      </TabsContent>
      <TabsContent value="bloco" className="mt-0 min-h-0 flex-1">
        {selectedNode ? (
          <NodeConfigPanel
            key={selectedNode.id}
            node={selectedNode}
            listVariables={listVariables}
            programVariables={programVariables}
            updateNodeData={updateNodeData}
            onClose={() => (canDockMission ? setSelectedNodeId(null) : setMobilePanel(null))}
          />
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            Clique em um bloco do canvas para configurar.
          </p>
        )}
      </TabsContent>
    </Tabs>
  )

  // O canvas muda de largura quando os painéis abrem ou fecham.
  useEffect(() => {
    if (!reactFlowInstance) return
    const timer = window.setTimeout(() => reactFlowInstance.fitView({ padding: 0.25, duration: 200 }), 220)
    return () => window.clearTimeout(timer)
  }, [paletteDocked, missionDocked, reactFlowInstance])

  // Ao girar o celular ou redimensionar a janela, reenquadra para não cortar o fluxo.
  useEffect(() => {
    if (!reactFlowInstance) return

    let timer = 0
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => reactFlowInstance.fitView({ padding: 0.25, duration: 200 }), 250)
    }

    window.addEventListener("resize", onResize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("resize", onResize)
    }
  }, [reactFlowInstance])

  const highlightedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          ...node.data,
          running: snapshot.currentNodeId === node.id,
        },
      })),
    [nodes, snapshot.currentNodeId],
  )

  const speedControls = (
    <>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 px-3.5 py-2">
        <Label htmlFor="step-mode" className="text-xs text-muted-foreground">
          Passo a passo
        </Label>
        <Switch
          id="step-mode"
          checked={persisted.stepMode}
          onCheckedChange={(stepMode) => {
            runtimeRef.current.setStepMode(stepMode)
            setPersisted((current) => {
              const next = { ...current, stepMode }
              saveState(next)
              return next
            })
          }}
        />
      </div>
      <div className="flex w-full items-center gap-2 xl:w-36">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-500 dark:text-cyan-400" />
        <Slider
          value={[persisted.speedMs]}
          min={250}
          max={1400}
          step={50}
          onValueChange={([speedMs]) => {
            runtimeRef.current.setDelay(speedMs)
            setPersisted((current) => {
              const next = { ...current, speedMs }
              saveState(next)
              return next
            })
          }}
        />
      </div>
    </>
  )

  if (!hydrated) {
    return (
      <div className="relative flex h-[100dvh] items-center justify-center space-bg text-muted-foreground">
        <p className="relative text-sm text-muted-foreground">Abrindo o estúdio...</p>
      </div>
    )
  }

  if (!firstName) {
    return <WelcomeScreen onSubmit={saveFirstName} />
  }

  if (!studioOpen) {
    return (
      <UserNameProvider name={firstName}>
        <ProjectHub
          programs={persisted.programs}
          currentProgramId={persisted.currentProgramId}
          onOpen={openProject}
          onCreate={createProject}
          onDelete={deleteProject}
          onSignOut={signOut}
        />
      </UserNameProvider>
    )
  }

  return (
    <UserNameProvider name={firstName}>
    <div className="relative flex h-[100dvh] flex-col overflow-hidden space-bg">
      <header className="relative z-10 flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card px-3 py-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary sm:h-10 sm:w-10">
            <span className="font-display text-base text-[#d4b483] sm:text-lg">LF</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
              Projeto
            </p>
            <Input
              value={program?.name ?? "Meu programa"}
              onChange={(event) => renameProgram(event.target.value)}
              aria-label="Nome do programa"
              className="h-8 w-full border-none bg-transparent px-0 text-base font-medium text-foreground shadow-none focus-visible:ring-0 sm:h-9 sm:text-lg"
            />
          </div>
          <Button size="sm" variant="outline" onClick={exitToHub} className="h-9 shrink-0 gap-1.5 px-3">
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">Projetos</span>
          </Button>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1">
            <Button
              size="sm"
              variant={paletteVisible ? "secondary" : "ghost"}
              onClick={togglePalette}
              title="Blocos de lógica"
              className="h-9 rounded-full px-3"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden md:inline">Blocos</span>
            </Button>
            <Button
              size="sm"
              variant={missionVisible ? "secondary" : "ghost"}
              onClick={toggleMission}
              title="Aulas e configuração"
              className="h-9 rounded-full px-3"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden md:inline">Aula</span>
            </Button>
          </div>

          <div className="flex flex-1 items-center gap-1 rounded-full border border-border bg-muted/40 p-1 sm:flex-none">
            {persisted.stepMode && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => runtimeRef.current.nextStep()}
                title="Próximo passo"
                className="h-9 rounded-full px-3"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}

            {snapshot.status === "running" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => runtimeRef.current.pause()}
                className="h-9 rounded-full px-3.5"
              >
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">Pausar</span>
              </Button>
            ) : snapshot.status === "waiting-input" ? (
              <Button size="sm" disabled className="h-9 rounded-full px-3.5">
                <span className="hidden sm:inline">Aguardando</span>
                <span className="sm:hidden">...</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => runtimeRef.current.play()}
                className="h-9 rounded-full px-4"
              >
                <Play className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline">{snapshot.status === "paused" ? "Continuar" : "Executar"}</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => runtimeRef.current.stop()}
              disabled={!busy && snapshot.status !== "done" && snapshot.status !== "error"}
              title="Parar execução"
              className="h-9 rounded-full px-3"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Parar</span>
            </Button>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" title="Velocidade e passo a passo" className="h-9 w-9 rounded-full p-0 xl:hidden">
                <Gauge className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ritmo da execução</p>
              {speedControls}
            </PopoverContent>
          </Popover>

          <div className="hidden items-center gap-2 xl:flex">{speedControls}</div>

          <ThemeToggle />
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 w-full flex-1 overflow-hidden">
        {paletteDocked && (
          <aside className="glass-panel w-64 shrink-0 overflow-hidden border-r xl:w-72 2xl:w-80">
            <NodeLibrary onPick={addNodeAtCenter} />
          </aside>
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative min-h-0 flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={highlightedNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={(instance) => {
                setReactFlowInstance(instance)
                window.setTimeout(() => instance.fitView({ padding: 0.25 }), 80)
              }}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={(_, node) => {
                setSelectedNodeId(node.id)
                openBlockConfig()
              }}
              onPaneClick={() => setSelectedNodeId(null)}
              isValidConnection={(connection) => {
                const source = nodes.find((node) => node.id === connection.source)
                const target = nodes.find((node) => node.id === connection.target)
                if (!source || !target) return false
                if (target.type === "start" || source.type === "end") return false
                return true
              }}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              snapToGrid
              snapGrid={[16, 16]}
              deleteKeyCode={["Backspace", "Delete"]}
              defaultEdgeOptions={{
                type: "custom",
                markerEnd: { type: MarkerType.ArrowClosed, color: isDarkCanvas ? "#d4b483" : "#1f2a3a" },
              }}
              connectionLineType={ConnectionLineType.SmoothStep}
            >
              {persisted.showCanvasDots && (
                <Background gap={24} color={isDarkCanvas ? "#2a3548" : "#e4dcd0"} size={1.2} />
              )}
              <Controls showInteractive={false} />
              <MiniMap
                className={showMiniMap ? undefined : "!hidden"}
                pannable
                zoomable
                nodeColor={(node) => {
                  const colors: Record<string, string> = {
                    start: "#10b981",
                    end: "#64748b",
                    variable: "#8b5cf6",
                    input: "#0ea5e9",
                    print: "#14b8a6",
                    condition: "#f59e0b",
                    switch: "#eab308",
                    loop: "#f97316",
                    list: "#ec4899",
                    function: "#6366f1",
                  }
                  return colors[node.type ?? ""] ?? "#94a3b8"
                }}
              />
            </ReactFlow>

            <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
              <Button
                className="pointer-events-auto px-2 sm:px-3"
                size="sm"
                variant="secondary"
                onClick={() => setConfirmAction("reset")}
              >
                <FastForward className="h-4 w-4" />
                <span className="hidden sm:inline">Exemplo inicial</span>
              </Button>
              <Button
                className="pointer-events-auto px-2 sm:px-3"
                size="sm"
                variant="ghost"
                onClick={() => setConfirmAction("clear")}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Limpar</span>
              </Button>
              <Button
                className="pointer-events-auto px-2 sm:px-3"
                size="sm"
                variant="ghost"
                onClick={autoLayoutNodes}
                title="Reorganizar blocos automaticamente"
              >
                <AlignHorizontalSpaceAround className="h-4 w-4" />
                <span className="hidden sm:inline">Auto ajustar</span>
              </Button>
              <Button
                className="pointer-events-auto px-2 sm:px-3"
                size="sm"
                variant={persisted.showCanvasDots ? "secondary" : "ghost"}
                onClick={toggleCanvasDots}
                title={persisted.showCanvasDots ? "Ocultar bolinhas do fundo" : "Mostrar bolinhas do fundo"}
              >
                <CircleDot className="h-4 w-4" />
                <span className="hidden sm:inline">Bolinhas</span>
              </Button>
            </div>
          </div>

          <div className="h-[34dvh] max-h-[280px] min-h-[132px] shrink-0">
            <RuntimePanel snapshot={snapshot} onSubmitInput={(value) => runtimeRef.current.submitInput(value)} />
          </div>
        </div>

        {missionDocked && (
          <aside className="glass-panel w-80 shrink-0 overflow-hidden border-l 2xl:w-96">{sidePanel}</aside>
        )}
      </div>

      <Sheet
        open={!canDockPalette && mobilePanel === "blocos"}
        onOpenChange={(open) => setMobilePanel(open ? "blocos" : null)}
      >
        <SheetContent side="left" className="w-[86vw] max-w-xs p-0 pt-10" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Blocos de lógica</SheetTitle>
          <NodeLibrary onPick={addNodeAtCenter} />
        </SheetContent>
      </Sheet>

      <Sheet
        open={!canDockMission && mobilePanel === "missao"}
        onOpenChange={(open) => setMobilePanel(open ? "missao" : null)}
      >
        <SheetContent side="right" className="w-[92vw] max-w-sm p-0 pt-10" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Missões e configuração do bloco</SheetTitle>
          {sidePanel}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "reset" ? "Carregar o exemplo inicial?" : "Limpar o canvas?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "reset"
                ? "O fluxo atual será substituído pelo exemplo inicial. Alterações não salvas serão perdidas."
                : "Todos os blocos serão removidos e só o Início ficará no canvas. Essa ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction === "clear" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
              onClick={() => {
                if (confirmAction === "reset") resetCanvas()
                if (confirmAction === "clear") clearCanvas()
                setConfirmAction(null)
              }}
            >
              {confirmAction === "reset" ? "Sim, carregar" : "Sim, limpar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </UserNameProvider>
  )
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <LogicFlowStudio />
    </ReactFlowProvider>
  )
}
