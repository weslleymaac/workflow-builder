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
    name: "capitalizar",
    categories: ["texto"],
    label: "Capitalizar palavras",
    description: "Deixa a primeira letra de cada palavra em maiúscula.",
    example: 'capitalizar("bom dia") → "Bom Dia"',
    params: [{ label: "Texto", placeholder: '"bom dia"' }],
    run: ([value]) => ({
      type: "texto",
      value: asString(value)
        .toLowerCase()
        .replace(/(^|\s)([A-Za-zÀ-ÿ])/g, (_, space: string, letter: string) => space + letter.toUpperCase()),
    }),
  },
  {
    name: "aparar",
    categories: ["texto"],
    label: "Tirar espaços das pontas",
    description: "Remove espaços no começo e no fim do texto.",
    example: 'aparar("  ana  ") → "ana"',
    params: [{ label: "Texto", placeholder: '"  ana  "' }],
    run: ([value]) => ({ type: "texto", value: asString(value).trim() }),
  },
  {
    name: "removerEspacos",
    categories: ["texto"],
    label: "Remover todos os espaços",
    description: "Tira todos os espaços do texto.",
    example: 'removerEspacos("a b c") → "abc"',
    params: [{ label: "Texto", placeholder: '"a b c"' }],
    run: ([value]) => ({ type: "texto", value: asString(value).replace(/\s+/g, "") }),
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
    name: "repetir",
    categories: ["texto"],
    label: "Repetir texto",
    description: "Repete o texto várias vezes.",
    example: 'repetir("ha", 3) → "hahaha"',
    params: [
      { label: "Texto", placeholder: '"ha"' },
      { label: "Vezes", placeholder: "3" },
    ],
    run: ([text, times]) => {
      const n = Math.trunc(asNumber(times, "repetir()"))
      if (n < 0) throw new Error("repetir() precisa de um número de vezes ≥ 0.")
      if (n > 10_000) throw new Error("repetir() aceita no máximo 10000 vezes.")
      return { type: "texto", value: asString(text).repeat(n) }
    },
  },
  {
    name: "pedaco",
    categories: ["texto"],
    label: "Pegar um pedaço",
    description: "Corta o texto do índice inicial até o tamanho pedido.",
    example: 'pedaco("abcdef", 1, 3) → "bcd"',
    params: [
      { label: "Texto", placeholder: '"abcdef"' },
      { label: "Começa em", placeholder: "0" },
      { label: "Quantas letras", placeholder: "3" },
    ],
    run: ([text, start, length]) => {
      const raw = asString(text)
      const from = Math.trunc(asNumber(start, "pedaco()"))
      const size = Math.trunc(asNumber(length, "pedaco()"))
      if (size < 0) throw new Error("pedaco() precisa de tamanho ≥ 0.")
      return { type: "texto", value: raw.slice(from, from + size) }
    },
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
    name: "posicao",
    categories: ["texto"],
    label: "Onde começa o trecho",
    description: "Devolve o índice onde o trecho aparece, ou -1 se não achar.",
    example: 'posicao("banana", "nan") → 2',
    params: [
      { label: "Texto", placeholder: '"banana"' },
      { label: "Procurar", placeholder: '"nan"' },
    ],
    run: ([text, needle]) => ({
      type: "numero",
      value: asString(text).indexOf(asString(needle)),
    }),
  },
  {
    name: "eVazio",
    categories: ["texto"],
    label: "Texto está vazio?",
    description: "Verdadeiro se o texto não tem nenhum caractere (após aparar espaços).",
    example: 'eVazio("   ") → verdadeiro',
    params: [{ label: "Texto", placeholder: '""' }],
    run: ([value]) => ({ type: "logico", value: asString(value).trim().length === 0 }),
  },
  {
    name: "ParaTexto",
    categories: ["texto"],
    label: "Para texto",
    description: "Converte qualquer valor para o tipo texto.",
    example: 'ParaTexto(18) → "18"',
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
    name: "truncar",
    categories: ["matematica"],
    label: "Truncar (parte inteira)",
    description: "Remove a parte decimal sem arredondar.",
    example: "truncar(3.9) → 3",
    params: [{ label: "Número", placeholder: "3.9" }],
    run: ([value]) => ({ type: "numero", value: Math.trunc(asNumber(value, "truncar()")) }),
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
    name: "sinal",
    categories: ["matematica"],
    label: "Sinal do número",
    description: "Devolve -1, 0 ou 1 conforme o número seja negativo, zero ou positivo.",
    example: "sinal(-5) → -1",
    params: [{ label: "Número", placeholder: "-5" }],
    run: ([value]) => ({ type: "numero", value: Math.sign(asNumber(value, "sinal()")) }),
  },
  {
    name: "quadrado",
    categories: ["matematica"],
    label: "Elevar ao quadrado",
    description: "Multiplica o número por ele mesmo.",
    example: "quadrado(4) → 16",
    params: [{ label: "Número", placeholder: "4" }],
    run: ([value]) => {
      const n = asNumber(value, "quadrado()")
      return { type: "numero", value: n * n }
    },
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
    name: "resto",
    categories: ["matematica"],
    label: "Resto da divisão",
    description: "O que sobra da divisão inteira (igual a mod / %).",
    example: "resto(10, 3) → 1",
    params: [
      { label: "Dividendo", placeholder: "10" },
      { label: "Divisor", placeholder: "3" },
    ],
    run: ([a, b]) => {
      const divisor = asNumber(b, "resto()")
      if (divisor === 0) throw new Error("resto() não pode dividir por zero.")
      return { type: "numero", value: asNumber(a, "resto()") % divisor }
    },
  },
  {
    name: "limitar",
    categories: ["matematica"],
    label: "Limitar entre mínimo e máximo",
    description: "Segura o valor para não sair do intervalo.",
    example: "limitar(15, 0, 10) → 10",
    params: [
      { label: "Valor", placeholder: "15" },
      { label: "Mínimo", placeholder: "0" },
      { label: "Máximo", placeholder: "10" },
    ],
    run: ([value, min, max]) => {
      const n = asNumber(value, "limitar()")
      const lo = asNumber(min, "limitar()")
      const hi = asNumber(max, "limitar()")
      if (lo > hi) throw new Error("Em limitar(), o mínimo precisa ser ≤ máximo.")
      return { type: "numero", value: Math.min(hi, Math.max(lo, n)) }
    },
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
    name: "aleatorio",
    categories: ["matematica"],
    label: "Número aleatório 0–1",
    description: "Sorteia um decimal entre 0 (incluso) e 1 (excluso).",
    example: "aleatorio() → 0.372…",
    params: [],
    run: () => ({ type: "numero", value: Math.random() }),
  },
  {
    name: "pi",
    categories: ["matematica"],
    label: "Constante π",
    description: "O número pi (aproximadamente 3,14159…).",
    example: "pi() → 3.141592…",
    params: [],
    run: () => ({ type: "numero", value: Math.PI }),
  },
  {
    name: "ParaNumero",
    categories: ["matematica"],
    label: "Para número",
    description: "Converte um texto em número para poder calcular.",
    example: 'ParaNumero("18") → 18',
    params: [{ label: "Valor", placeholder: '"18"' }],
    run: ([value]) => ({ type: "numero", value: asNumber(value, "ParaNumero()") }),
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
    name: "obter",
    categories: ["lista"],
    label: "Obter item pelo índice",
    description: "Pega o item na posição informada (começa em 0).",
    example: 'obter(["a", "b", "c"], 1) → "b"',
    params: [
      { label: "Lista", placeholder: "frutas" },
      { label: "Índice", placeholder: "0" },
    ],
    run: ([value, indexValue]) => {
      const items = requireList(value, "obter")
      const index = Math.trunc(asNumber(indexValue, "obter()"))
      if (index < 0 || index >= items.length) {
        throw new Error(
          `obter() índice ${index} inválido. A lista tem ${items.length} item(ns).`,
        )
      }
      return cloneValue(items[index])
    },
  },
  {
    name: "indiceDe",
    categories: ["lista"],
    label: "Índice de um item",
    description: "Devolve a posição do item, ou -1 se não estiver na lista.",
    example: 'indiceDe(["a", "b"], "b") → 1',
    params: [
      { label: "Lista", placeholder: "frutas" },
      { label: "Item", placeholder: '"uva"' },
    ],
    run: ([value, needle]) => {
      const items = requireList(value, "indiceDe")
      const index = items.findIndex((item) => valuesAreEqual(item, needle))
      return { type: "numero", value: index }
    },
  },
  {
    name: "adicionar",
    categories: ["lista"],
    label: "Adicionar item no fim",
    description: "Devolve uma nova lista com o item no final.",
    example: 'adicionar([1, 2], 3) → [1, 2, 3]',
    params: [
      { label: "Lista", placeholder: "frutas" },
      { label: "Item", placeholder: '"pera"' },
    ],
    returnsList: true,
    run: ([value, item]) => ({
      type: "lista",
      value: [...requireList(value, "adicionar").map(cloneValue), cloneValue(item)],
    }),
  },
  {
    name: "remover",
    categories: ["lista"],
    label: "Remover primeira ocorrência",
    description: "Devolve uma nova lista sem a primeira vez que o item aparece.",
    example: 'remover([1, 2, 1], 1) → [2, 1]',
    params: [
      { label: "Lista", placeholder: "frutas" },
      { label: "Item", placeholder: '"uva"' },
    ],
    returnsList: true,
    run: ([value, needle]) => {
      const items = requireList(value, "remover").map(cloneValue)
      const index = items.findIndex((item) => valuesAreEqual(item, needle))
      if (index >= 0) items.splice(index, 1)
      return { type: "lista", value: items }
    },
  },
  {
    name: "fatia",
    categories: ["lista"],
    label: "Fatia da lista",
    description: "Copia do índice inicial até o final (sem incluir o final).",
    example: "fatia([0, 1, 2, 3], 1, 3) → [1, 2]",
    params: [
      { label: "Lista", placeholder: "notas" },
      { label: "Início", placeholder: "0" },
      { label: "Fim", placeholder: "2" },
    ],
    returnsList: true,
    run: ([value, start, end]) => {
      const items = requireList(value, "fatia")
      const from = Math.trunc(asNumber(start, "fatia()"))
      const to = Math.trunc(asNumber(end, "fatia()"))
      return { type: "lista", value: items.slice(from, to).map(cloneValue) }
    },
  },
  {
    name: "semDuplicatas",
    categories: ["lista"],
    label: "Remover duplicatas",
    description: "Mantém só a primeira vez que cada valor aparece.",
    example: "semDuplicatas([1, 2, 1, 3]) → [1, 2, 3]",
    params: [{ label: "Lista", placeholder: "frutas" }],
    returnsList: true,
    run: ([value]) => {
      const result: RuntimeValue[] = []
      for (const item of requireList(value, "semDuplicatas")) {
        if (!result.some((existing) => valuesAreEqual(existing, item))) {
          result.push(cloneValue(item))
        }
      }
      return { type: "lista", value: result }
    },
  },
  {
    name: "embaralhar",
    categories: ["lista"],
    label: "Embaralhar",
    description: "Mistura a ordem dos itens ao acaso.",
    example: "embaralhar([1, 2, 3]) → [3, 1, 2]",
    params: [{ label: "Lista", placeholder: "frutas" }],
    returnsList: true,
    run: ([value]) => {
      const items = requireList(value, "embaralhar").map(cloneValue)
      for (let i = items.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[items[i], items[j]] = [items[j], items[i]]
      }
      return { type: "lista", value: items }
    },
  },
  {
    name: "estaVazia",
    categories: ["lista"],
    label: "Lista está vazia?",
    description: "Verdadeiro se a lista não tem nenhum item.",
    example: "estaVazia([]) → verdadeiro",
    params: [{ label: "Lista", placeholder: "frutas" }],
    run: ([value]) => ({ type: "logico", value: requireList(value, "estaVazia").length === 0 }),
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

const FUNCTION_ALIASES: Record<string, string> = {
  texto: "ParaTexto",
  numero: "ParaNumero",
}

export function findFunction(name: string | undefined): LogicFunction | undefined {
  if (!name) return undefined
  const normalized = name.toLowerCase()
  const canonical = (FUNCTION_ALIASES[normalized] ?? name).toLowerCase()
  return LOGIC_FUNCTIONS.find((fn) => fn.name.toLowerCase() === canonical)
}

export function functionsByCategory(category: FunctionCategory): LogicFunction[] {
  return LOGIC_FUNCTIONS.filter((fn) => fn.categories.includes(category))
}

export function categoryOf(fn: LogicFunction): FunctionCategory {
  return fn.categories[0]
}

/** Pacotes globais: $Texto, $Numero, $Lista. */
export const FUNCTION_PACKAGES = [
  { name: "$Texto", category: "texto" as FunctionCategory, label: "Texto" },
  { name: "$Numero", category: "matematica" as FunctionCategory, label: "Número" },
  { name: "$Lista", category: "lista" as FunctionCategory, label: "Lista" },
] as const

export type FunctionPackage = (typeof FUNCTION_PACKAGES)[number]

/** Aceita nomes novos e aliases antigos ($String/$Math/$List). */
const PACKAGE_ALIASES: Record<string, string> = {
  $texto: "$Texto",
  $string: "$Texto",
  $numero: "$Numero",
  $math: "$Numero",
  $lista: "$Lista",
  $list: "$Lista",
}

export function resolveFunctionPackage(name: string): FunctionPackage | undefined {
  const normalized = name.trim().toLowerCase()
  const canonical = PACKAGE_ALIASES[normalized] ?? name.trim()
  return FUNCTION_PACKAGES.find((pkg) => pkg.name.toLowerCase() === canonical.toLowerCase())
}

/** Funções sugeridas ao digitar `variavel.` conforme o tipo declarado. */
export function functionsForDataType(dataType: string): LogicFunction[] {
  switch (dataType) {
    case "texto":
      return functionsByCategory("texto")
    case "numero":
      return functionsByCategory("matematica")
    case "lista":
      return functionsByCategory("lista")
    default:
      return []
  }
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

/** Chama função de um pacote ($Numero.arredondar etc.), validando a categoria. */
export function callPackageFunction(packageName: string, fnName: string, args: RuntimeValue[]): RuntimeValue {
  const pkg = resolveFunctionPackage(packageName)
  if (!pkg) {
    throw new Error(`Pacote desconhecido: ${packageName}. Use $Texto, $Numero ou $Lista.`)
  }
  const fn = findFunction(fnName)
  if (!fn || !fn.categories.includes(pkg.category)) {
    throw new Error(`A função "${fnName}" não existe em ${pkg.name}.`)
  }
  return callFunction(fn.name, args)
}

function categoryForValueType(type: RuntimeValue["type"]): FunctionCategory | null {
  switch (type) {
    case "texto":
      return "texto"
    case "numero":
      return "matematica"
    case "lista":
      return "lista"
    default:
      return null
  }
}

/** Chama método em valor: nome.maiuscula() → maiuscula(nome), com checagem de tipo. */
export function callMethodFunction(
  receiver: RuntimeValue,
  fnName: string,
  extraArgs: RuntimeValue[],
): RuntimeValue {
  const fn = findFunction(fnName)
  if (!fn) {
    throw new Error(`Não conheço a função "${fnName}".`)
  }
  const category = categoryForValueType(receiver.type)
  if (!category || !fn.categories.includes(category)) {
    throw new Error(
      `"${fnName}()" não funciona com ${DATA_TYPE_LABEL[receiver.type].toLowerCase()}. Use uma função do tipo certo.`,
    )
  }
  return callFunction(fn.name, [receiver, ...extraArgs])
}
