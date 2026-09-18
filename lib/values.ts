import type { DataType, RuntimeValue } from "./types"

export const DATA_TYPE_LABEL: Record<DataType, string> = {
  texto: "Texto",
  numero: "Número",
  logico: "Lógico",
  lista: "Lista",
}

export const DATA_TYPE_TIP: Record<DataType, string> = {
  texto: 'Palavras entre aspas, tipo "Ana"',
  numero: "Quantidades, tipo 10 ou 3.5",
  logico: "Verdadeiro ou falso — respostas de sim/não",
  lista: 'Itens separados por vírgula. Ex: "pera", "maçã"  ou  ["pera", "maçã"]',
}

export function makeValue(type: DataType, value: RuntimeValue["value"]): RuntimeValue {
  return { type, value } as RuntimeValue
}

export function formatValue(value: RuntimeValue | undefined): string {
  if (!value) return "—"
  switch (value.type) {
    case "texto":
      return `"${value.value}"`
    case "numero":
      return Number.isFinite(value.value) ? String(value.value) : "∞"
    case "logico":
      return value.value ? "verdadeiro" : "falso"
    case "lista":
      return `[${value.value.map((item) => formatValue(item)).join(", ")}]`
  }
}

export function describeType(value: RuntimeValue): string {
  return DATA_TYPE_LABEL[value.type]
}

export function asBoolean(value: RuntimeValue): boolean {
  switch (value.type) {
    case "logico":
      return value.value
    case "numero":
      return value.value !== 0
    case "texto":
      return value.value.length > 0
    case "lista":
      return value.value.length > 0
  }
}

export function asNumber(value: RuntimeValue, context: string): number {
  if (value.type === "numero") return value.value
  if (value.type === "texto") {
    const parsed = Number(value.value.replace(",", "."))
    if (Number.isFinite(parsed)) return parsed
  }
  if (value.type === "logico") return value.value ? 1 : 0
  throw new Error(`${context} precisa de um número, mas recebeu ${describeType(value)}.`)
}

export function asString(value: RuntimeValue): string {
  switch (value.type) {
    case "texto":
      return value.value
    case "numero":
      return String(value.value)
    case "logico":
      return value.value ? "verdadeiro" : "falso"
    case "lista":
      return formatValue(value)
  }
}

export function coerceInput(raw: string, dataType: DataType): RuntimeValue {
  const trimmed = raw.trim()

  switch (dataType) {
    case "texto":
      return { type: "texto", value: raw }
    case "numero": {
      const parsed = Number(trimmed.replace(",", "."))
      if (!Number.isFinite(parsed)) {
        throw new Error(`"${raw}" não parece um número. Tente 10 ou 3.5`)
      }
      return { type: "numero", value: parsed }
    }
    case "logico": {
      const normalized = trimmed.toLowerCase()
      if (["verdadeiro", "true", "sim", "1", "v"].includes(normalized)) {
        return { type: "logico", value: true }
      }
      if (["falso", "false", "nao", "não", "0", "f"].includes(normalized)) {
        return { type: "logico", value: false }
      }
      throw new Error(`"${raw}" não é lógico. Use verdadeiro ou falso.`)
    }
    case "lista": {
      if (!trimmed) return { type: "lista", value: [] }
      const parts = trimmed.split(",").map((part) => part.trim()).filter(Boolean)
      return {
        type: "lista",
        value: parts.map((part) => {
          const asNum = Number(part.replace(",", "."))
          if (Number.isFinite(asNum) && part !== "") return { type: "numero" as const, value: asNum }
          if (["verdadeiro", "falso", "true", "false"].includes(part.toLowerCase())) {
            return { type: "logico" as const, value: ["verdadeiro", "true"].includes(part.toLowerCase()) }
          }
          return { type: "texto" as const, value: part.replace(/^["']|["']$/g, "") }
        }),
      }
    }
  }
}

export function isValidIdentifier(name: string): boolean {
  return /^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*$/.test(name)
}

export function cloneValue(value: RuntimeValue): RuntimeValue {
  if (value.type === "lista") {
    return { type: "lista", value: value.value.map(cloneValue) }
  }
  return { ...value }
}

export function valuesAreEqual(left: RuntimeValue, right: RuntimeValue): boolean {
  if (left.type === "lista" || right.type === "lista") {
    return JSON.stringify(left) === JSON.stringify(right)
  }
  if (left.type === "texto" || right.type === "texto") {
    return asString(left) === asString(right)
  }
  if (left.type === "logico" && right.type === "logico") {
    return left.value === right.value
  }
  return asNumber(left, "Igualdade") === asNumber(right, "Igualdade")
}
