import { Position } from "reactflow"
import type { PersistedState, SavedProgram, WorkflowGraph, WorkflowNode } from "./types"

export const STORAGE_KEY = "logic-flow:state"
export const STORAGE_VERSION = 3 as const

const DEFAULT_SPEED_MS = 700

export function createProgramId(): string {
  return `prog-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function formatProgramDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function createSavedProgram(name: string, graph: WorkflowGraph, lessonId = "tipos"): SavedProgram {
  const now = new Date().toISOString()
  return {
    id: createProgramId(),
    name,
    graph,
    createdAt: now,
    updatedAt: now,
    lessonId,
  }
}

function withProgramTimestamps(program: SavedProgram): SavedProgram {
  const fallback = program.updatedAt ?? new Date().toISOString()
  return {
    ...program,
    createdAt: program.createdAt ?? fallback,
    updatedAt: program.updatedAt ?? fallback,
  }
}

function withHorizontalHandles(node: WorkflowNode): WorkflowNode {
  return {
    ...node,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }
}

function rotateGraphToHorizontal(graph: WorkflowGraph): WorkflowGraph {
  return {
    nodes: graph.nodes.map((node) =>
      withHorizontalHandles({
        ...node,
        position: { x: node.position.y + 40, y: Math.max(40, node.position.x * 0.55) },
      }),
    ),
    edges: graph.edges,
  }
}

/** O "para cada" saiu do bloco Lista e virou um modo do bloco Repetir. */
function moveForEachToLoop(graph: WorkflowGraph): WorkflowGraph {
  return {
    nodes: graph.nodes.map((node) => {
      if (node.type !== "list" || node.data.listOp !== ("paraCada" as typeof node.data.listOp)) {
        return node
      }
      return {
        ...node,
        type: "loop",
        data: {
          ...node.data,
          label: node.data.label === "Para cada" ? "Repetir" : node.data.label,
          listOp: undefined,
          loopType: "paraCada",
        },
      } as WorkflowNode
    }),
    edges: graph.edges,
  }
}

export function emptyPersistedState(defaultGraph: WorkflowGraph): PersistedState {
  const program = createSavedProgram("Meu primeiro programa", defaultGraph)

  return {
    version: STORAGE_VERSION,
    programs: [program],
    currentProgramId: program.id,
    completedLessons: [],
    speedMs: DEFAULT_SPEED_MS,
    stepMode: false,
    showCanvasDots: true,
    paletteOpen: true,
    missionOpen: true,
    mobilePanel: null,
    firstName: undefined,
  }
}

export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (!Array.isArray(parsed.programs)) return null

    if (parsed.version === STORAGE_VERSION) {
      return {
        ...parsed,
        showCanvasDots: parsed.showCanvasDots ?? true,
        paletteOpen: parsed.paletteOpen ?? true,
        missionOpen: parsed.missionOpen ?? true,
        mobilePanel: parsed.mobilePanel ?? null,
        firstName: parsed.firstName?.trim() || undefined,
        programs: parsed.programs.map((program) => ({
          ...withProgramTimestamps(program),
          graph: {
            ...program.graph,
            nodes: program.graph.nodes.map(withHorizontalHandles),
          },
        })),
      }
    }

    if (parsed.version === 1 || parsed.version === 2) {
      const migrated: PersistedState = {
        ...parsed,
        version: STORAGE_VERSION,
        showCanvasDots: parsed.showCanvasDots ?? true,
        paletteOpen: parsed.paletteOpen ?? true,
        missionOpen: parsed.missionOpen ?? true,
        mobilePanel: parsed.mobilePanel ?? null,
        firstName: parsed.firstName?.trim() || undefined,
        programs: parsed.programs.map((program) => ({
          ...withProgramTimestamps(program),
          graph: moveForEachToLoop(
            parsed.version === 1 ? rotateGraphToHorizontal(program.graph) : program.graph,
          ),
        })),
      }
      saveState(migrated)
      return migrated
    }

    return null
  } catch {
    return null
  }
}

export function saveState(state: PersistedState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function currentProgram(state: PersistedState): SavedProgram | undefined {
  return state.programs.find((program) => program.id === state.currentProgramId)
}
