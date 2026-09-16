import type { FunctionCategory, RuntimeValue } from "./types"
import { DATA_TYPE_LABEL, asNumber, asString, cloneValue, valuesAreEqual } from "./values"

export const FUNCTION_CATEGORY_LABEL: Record<FunctionCategory, string> = {
  texto: "Texto",
  matematica: "Matemática",
  lista: "Lista",
}

export interface FunctionParam {
  label: string
  placeholder: string
}

export interface LogicFunction {
  name: string
  categories: FunctionCategory[]
  label: string
  description: string
  example: string
  params: FunctionParam[]
  /** Marca funções que podem devolver uma lista, para aparecerem no seletor de listas. */
  returnsList?: boolean
  run: (args: RuntimeValue[]) => RuntimeValue
}

function requireList(value: RuntimeValue, fnName: string): RuntimeValue[] {
  if (value.type !== "lista") {
    throw new Error(
      `${fnName}() precisa de uma lista, mas recebeu ${DATA_TYPE_LABEL[value.type].toLowerCase()}.`,
    )
  }
  return value.value
}

function requireFilledList(value: RuntimeValue, fnName: string): RuntimeValue[] {
  const items = requireList(value, fnName)
  if (items.length === 0) {
    throw new Error(`${fnName}() precisa de uma lista com pelo menos um item.`)
  }
  return items
}

function numbersOf(value: RuntimeValue, fnName: string): number[] {
  return requireFilledList(value, fnName).map((item) => asNumber(item, `${fnName}()`))
}

const TEXT_FUNCTIONS: LogicFunction[] = [
  {
    name: "maiuscula",
    categories: ["texto"],
    label: "Deixar MAIÚSCULO",
    description: "Transforma todas as letras em maiúsculas.",
    example: 'maiuscula("ana") → "ANA"',
    params: [{ label: "Texto", placeholder: '"ana"' }],
    run: ([value]) => ({ type: "texto", value: asString(value).toUpperCase() }),
  },
  {
    name: "minuscula",
    categories: ["texto"],
    label: "Deixar minúsculo",
    description: "Transforma todas as letras em minúsculas.",
    example: 'minuscula("ANA") → "ana"',
    params: [{ label: "Texto", placeholder: '"ANA"' }],
    run: ([value]) => ({ type: "texto", value: asString(value).toLowerCase() }),
  },
  {
    name: "juntar",
    categories: ["texto"],
    label: "Juntar dois textos",
    description: "Cola um texto no outro, virando um só.",
    example: 'juntar("Bom ", "dia") → "Bom dia"',
    params: [
      { label: "Primeiro texto", placeholder: '"Bom "' },
      { label: "Segundo texto", placeholder: '"dia"' },
    ],
    run: ([left, right]) => ({ type: "texto", value: asString(left) + asString(right) }),
  },
  {
    name: "substituir",
    categories: ["texto"],
    label: "Trocar um pedaço",
    description: "Procura um pedaço do texto e troca por outro.",
    example: 'substituir("bom dia", "dia", "noite") → "bom noite"',
    params: [
      { label: "Texto", placeholder: '"bom dia"' },
      { label: "Trocar o quê", placeholder: '"dia"' },
      { label: "Pelo quê", placeholder: '"noite"' },
    ],
    run: ([text, from, to]) => ({
      type: "texto",
      value: asString(text).split(asString(from)).join(asString(to)),
    }),
  },
  {
    name: "texto",
    categories: ["texto"],
    label: "Transformar em texto",
    description: "Converte qualquer valor para o tipo texto.",
    example: 'texto(18) → "18"',
    params: [{ label: "Valor", placeholder: "18" }],
    run: ([value]) => ({ type: "texto", value: asString(value) }),
  },
]

const MATH_FUNCTIONS: LogicFunction[] = [
  {
    name: "arredondar",
    categories: ["matematica"],
    label: "Arredondar",
    description: "Arredonda para o número inteiro mais próximo.",
    example: "arredondar(3.7) → 4",
    params: [{ label: "Número", placeholder: "3.7" }],
    run: ([value]) => ({ type: "numero", value: Math.round(asNumber(value, "arredondar()")) }),
  },
  {
    name: "arredondarBaixo",
    categories: ["matematica"],
    label: "Arredondar para baixo",
    description: "Corta as casas decimais, sempre para baixo.",
    example: "arredondarBaixo(3.9) → 3",
    params: [{ label: "Número", placeholder: "3.9" }],
    run: ([value]) => ({ type: "numero", value: Math.floor(asNumber(value, "arredondarBaixo()")) }),
  },
  {
    name: "arredondarCima",
    categories: ["matematica"],
    label: "Arredondar para cima",
    description: "Sobe para o próximo número inteiro.",
    example: "arredondarCima(3.1) → 4",
    params: [{ label: "Número", placeholder: "3.1" }],
    run: ([value]) => ({ type: "numero", value: Math.ceil(asNumber(value, "arredondarCima()")) }),
  },
  {
    name: "absoluto",
    categories: ["matematica"],
    label: "Valor absoluto",
    description: "Tira o sinal de menos: a distância até o zero.",
    example: "absoluto(-7) → 7",
    params: [{ label: "Número", placeholder: "-7" }],
    run: ([value]) => ({ type: "numero", value: Math.abs(asNumber(value, "absoluto()")) }),
  },
  {
    name: "raiz",
    categories: ["matematica"],
    label: "Raiz quadrada",
    description: "Qual número multiplicado por ele mesmo dá esse valor.",
    example: "raiz(9) → 3",
    params: [{ label: "Número", placeholder: "9" }],
    run: ([value]) => {
      const number = asNumber(value, "raiz()")
      if (number < 0) throw new Error("raiz() não funciona com número negativo.")
      return { type: "numero", value: Math.sqrt(number) }
    },
  },
  {
    name: "potencia",
    categories: ["matematica"],
    label: "Potência",
    description: "Multiplica a base por ela mesma várias vezes.",
    example: "potencia(2, 3) → 8",
    params: [
      { label: "Base", placeholder: "2" },
      { label: "Expoente", placeholder: "3" },
    ],
    run: ([base, exponent]) => ({
      type: "numero",
      value: Math.pow(asNumber(base, "potencia()"), asNumber(exponent, "potencia()")),
    }),
  },
  {
    name: "maximo",
    categories: ["matematica"],
    label: "Maior entre dois",
    description: "Devolve o maior dos dois números.",
    example: "maximo(4, 9) → 9",
    params: [
      { label: "Primeiro número", placeholder: "4" },
      { label: "Segundo número", placeholder: "9" },
    ],
    run: ([a, b]) => ({
      type: "numero",
      value: Math.max(asNumber(a, "maximo()"), asNumber(b, "maximo()")),
    }),
  },
  {
    name: "minimo",
    categories: ["matematica"],
    label: "Menor entre dois",
    description: "Devolve o menor dos dois números.",
    example: "minimo(4, 9) → 4",
    params: [
      { label: "Primeiro número", placeholder: "4" },
      { label: "Segundo número", placeholder: "9" },
    ],
    run: ([a, b]) => ({
      type: "numero",
      value: Math.min(asNumber(a, "minimo()"), asNumber(b, "minimo()")),
    }),
  },
  {
    name: "sorteio",
    categories: ["matematica"],
    label: "Sortear um número",
    description: "Sorteia um número inteiro entre o mínimo e o máximo.",
    example: "sorteio(1, 6) → 4 (dado)",
    params: [
      { label: "Mínimo", placeholder: "1" },
      { label: "Máximo", placeholder: "6" },
    ],
    run: ([min, max]) => {
      const from = Math.ceil(asNumber(min, "sorteio()"))
      const to = Math.floor(asNumber(max, "sorteio()"))
      if (from > to) throw new Error("No sorteio(), o mínimo precisa ser menor que o máximo.")
      return { type: "numero", value: Math.floor(Math.random() * (to - from + 1)) + from }
    },
  },
  {
    name: "numero",
    categories: ["matematica"],
    label: "Transformar em número",
    description: "Converte um texto em número para poder calcular.",
    example: 'numero("18") → 18',
    params: [{ label: "Valor", placeholder: '"18"' }],
    run: ([value]) => ({ type: "numero", value: asNumber(value, "numero()") }),
  },
]

const LIST_FUNCTIONS: LogicFunction[] = [
  {
    name: "soma",
    categories: ["lista"],
    label: "Somar a lista",
    description: "Soma todos os números da lista.",
    example: "soma([1, 2, 3]) → 6",
    params: [{ label: "Lista", placeholder: "notas" }],
    run: ([value]) => ({
      type: "numero",
      value: numbersOf(value, "soma").reduce((total, item) => total + item, 0),
    }),
  },
  {
    name: "media",
    categories: ["lista"],
    label: "Média da lista",
    description: "Soma tudo e divide pela quantidade de itens.",
    example: "media([8, 6, 10]) → 8",
    params: [{ label: "Lista", placeholder: "notas" }],
    run: ([value]) => {
      const numbers = numbersOf(value, "media")
      return {
        type: "numero",
        value: numbers.reduce((total, item) => total + item, 0) / numbers.length,
      }
    },
  },
  {
    name: "maior",
    categories: ["lista"],
    label: "Maior da lista",
    description: "Encontra o maior número da lista.",
    example: "maior([3, 9, 5]) → 9",
    params: [{ label: "Lista", placeholder: "notas" }],
    run: ([value]) => ({ type: "numero", value: Math.max(...numbersOf(value, "maior")) }),
  },
  {
    name: "menor",
    categories: ["lista"],
    label: "Menor da lista",
    description: "Encontra o menor número da lista.",
    example: "menor([3, 9, 5]) → 3",
    params: [{ label: "Lista", placeholder: "notas" }],
    run: ([value]) => ({ type: "numero", value: Math.min(...numbersOf(value, "menor")) }),
  },
  {
    name: "ordenar",
    categories: ["lista"],
    label: "Colocar em ordem",
    description: "Ordena números do menor para o maior e textos de A a Z.",
    example: "ordenar([3, 1, 2]) → [1, 2, 3]",
    params: [{ label: "Lista", placeholder: "notas" }],
    returnsList: true,
    run: ([value]) => {
      const items = requireList(value, "ordenar").map(cloneValue)
      const onlyNumbers = items.every((item) => item.type === "numero")
      items.sort((a, b) =>
        onlyNumbers
          ? asNumber(a, "ordenar()") - asNumber(b, "ordenar()")
          : asString(a).localeCompare(asString(b), "pt-BR"),
      )
      return { type: "lista", value: items }
    },
  },
  {
    name: "primeiro",
    categories: ["lista"],
    label: "Primeiro item",
    description: "Pega o item do índice 0, o começo da lista.",
    example: 'primeiro(["maçã", "uva"]) → "maçã"',
    params: [{ label: "Lista", placeholder: "frutas" }],
    run: ([value]) => cloneValue(requireFilledList(value, "primeiro")[0]),
  },
  {
    name: "ultimo",
    categories: ["lista"],
    label: "Último item",
    description: "Pega o item que está no fim da lista.",
    example: 'ultimo(["maçã", "uva"]) → "uva"',
    params: [{ label: "Lista", placeholder: "frutas" }],
    run: ([value]) => {
      const items = requireFilledList(value, "ultimo")
      return cloneValue(items[items.length - 1])
    },
  },
  {
    name: "juntarLista",
    categories: ["lista"],
    label: "Transformar lista em texto",
    description: "Junta todos os itens num texto só, separados por algo.",
    example: 'juntarLista(["a", "b"], " e ") → "a e b"',
    params: [
      { label: "Lista", placeholder: "frutas" },
      { label: "Separador", placeholder: '", "' },
    ],
    run: ([value, separator]) => ({
      type: "texto",
      value: requireList(value, "juntarLista")
        .map((item) => asString(item))
        .join(asString(separator)),
    }),
  },
]

const SHARED_FUNCTIONS: LogicFunction[] = [
  {
    name: "tamanho",
    categories: ["texto", "lista"],
    label: "Tamanho",
    description: "Conta quantas letras tem o texto ou quantos itens tem a lista.",
    example: 'tamanho("ana") → 3',
    params: [{ label: "Texto ou lista", placeholder: "frutas" }],
    run: ([value]) => ({
      type: "numero",
      value: value.type === "lista" ? value.value.length : asString(value).length,
    }),
  },
  {
    name: "contem",
    categories: ["texto", "lista"],
    label: "Contém?",
    description: "Responde verdadeiro ou falso: esse valor está aí dentro?",
    example: 'contem("banana", "nan") → verdadeiro',
    params: [
      { label: "Texto ou lista", placeholder: "frutas" },
      { label: "Procurar o quê", placeholder: '"uva"' },
    ],
    run: ([haystack, needle]) => ({
      type: "logico",
      value:
        haystack.type === "lista"
          ? haystack.value.some((item) => valuesAreEqual(item, needle))
          : asString(haystack).includes(asString(needle)),
    }),
  },
  {
    name: "comecaCom",
    categories: ["texto"],
    label: "Começa com",
    description: "Responde verdadeiro ou falso: o texto começa com esse pedaço?",
    example: 'comecaCom("banana", "ban") → verdadeiro',
    params: [
      { label: "Texto", placeholder: '"banana"' },
      { label: "Começa com", placeholder: '"ban"' },
    ],
    run: ([text, prefix]) => ({
      type: "logico",
      value: asString(text).startsWith(asString(prefix)),
    }),
  },
  {
    name: "terminaCom",
    categories: ["texto"],
    label: "Termina com",
    description: "Responde verdadeiro ou falso: o texto termina com esse pedaço?",
    example: 'terminaCom("banana", "ana") → verdadeiro',
    params: [
      { label: "Texto", placeholder: '"banana"' },
      { label: "Termina com", placeholder: '"ana"' },
    ],
    run: ([text, suffix]) => ({
      type: "logico",
      value: asString(text).endsWith(asString(suffix)),
    }),
  },
  {
    name: "inverter",
    categories: ["texto", "lista"],
    label: "Inverter",
    description: "Vira o texto ou a lista de trás para frente.",
    example: 'inverter("ana") → "ana" · inverter([1, 2]) → [2, 1]',
    params: [{ label: "Texto ou lista", placeholder: '"logica"' }],
    returnsList: true,
    run: ([value]) =>
      value.type === "lista"
        ? { type: "lista", value: value.value.map(cloneValue).reverse() }
        : { type: "texto", value: [...asString(value)].reverse().join("") },
  },
]

export const LOGIC_FUNCTIONS: LogicFunction[] = [
  ...TEXT_FUNCTIONS,
  ...MATH_FUNCTIONS,
  ...LIST_FUNCTIONS,
  ...SHARED_FUNCTIONS,
]

export function findFunction(name: string | undefined): LogicFunction | undefined {
  if (!name) return undefined
  const normalized = name.toLowerCase()
  return LOGIC_FUNCTIONS.find((fn) => fn.name.toLowerCase() === normalized)
}

export function functionsByCategory(category: FunctionCategory): LogicFunction[] {
  return LOGIC_FUNCTIONS.filter((fn) => fn.categories.includes(category))
}

export function categoryOf(fn: LogicFunction): FunctionCategory {
  return fn.categories[0]
}

export function callFunction(name: string, args: RuntimeValue[]): RuntimeValue {
  const fn = findFunction(name)
  if (!fn) {
    throw new Error(`Não conheço a função "${name}". Veja a lista no bloco Função.`)
  }
  if (args.length !== fn.params.length) {
    const expected = fn.params.map((param) => param.label.toLowerCase()).join(", ")
    throw new Error(
      `${fn.name}() espera ${fn.params.length} valor(es) — ${expected} — mas recebeu ${args.length}.`,
    )
  }
  return fn.run(args)
}
