/**
 * Suite de regressão do motor de expressões / funções.
 * Rodar: npm run test:engine
 */
import {
  evaluateExpression,
  evaluateUserExpression,
  interpolateTemplate,
} from "../lib/expression.ts"
import {
  LOGIC_FUNCTIONS,
  FUNCTION_PACKAGES,
  functionsByCategory,
  callFunction,
  resolveFunctionPackage,
} from "../lib/functions.ts"
import type { RuntimeValue } from "../lib/types.ts"

const mem: Record<string, RuntimeValue> = {
  n: { type: "numero", value: 3 },
  idade: { type: "numero", value: 20 },
  m: { type: "numero", value: 3 },
  nome: { type: "texto", value: "Weslley" },
  raw: { type: "texto", value: "  oi mundo  " },
  frutas: {
    type: "lista",
    value: [
      { type: "texto", value: "uva" },
      { type: "texto", value: "maçã" },
      { type: "texto", value: "uva" },
    ],
  },
  notas: {
    type: "lista",
    value: [
      { type: "numero", value: 8 },
      { type: "numero", value: 6 },
      { type: "numero", value: 10 },
    ],
  },
}

function format(v: RuntimeValue): string {
  switch (v.type) {
    case "texto":
      return v.value
    case "numero":
      return String(v.value)
    case "logico":
      return v.value ? "verdadeiro" : "falso"
    case "lista":
      return `[${v.value.map(format).join(", ")}]`
  }
}

function eq(actual: string, expected: string, label: string) {
  if (actual !== expected) throw new Error(`${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)
}

const passes: string[] = []
const fails: string[] = []

function test(name: string, fn: () => void) {
  try {
    fn()
    passes.push(name)
  } catch (error) {
    fails.push(`${name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function mustThrow(name: string, fn: () => void) {
  test(name, () => {
    try {
      fn()
      throw new Error("deveria ter lançado erro")
    } catch (error) {
      if (error instanceof Error && error.message === "deveria ter lançado erro") throw error
    }
  })
}

test("sem nomes duplicados", () => {
  const names = LOGIC_FUNCTIONS.map((fn) => fn.name.toLowerCase())
  const dup = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))]
  if (dup.length) throw new Error(dup.join(", "))
})

test("pacotes oficiais", () => {
  eq(FUNCTION_PACKAGES.map((p) => p.name).join(","), "$Texto,$Numero,$Lista", "pkgs")
})

test("aliases de pacote", () => {
  for (const name of ["$Texto", "$Numero", "$Lista", "$Math", "$String", "$List"]) {
    if (!resolveFunctionPackage(name)) throw new Error(name)
  }
})

test("categorias populosas", () => {
  if (functionsByCategory("texto").length < 10) throw new Error("texto")
  if (functionsByCategory("matematica").length < 10) throw new Error("numero")
  if (functionsByCategory("lista").length < 10) throw new Error("lista")
})

test("exemplos do usuário", () => {
  eq(interpolateTemplate("{n+3}", mem), "6", "n+3")
  eq(interpolateTemplate("{(idade /2) * m }", mem), "30", "idade")
  eq(interpolateTemplate('{nome & " tem " & idade}', mem), "Weslley tem 20", "concat")
})

test("aritmética e mod", () => {
  eq(format(evaluateExpression("2 + 3 * 4", mem)), "14", "prec")
  eq(format(evaluateExpression("(2 + 3) * 4", mem)), "20", "parens")
  eq(format(evaluateExpression("10 mod 3", mem)), "1", "mod")
  eq(format(evaluateExpression("10 % 3", mem)), "1", "%")
})

test("métodos e pacotes", () => {
  eq(format(evaluateExpression("nome.maiuscula()", mem)), "WESLLEY", "method")
  eq(format(evaluateExpression("raw.aparar().maiuscula()", mem)), "OI MUNDO", "chain")
  eq(format(evaluateExpression("n.quadrado()", mem)), "9", "quad")
  eq(format(evaluateExpression("frutas.primeiro()", mem)), "uva", "first")
  eq(format(evaluateExpression('$Texto.minuscula("ANA")', mem)), "ana", "texto")
  eq(format(evaluateExpression("$Numero.arredondar(3.7)", mem)), "4", "num")
  eq(format(evaluateExpression("$Lista.tamanho(frutas)", mem)), "3", "lista")
  eq(format(evaluateExpression("$Math.potencia(2, 3)", mem)), "8", "alias")
  eq(format(evaluateExpression("$Numero.arredondar(3.7) + 2", mem)), "6", "mix")
  eq(format(evaluateExpression("[1, 2, 3].soma()", mem)), "6", "literal")
})

test("evaluateUserExpression com chaves", () => {
  eq(format(evaluateUserExpression("{idade} + 1", mem)), "21", "user")
})

test("funções novas amostrais", () => {
  eq(format(evaluateExpression('$Texto.capitalizar("bom dia")', mem)), "Bom Dia", "cap")
  eq(format(evaluateExpression("$Numero.resto(10, 3)", mem)), "1", "resto")
  eq(format(evaluateExpression("$Numero.limitar(15, 0, 10)", mem)), "10", "lim")
  eq(format(evaluateExpression("$Lista.semDuplicatas(frutas)", mem)), "[uva, maçã]", "uniq")
  eq(format(callFunction("pi", [])), String(Math.PI), "pi")
})

mustThrow("divisão por zero", () => evaluateExpression("1/0", mem))
mustThrow("variável inexistente", () => evaluateExpression("xyz", mem))
mustThrow("função no pacote errado", () => evaluateExpression("$Texto.arredondar(3)", mem))
mustThrow("método incompatível com tipo", () => evaluateExpression("frutas.maiuscula()", mem))
mustThrow("pacote inexistente", () => evaluateExpression("$Foo.bar()", mem))

console.log(`PASS ${passes.length}`)
if (fails.length) {
  console.log(`FAIL ${fails.length}`)
  for (const item of fails) console.log(" -", item)
  process.exit(1)
}
console.log("ALL GREEN")
