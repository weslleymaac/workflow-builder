import { evaluateUserExpression } from "./expression"
import type { CompareOperator, DataType, RuntimeValue } from "./types"
import { asBoolean, asNumber, asString, valuesAreEqual } from "./values"

export type InferredType = DataType | "desconhecido"

export const OPERATOR_LABEL: Record<CompareOperator, string> = {
  "==": "igual a (=)",
  "!=": "diferente de (≠)",
  ">": "maior que (>)",
  "<": "menor que (<)",
  ">=": "maior ou igual (≥)",
  "<=": "menor ou igual (≤)",
  contem: "contém",
  naoContem: "não contém",
  comecaCom: "começa com",
  terminaCom: "termina com",
  vazia: "está vazia",
  naoVazia: "não está vazia",
  verdadeiro: "é verdadeiro",
  falso: "é falso",
}

export const OPERATOR_SYMBOL: Record<CompareOperator, string> = {
  "==": "==",
  "!=": "!=",
  ">": ">",
  "<": "<",
  ">=": ">=",
  "<=": "<=",
  contem: "contém",
  naoContem: "não contém",
  comecaCom: "começa com",
  terminaCom: "termina com",
  vazia: "está vazia",
  naoVazia: "não está vazia",
  verdadeiro: "é verdadeiro",
  falso: "é falso",
}

const NUMERIC_OPS: CompareOperator[] = ["==", "!=", ">", "<", ">=", "<="]
const TEXT_OPS: CompareOperator[] = ["==", "!=", "contem", "naoContem", "comecaCom", "terminaCom", "vazia", "naoVazia"]
const LOGIC_OPS: CompareOperator[] = ["==", "!=", "verdadeiro", "falso"]
const LIST_OPS: CompareOperator[] = ["==", "!=", "contem", "naoContem", "vazia", "naoVazia"]
const UNKNOWN_OPS: CompareOperator[] = NUMERIC_OPS

export const UNARY_OPERATORS: CompareOperator[] = ["vazia", "naoVazia", "verdadeiro", "falso"]

export interface TypedVariable {
  name: string
  dataType: DataType
}

export function unwrapVariableName(expr: string): string | null {
  const trimmed = expr.trim()
  const wrapped = trimmed.match(/^\{([^}]+)\}$/)
  if (wrapped) {
    const inner = wrapped[1].trim()
    return /^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*$/.test(inner) ? inner : null
  }
  if (/^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*$/.test(trimmed)) return trimmed
  return null
}

export function inferExpressionType(expr: string, variables: TypedVariable[]): InferredType {
  const trimmed = expr.trim()
  if (!trimmed) return "desconhecido"

  const varName = unwrapVariableName(trimmed)
  if (varName) {
    const found = variables.find((item) => item.name === varName)
    if (found) return found.dataType
  }

  if (/^["']/.test(trimmed)) return "texto"
  if (/^(verdadeiro|falso|true|false)$/i.test(trimmed)) return "logico"
  if (/^-?\d+([.,]\d+)?$/.test(trimmed)) return "numero"
  if (trimmed.startsWith("[")) return "lista"

  if (/^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*$/.test(trimmed)) {
    const found = variables.find((item) => item.name === trimmed)
    if (found) return found.dataType
  }

  return "desconhecido"
}

export function operatorsForType(type: InferredType): CompareOperator[] {
  switch (type) {
    case "numero":
      return NUMERIC_OPS
    case "texto":
      return TEXT_OPS
    case "logico":
      return LOGIC_OPS
    case "lista":
      return LIST_OPS
    default:
      return UNKNOWN_OPS
  }
}

export function isUnaryOperator(operator?: CompareOperator): boolean {
  return Boolean(operator && UNARY_OPERATORS.includes(operator))
}

export function normalizeOperator(
  operator: CompareOperator | undefined,
  type: InferredType,
): CompareOperator {
  const options = operatorsForType(type)
  if (operator && options.includes(operator)) return operator
  return options[0]
}

export function formatConditionDisplay(
  left?: string,
  operator?: CompareOperator,
  right?: string,
): string {
  const leftText = left?.trim() || "?"
  const op = operator ?? "=="
  if (isUnaryOperator(op)) {
    return `${leftText} ${OPERATOR_SYMBOL[op]}`
  }
  return `${leftText} ${OPERATOR_SYMBOL[op]} ${right?.trim() || "?"}`
}

export function evaluateCondition(
  leftExpr: string,
  operator: CompareOperator,
  rightExpr: string | undefined,
  memory: Record<string, RuntimeValue>,
): boolean {
  const left = evaluateUserExpression(leftExpr || "falso", memory)

  if (operator === "vazia") {
    if (left.type === "lista") return left.value.length === 0
    if (left.type === "texto") return left.value.length === 0
    return !asBoolean(left)
  }

  if (operator === "naoVazia") {
    return !evaluateCondition(leftExpr, "vazia", undefined, memory)
  }

  if (operator === "verdadeiro") {
    return left.type === "logico" ? left.value : asBoolean(left)
  }

  if (operator === "falso") {
    return left.type === "logico" ? !left.value : !asBoolean(left)
  }

  const right = evaluateUserExpression(rightExpr || '""', memory)

  switch (operator) {
    case "==":
      return valuesAreEqual(left, right)
    case "!=":
      return !valuesAreEqual(left, right)
    case ">":
      return asNumber(left, "Comparação") > asNumber(right, "Comparação")
    case "<":
      return asNumber(left, "Comparação") < asNumber(right, "Comparação")
    case ">=":
      return asNumber(left, "Comparação") >= asNumber(right, "Comparação")
    case "<=":
      return asNumber(left, "Comparação") <= asNumber(right, "Comparação")
    case "contem":
      if (left.type === "lista") {
        return left.value.some((item) => valuesAreEqual(item, right))
      }
      return asString(left).includes(asString(right))
    case "naoContem":
      return !evaluateCondition(leftExpr, "contem", rightExpr, memory)
    case "comecaCom":
      return asString(left).startsWith(asString(right))
    case "terminaCom":
      return asString(left).endsWith(asString(right))
    default:
      throw new Error(`Operador "${operator}" não é suportado.`)
  }
}
