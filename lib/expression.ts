import { callFunction } from "./functions"
import type { RuntimeValue } from "./types"
import { asBoolean, asNumber, asString, cloneValue, valuesAreEqual } from "./values"

export class ExpressionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ExpressionError"
  }
}

type Token =
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "ident"; value: string }
  | { kind: "op"; value: string }
  | { kind: "eof" }

const TWO_CHAR_OPS = ["==", "!=", ">=", "<=", "&&", "||"]
const ONE_CHAR_OPS = ["+", "-", "*", "/", "%", ">", "<", "!", "(", ")", "[", "]", ","]

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < source.length) {
    const char = source[i]

    if (/\s/.test(char)) {
      i += 1
      continue
    }

    const two = source.slice(i, i + 2)
    if (TWO_CHAR_OPS.includes(two)) {
      tokens.push({ kind: "op", value: two })
      i += 2
      continue
    }

    if (ONE_CHAR_OPS.includes(char)) {
      tokens.push({ kind: "op", value: char })
      i += 1
      continue
    }

    if (char === '"' || char === "'") {
      const quote = char
      i += 1
      let value = ""
      while (i < source.length && source[i] !== quote) {
        if (source[i] === "\\" && i + 1 < source.length) {
          value += source[i + 1]
          i += 2
          continue
        }
        value += source[i]
        i += 1
      }
      if (source[i] !== quote) {
        throw new ExpressionError("Você esqueceu de fechar as aspas.")
      }
      i += 1
      tokens.push({ kind: "string", value })
      continue
    }

    if (/[0-9]/.test(char) || (char === "." && /[0-9]/.test(source[i + 1] ?? ""))) {
      const start = i
      while (i < source.length && /[0-9.]/.test(source[i])) i += 1
      const raw = source.slice(start, i)
      const value = Number(raw)
      if (!Number.isFinite(value)) {
        throw new ExpressionError(`Número inválido: ${raw}`)
      }
      tokens.push({ kind: "number", value })
      continue
    }

    if (/[A-Za-zÀ-ÿ_]/.test(char)) {
      const start = i
      while (i < source.length && /[A-Za-zÀ-ÿ0-9_]/.test(source[i])) i += 1
      tokens.push({ kind: "ident", value: source.slice(start, i) })
      continue
    }

    throw new ExpressionError(`Não entendi este símbolo: ${char}`)
  }

  tokens.push({ kind: "eof" })
  return tokens
}

class Parser {
  private index = 0

  constructor(
    private tokens: Token[],
    private memory: Record<string, RuntimeValue>,
  ) {}

  parse(): RuntimeValue {
    if (this.peek().kind === "eof") {
      throw new ExpressionError("A expressão está vazia.")
    }
    const value = this.parseOr()
    if (this.peek().kind !== "eof") {
      throw new ExpressionError("Sobrou algo na expressão. Confira parênteses e operadores.")
    }
    return value
  }

  private parseOr(): RuntimeValue {
    let left = this.parseAnd()
    while (this.match("||")) {
      const right = this.parseAnd()
      left = { type: "logico", value: asBoolean(left) || asBoolean(right) }
    }
    return left
  }

  private parseAnd(): RuntimeValue {
    let left = this.parseEquality()
    while (this.match("&&")) {
      const right = this.parseEquality()
      left = { type: "logico", value: asBoolean(left) && asBoolean(right) }
    }
    return left
  }

  private parseEquality(): RuntimeValue {
    let left = this.parseComparison()
    while (true) {
      if (this.match("==")) {
        left = { type: "logico", value: this.equals(left, this.parseComparison()) }
      } else if (this.match("!=")) {
        left = { type: "logico", value: !this.equals(left, this.parseComparison()) }
      } else {
        break
      }
    }
    return left
  }

  private parseComparison(): RuntimeValue {
    let left = this.parseAdd()
    while (true) {
      const op = this.matchAny([">", "<", ">=", "<="])
      if (!op) break
      const right = this.parseAdd()
      const a = asNumber(left, "Comparação")
      const b = asNumber(right, "Comparação")
      const value =
        op === ">" ? a > b : op === "<" ? a < b : op === ">=" ? a >= b : a <= b
      left = { type: "logico", value }
    }
    return left
  }

  private parseAdd(): RuntimeValue {
    let left = this.parseMul()
    while (true) {
      if (this.match("+")) {
        const right = this.parseMul()
        left = this.add(left, right)
      } else if (this.match("-")) {
        const right = this.parseMul()
        left = {
          type: "numero",
          value: asNumber(left, "Subtração") - asNumber(right, "Subtração"),
        }
      } else {
        break
      }
    }
    return left
  }

  private parseMul(): RuntimeValue {
    let left = this.parseUnary()
    while (true) {
      if (this.match("*")) {
        const right = this.parseUnary()
        left = {
          type: "numero",
          value: asNumber(left, "Multiplicação") * asNumber(right, "Multiplicação"),
        }
      } else if (this.match("/")) {
        const right = this.parseUnary()
        const divisor = asNumber(right, "Divisão")
        if (divisor === 0) throw new ExpressionError("Não dá para dividir por zero.")
        left = { type: "numero", value: asNumber(left, "Divisão") / divisor }
      } else if (this.match("%")) {
        const right = this.parseUnary()
        const divisor = asNumber(right, "Resto")
        if (divisor === 0) throw new ExpressionError("Não dá para calcular resto com zero.")
        left = { type: "numero", value: asNumber(left, "Resto") % divisor }
      } else {
        break
      }
    }
    return left
  }

  private parseUnary(): RuntimeValue {
    if (this.match("!")) {
      return { type: "logico", value: !asBoolean(this.parseUnary()) }
    }
    if (this.match("-")) {
      return { type: "numero", value: -asNumber(this.parseUnary(), "Número negativo") }
    }
    return this.parsePostfix()
  }

  private parsePostfix(): RuntimeValue {
    let value = this.parsePrimary()
    while (this.match("[")) {
      const indexValue = this.parseOr()
      this.expect("]", "Faltou ] para acessar o item da lista.")
      if (value.type !== "lista") {
        throw new ExpressionError("Só listas podem usar [índice].")
      }
      const index = Math.trunc(asNumber(indexValue, "Índice da lista"))
      if (index < 0 || index >= value.value.length) {
        throw new ExpressionError(
          `A lista não tem o índice ${index}. Ela tem ${value.value.length} item(ns), de 0 a ${Math.max(value.value.length - 1, 0)}.`,
        )
      }
      value = cloneValue(value.value[index])
    }
    return value
  }

  private parsePrimary(): RuntimeValue {
    const token = this.peek()

    if (token.kind === "number") {
      this.index += 1
      return { type: "numero", value: token.value }
    }

    if (token.kind === "string") {
      this.index += 1
      return { type: "texto", value: token.value }
    }

    if (this.match("[")) {
      const items: RuntimeValue[] = []
      if (!this.check("]")) {
        do {
          items.push(this.parseOr())
        } while (this.match(","))
      }
      this.expect("]", "Faltou ] para fechar a lista.")
      return { type: "lista", value: items }
    }

    if (this.match("(")) {
      const value = this.parseOr()
      this.expect(")", "Faltou ) para fechar o parêntese.")
      return value
    }

    if (token.kind === "ident") {
      this.index += 1
      const name = token.value
      const literal = this.boolLiteral(name)
      if (literal) return literal

      if (this.match("(")) {
        const args: RuntimeValue[] = []
        if (!this.check(")")) {
          do {
            args.push(this.parseOr())
          } while (this.match(","))
        }
        this.expect(")", `Faltou ) na função ${name}.`)
        return this.callFunction(name, args)
      }

      const stored = this.memory[name]
      if (!stored) {
        throw new ExpressionError(`A variável "${name}" ainda não existe. Crie ela antes de usar.`)
      }
      return cloneValue(stored)
    }

    throw new ExpressionError("Expressão incompleta. Confira se faltou um valor.")
  }

  private callFunction(name: string, args: RuntimeValue[]): RuntimeValue {
    try {
      return callFunction(name, args)
    } catch (error) {
      throw new ExpressionError(error instanceof Error ? error.message : `Erro na função ${name}().`)
    }
  }

  private boolLiteral(name: string): RuntimeValue | null {
    const normalized = name.toLowerCase()
    if (["verdadeiro", "true", "sim"].includes(normalized)) return { type: "logico", value: true }
    if (["falso", "false", "nao", "não"].includes(normalized)) return { type: "logico", value: false }
    return null
  }

  private add(left: RuntimeValue, right: RuntimeValue): RuntimeValue {
    if (left.type === "texto" || right.type === "texto") {
      return { type: "texto", value: asString(left) + asString(right) }
    }
    return {
      type: "numero",
      value: asNumber(left, "Soma") + asNumber(right, "Soma"),
    }
  }

  private equals(left: RuntimeValue, right: RuntimeValue): boolean {
    return valuesAreEqual(left, right)
  }

  private peek(): Token {
    return this.tokens[this.index]
  }

  private check(op: string): boolean {
    const token = this.peek()
    return token.kind === "op" && token.value === op
  }

  private match(op: string): boolean {
    if (!this.check(op)) return false
    this.index += 1
    return true
  }

  private matchAny(ops: string[]): string | null {
    for (const op of ops) {
      if (this.match(op)) return op
    }
    return null
  }

  private expect(op: string, message: string) {
    if (!this.match(op)) throw new ExpressionError(message)
  }
}

export function evaluateExpression(source: string, memory: Record<string, RuntimeValue>): RuntimeValue {
  const parser = new Parser(tokenize(source), memory)
  return parser.parse()
}

/** Aceita `{variavel}` como atalho didático, igual ao bloco Mostrar. */
export function evaluateUserExpression(source: string, memory: Record<string, RuntimeValue>): RuntimeValue {
  const normalized = source.trim().replace(/\{([^}]+)\}/g, (_, inner: string) => inner.trim())
  return evaluateExpression(normalized, memory)
}

export function interpolateTemplate(template: string, memory: Record<string, RuntimeValue>): string {
  return template.replace(/\{([^}]+)\}/g, (_, expr: string) => asString(evaluateExpression(expr.trim(), memory)))
}

export function parseListItems(
  source: string,
  memory: Record<string, RuntimeValue>,
): Extract<RuntimeValue, { type: "lista" }> {
  const trimmed = source.trim()
  if (!trimmed) return { type: "lista", value: [] }
  const wrapped = trimmed.startsWith("[") ? trimmed : `[${trimmed}]`
  const value = evaluateUserExpression(wrapped, memory)
  if (value.type !== "lista") {
    throw new ExpressionError("Isso não virou uma lista.")
  }
  return value
}
