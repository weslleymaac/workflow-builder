import {
  evaluateCondition,
  evaluateConditions,
  formatConditionDisplay,
  formatConditionsDisplay,
  getConditionRules,
} from "./condition"
import { evaluateUserExpression, interpolateTemplate, parseListItems } from "./expression"
import { callFunction, findFunction } from "./functions"
import type {
  RuntimeSnapshot,
  RuntimeStatus,
  RuntimeValue,
  WorkflowEdge,
  WorkflowNode,
} from "./types"
import { cloneValue, coerceInput, formatValue, isValidIdentifier, valuesAreEqual } from "./values"

const MAX_STEPS = 4000

type Listener = (snapshot: RuntimeSnapshot) => void

const idleSnapshot = (): RuntimeSnapshot => ({
  status: "idle",
  currentNodeId: null,
  memory: {},
  logs: [],
  inputPrompt: null,
  stepCount: 0,
})

export class LogicRuntime {
  private snapshot: RuntimeSnapshot = idleSnapshot()
  private listeners = new Set<Listener>()
  private nodes: WorkflowNode[] = []
  private edges: WorkflowEdge[] = []
  private delayMs = 700
  private stepMode = false
  private runToken = 0
  private pauseGate: (() => void) | null = null
  private stepGate: (() => void) | null = null
  private inputGate: ((value: string) => void) | null = null
  private loopReady = new Set<string>()
  private foreachIndex = new Map<string, number>()

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    listener(this.snapshot)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot() {
    return this.snapshot
  }

  configure(nodes: WorkflowNode[], edges: WorkflowEdge[], options?: { delayMs?: number; stepMode?: boolean }) {
    this.nodes = nodes
    this.edges = edges
    if (typeof options?.delayMs === "number") this.delayMs = options.delayMs
    if (typeof options?.stepMode === "boolean") this.stepMode = options.stepMode
  }

  setDelay(delayMs: number) {
    this.delayMs = delayMs
  }

  setStepMode(stepMode: boolean) {
    this.stepMode = stepMode
    if (!stepMode) this.stepGate?.()
  }

  async play() {
    if (this.snapshot.status === "paused") {
      this.setStatus("running")
      this.pauseGate?.()
      this.pauseGate = null
      return
    }
    if (this.snapshot.status === "running" || this.snapshot.status === "waiting-input") return
    await this.start()
  }

  pause() {
    if (this.snapshot.status !== "running") return
    this.setStatus("paused")
  }

  stop() {
    this.runToken += 1
    this.pauseGate?.()
    this.stepGate?.()
    this.inputGate?.("")
    this.pauseGate = null
    this.stepGate = null
    this.inputGate = null
    this.loopReady.clear()
    this.foreachIndex.clear()
    this.patch({
      ...idleSnapshot(),
      logs: [{ id: this.logId(), kind: "system", message: "Execução interrompida." }],
    })
  }

  nextStep() {
    this.stepGate?.()
    this.stepGate = null
    if (this.snapshot.status === "paused") {
      this.setStatus("running")
      this.pauseGate?.()
      this.pauseGate = null
    }
  }

  submitInput(raw: string) {
    if (this.snapshot.status !== "waiting-input") return
    this.inputGate?.(raw)
  }

  private async start() {
    const token = ++this.runToken
    this.loopReady.clear()
    this.foreachIndex.clear()
    this.patch({
      status: "running",
      currentNodeId: null,
      memory: {},
      logs: [{ id: this.logId(), kind: "system", message: "Vamos lá! Seguindo o fluxo..." }],
      inputPrompt: null,
      error: undefined,
      stepCount: 0,
    })

    try {
      const startNodes = this.nodes.filter((node) => node.type === "start")
      if (startNodes.length === 0) {
        throw new Error("Falta o bloco Início. Arraste ele para o canvas.")
      }
      if (startNodes.length > 1) {
        throw new Error("Tem mais de um Início. Deixe só um ponto de partida.")
      }

      let current: WorkflowNode | undefined = startNodes[0]

      while (current && token === this.runToken) {
        await this.waitTurn(token)
        if (token !== this.runToken) return

        this.patch({
          currentNodeId: current.id,
          stepCount: this.snapshot.stepCount + 1,
        })

        if (this.snapshot.stepCount > MAX_STEPS) {
          throw new Error("O programa repetiu demais. Será que o loop nunca termina?")
        }

        const result = await this.executeNode(current, token)
        if (token !== this.runToken) return

        if (result === "end") {
          this.patch({
            status: "done",
            currentNodeId: current.id,
            logs: this.pushLog("system", "Pronto! Programa concluído."),
          })
          return
        }

        current = result
      }

      if (token === this.runToken) {
        this.patch({
          status: "done",
          currentNodeId: null,
          logs: this.pushLog("info", "O fluxo acabou porque não havia próximo bloco."),
        })
      }
    } catch (error) {
      if (token !== this.runToken) return
      const message = error instanceof Error ? error.message : "Algo deu errado."
      this.patch({
        status: "error",
        error: message,
        logs: this.pushLog("error", message),
        inputPrompt: null,
      })
    }
  }

  private async executeNode(node: WorkflowNode, token: number): Promise<WorkflowNode | "end"> {
    switch (node.type) {
      case "start":
        this.info("Começando o programa.")
        return this.next(node)
      case "end":
        return "end"
      case "variable":
        this.assignVariable(node)
        return this.next(node)
      case "input":
        await this.readInput(node, token)
        return this.next(node)
      case "print":
        this.print(node)
        return this.next(node)
      case "condition":
        return this.branch(node)
      case "switch":
        return this.switchBranch(node)
      case "loop":
        return this.loop(node)
      case "list":
        return this.list(node)
      case "function":
        this.runFunction(node)
        return this.next(node)
      default:
        throw new Error(`Bloco desconhecido: ${node.type}`)
    }
  }

  private assignVariable(node: WorkflowNode) {
    const name = this.requireName(node.data.variableName, "Dê um nome para a variável.")
    const expr = node.data.valueExpr?.trim()
    if (!expr) throw new Error(`A variável "${name}" precisa de um valor.`)
    const value = evaluateUserExpression(expr, this.snapshot.memory)
    this.write(name, value)
    this.info(`${name} agora é ${formatValue(value)} (${value.type}).`)
  }

  private async readInput(node: WorkflowNode, token: number) {
    const name = this.requireName(node.data.variableName, "Dê um nome para guardar a resposta.")
    const dataType = node.data.dataType ?? "texto"
    const message = node.data.prompt?.trim() || `Digite um valor para ${name}`

    this.patch({
      status: "waiting-input",
      inputPrompt: { nodeId: node.id, variableName: name, dataType, message },
      logs: this.pushLog("info", `Aguardando resposta: ${message}`),
    })

    const raw = await new Promise<string>((resolve) => {
      this.inputGate = resolve
    })

    if (token !== this.runToken) return

    const value = coerceInput(raw, dataType)
    this.write(name, value)
    this.patch({
      status: "running",
      inputPrompt: null,
      logs: this.pushLog("info", `${name} recebeu ${formatValue(value)}.`),
    })
  }

  private print(node: WorkflowNode) {
    const template = node.data.template ?? ""
    const message = interpolateTemplate(template, this.snapshot.memory)
    this.patch({
      logs: this.pushLog("output", message),
    })
  }

  private branch(node: WorkflowNode): WorkflowNode | "end" {
    const rules = getConditionRules(node.data)
    const expr = formatConditionsDisplay(rules)
    const passed = evaluateConditions(rules, this.snapshot.memory)
    this.info(`${expr} → ${passed ? "SIM" : "NÃO"}`)
    return this.next(node, passed ? "true" : "false")
  }

  private switchBranch(node: WorkflowNode): WorkflowNode | "end" {
    const expr = node.data.switchExpr?.trim()
    if (!expr) throw new Error(`O bloco "${node.data.label}" precisa de uma variável ou expressão para comparar.`)

    const value = evaluateUserExpression(expr, this.snapshot.memory)
    const cases = node.data.switchCases ?? []

    for (const item of cases) {
      const match = evaluateUserExpression(item.matchExpr || '""', this.snapshot.memory)
      if (valuesAreEqual(value, match)) {
        this.info(`Switch ${formatValue(value)} = ${item.matchExpr} → ${item.label || item.id}`)
        return this.next(node, item.id)
      }
    }

    this.info(`Switch ${formatValue(value)} → padrão (${node.data.defaultLabel || "outro"})`)
    return this.next(node, "default")
  }

  private loop(node: WorkflowNode): WorkflowNode | "end" {
    const type = node.data.loopType ?? "para"

    if (type === "para") {
      const counter = this.requireName(node.data.counterVar, "O loop Para precisa de um contador, tipo i.")
      const from = evaluateUserExpression(node.data.fromExpr || "1", this.snapshot.memory)
      const to = evaluateUserExpression(node.data.toExpr || "5", this.snapshot.memory)
      const step = evaluateUserExpression(node.data.stepExpr || "1", this.snapshot.memory)
      if (from.type !== "numero" || to.type !== "numero" || step.type !== "numero") {
        throw new Error("No loop Para, de / até / passo precisam ser números.")
      }
      if (!this.loopReady.has(node.id)) {
        this.write(counter, { type: "numero", value: from.value })
        this.loopReady.add(node.id)
      } else {
        const current = this.snapshot.memory[counter]
        if (!current || current.type !== "numero") {
          throw new Error(`O contador ${counter} precisa ser um número.`)
        }
        this.write(counter, { type: "numero", value: current.value + step.value })
      }

      const current = this.snapshot.memory[counter]
      const keepGoing =
        current?.type === "numero" &&
        (step.value >= 0 ? current.value <= to.value : current.value >= to.value)

      this.info(`${counter} = ${formatValue(current)} · continua? ${keepGoing ? "sim" : "não"}`)

      if (!keepGoing) {
        this.loopReady.delete(node.id)
        return this.next(node, "done")
      }
      return this.next(node, "body")
    }

    if (type === "paraCada") {
      const listName = this.requireName(node.data.listName, "Escolha qual lista o loop vai percorrer.")
      const itemVar = this.requireName(node.data.itemVar, "Diga o nome de cada item, tipo fruta.")
      const list = this.snapshot.memory[listName]

      if (!list || list.type !== "lista") {
        throw new Error(`"${listName}" não é uma lista ainda. Crie a lista antes do loop.`)
      }

      const index = this.foreachIndex.get(node.id) ?? 0
      if (index >= list.value.length) {
        this.foreachIndex.delete(node.id)
        this.info(`Acabaram os itens de ${listName}. O para cada terminou.`)
        return this.next(node, "done")
      }

      this.write(itemVar, cloneValue(list.value[index]))
      this.info(
        `${itemVar} = ${listName}[${index}] → ${formatValue(list.value[index])} (item ${index + 1} de ${list.value.length})`,
      )
      this.foreachIndex.set(node.id, index + 1)
      return this.next(node, "body")
    }

    const operator = node.data.operator ?? "=="
    const expr = formatConditionDisplay(node.data.leftExpr, operator, node.data.rightExpr)
    const keepGoing = evaluateCondition(
      node.data.leftExpr || "falso",
      operator,
      node.data.rightExpr,
      this.snapshot.memory,
    )
    this.info(`Enquanto ${expr} → ${keepGoing ? "repete" : "para"}`)
    if (!keepGoing) {
      this.loopReady.delete(node.id)
      return this.next(node, "done")
    }
    this.loopReady.add(node.id)
    return this.next(node, "body")
  }

  private runFunction(node: WorkflowNode) {
    const target = this.requireName(node.data.targetVar, "Diga em qual variável guardar o resultado.")
    const fn = findFunction(node.data.functionName)
    if (!fn) {
      throw new Error(`Escolha uma função no bloco "${node.data.label}".`)
    }

    const args = fn.params.map((param, index) => {
      const source = node.data.functionArgs?.[index]?.trim()
      if (!source) {
        throw new Error(`Falta preencher "${param.label}" na função ${fn.name}().`)
      }
      return evaluateUserExpression(source, this.snapshot.memory)
    })

    const value = callFunction(fn.name, args)
    this.write(target, value)
    this.info(
      `${target} = ${fn.name}(${args.map((arg) => formatValue(arg)).join(", ")}) → ${formatValue(value)}`,
    )
  }

  private list(node: WorkflowNode): WorkflowNode | "end" {
    const op = node.data.listOp ?? "criar"
    const listName = this.requireName(node.data.listName, "Dê um nome para a lista.")

    if (op === "criar") {
      const value = parseListItems(node.data.itemsExpr || "", this.snapshot.memory)
      this.write(listName, value)
      this.info(`Lista ${listName} criada com ${value.value.length} item(ns): ${formatValue(value)}`)
      return this.next(node)
    }

    const list = this.snapshot.memory[listName]
    if (!list || list.type !== "lista") {
      throw new Error(`"${listName}" não é uma lista ainda. Crie ela antes.`)
    }

    if (op === "adicionar") {
      const item = evaluateUserExpression(node.data.valueExpr || '""', this.snapshot.memory)
      const next: RuntimeValue = { type: "lista", value: [...list.value, item] }
      this.write(listName, next)
      this.info(`Adicionei ${formatValue(item)} em ${listName}. Agora: ${formatValue(next)}`)
      return this.next(node)
    }

    if (op === "obter") {
      const target = this.requireName(node.data.targetVar, "Diga em qual variável guardar o item.")
      const indexValue = evaluateUserExpression(node.data.indexExpr || "0", this.snapshot.memory)
      const index = indexValue.type === "numero" ? Math.trunc(indexValue.value) : Number.NaN
      if (!Number.isFinite(index) || index < 0 || index >= list.value.length) {
        throw new Error(`Índice ${node.data.indexExpr} inválido para ${listName}. Lembre: o primeiro é 0.`)
      }
      const item = cloneValue(list.value[index])
      this.write(target, item)
      this.info(`${target} = ${listName}[${index}] → ${formatValue(item)}`)
      return this.next(node)
    }

    const target = this.requireName(node.data.targetVar, "Diga onde guardar o tamanho.")
    this.write(target, { type: "numero", value: list.value.length })
    this.info(`${target} = tamanho(${listName}) → ${list.value.length}`)
    return this.next(node)
  }

  private next(node: WorkflowNode, handle?: string): WorkflowNode | "end" {
    const outgoing = this.edges.filter((edge) => {
      if (edge.source !== node.id) return false
      if (!handle) return !edge.sourceHandle || edge.sourceHandle === "source"
      return edge.sourceHandle === handle
    })

    if (outgoing.length === 0) {
      if (node.type === "end") return "end"
      const label =
        handle === "true"
          ? "SIM"
          : handle === "false"
            ? "NÃO"
            : handle === "body"
              ? "corpo"
              : handle === "done"
                ? "depois"
                : handle === "default"
                  ? "padrão"
                  : "próximo"
      throw new Error(`O bloco "${node.data.label}" não tem caminho ${label}. Ligue a setinha.`)
    }

    if (outgoing.length > 1 && node.type !== "condition" && node.type !== "loop" && node.type !== "switch") {
      throw new Error(`O bloco "${node.data.label}" tem mais de uma saída. Deixe só um caminho.`)
    }

    const targetId = outgoing[0].target
    const target = this.nodes.find((item) => item.id === targetId)
    if (!target) throw new Error("A conexão aponta para um bloco que não existe mais.")
    return target
  }

  private write(name: string, value: RuntimeValue) {
    this.patch({
      memory: {
        ...this.snapshot.memory,
        [name]: cloneValue(value),
      },
    })
  }

  private requireName(name: string | undefined, message: string) {
    const trimmed = name?.trim() ?? ""
    if (!trimmed) throw new Error(message)
    if (!isValidIdentifier(trimmed)) {
      throw new Error(`"${trimmed}" não é um nome válido. Use letras, sem espaços. Ex: idade`)
    }
    return trimmed
  }

  private info(message: string) {
    this.patch({ logs: this.pushLog("info", message) })
  }

  private pushLog(kind: RuntimeSnapshot["logs"][number]["kind"], message: string) {
    return [...this.snapshot.logs, { id: this.logId(), kind, message }].slice(-80)
  }

  private logId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  }

  private async waitTurn(token: number) {
    if (this.stepMode) {
      await new Promise<void>((resolve) => {
        this.stepGate = resolve
      })
    } else {
      await this.sleep(this.delayMs)
    }

    if (token !== this.runToken) return

    if (this.snapshot.status === "paused") {
      await new Promise<void>((resolve) => {
        this.pauseGate = resolve
      })
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private setStatus(status: RuntimeStatus) {
    this.patch({ status })
  }

  private patch(partial: Partial<RuntimeSnapshot>) {
    this.snapshot = { ...this.snapshot, ...partial }
    this.listeners.forEach((listener) => listener(this.snapshot))
  }
}
