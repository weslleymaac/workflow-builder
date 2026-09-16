import { MarkerType, Position } from "reactflow"
import type { ExampleLevel } from "./example-catalog"
import type { LogicNodeType, WorkflowEdge, WorkflowGraph, WorkflowNode } from "./types"

const EDGE_COLOR = "#22d3ee"

function edge(id: string, source: string, target: string, sourceHandle?: string, label?: string): WorkflowEdge {
  return {
    id,
    source,
    target,
    sourceHandle,
    type: "custom",
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
    data: label ? { label } : undefined,
  }
}

function node(
  id: string,
  type: WorkflowNode["type"],
  x: number,
  y: number,
  data: WorkflowNode["data"],
): WorkflowNode {
  return {
    id,
    type,
    position: { x, y },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data,
  }
}

export interface ExampleProgram {
  name: string
  description: string
  level: ExampleLevel
  focus: LogicNodeType[]
  graph: WorkflowGraph
}

export const EXAMPLE_PROGRAMS: Record<string, ExampleProgram> = {
  hello: {
    name: "Olá, comandante",
    description: "Primeira transmissão: variável + mostrar na tela.",
    level: "basico",
    focus: ["start", "variable", "print", "end"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 180, { label: "Decolagem", description: "Missão iniciada!" }),
        node("var-1", "variable", 300, 180, {
          label: "Codinome",
          variableName: "nome",
          dataType: "texto",
          valueExpr: '"Comandante"',
        }),
        node("print-1", "print", 560, 180, {
          label: "Rádio",
          template: "🚀 Olá, {nome}! Sistemas online.",
        }),
        node("end-1", "end", 820, 180, { label: "Estação" }),
      ],
      edges: [edge("e1", "start-1", "var-1"), edge("e2", "var-1", "print-1"), edge("e3", "print-1", "end-1")],
    },
  },

  decolagem: {
    name: "Contagem regressiva",
    description: "Do Início ao Fim passando só pelo Mostrar.",
    level: "basico",
    focus: ["start", "print", "end"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 180, { label: "Base espacial" }),
        node("print-1", "print", 320, 180, {
          label: "Torre de controle",
          template: "3... 2... 1... DECOLAR! 🌌",
        }),
        node("end-1", "end", 600, 180, { label: "Órbita" }),
      ],
      edges: [edge("e1", "start-1", "print-1"), edge("e2", "print-1", "end-1")],
    },
  },

  "var-basico": {
    name: "Tanque de combustível",
    description: "Guardar um número numa variável e mostrar.",
    level: "basico",
    focus: ["variable", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 180, { label: "Hangar" }),
        node("var-1", "variable", 280, 180, {
          label: "Combustível",
          variableName: "litros",
          dataType: "numero",
          valueExpr: "100",
        }),
        node("print-1", "print", 520, 180, {
          label: "Painel",
          template: "⛽ Tanque com {litros} litros.",
        }),
        node("end-1", "end", 760, 180, { label: "Pronto" }),
      ],
      edges: [edge("e1", "start-1", "var-1"), edge("e2", "var-1", "print-1"), edge("e3", "print-1", "end-1")],
    },
  },

  tipos: {
    name: "Tipos de dados",
    description: "Texto, número e lógico na memória da nave.",
    level: "basico",
    focus: ["variable", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 180, { label: "Laboratório" }),
        node("var-1", "variable", 280, 180, {
          label: "Tripulante",
          variableName: "piloto",
          dataType: "texto",
          valueExpr: '"Ana"',
        }),
        node("var-2", "variable", 520, 180, {
          label: "Anos",
          variableName: "idade",
          dataType: "numero",
          valueExpr: "18",
        }),
        node("var-3", "variable", 760, 180, {
          label: "Autorizada?",
          variableName: "apta",
          dataType: "logico",
          valueExpr: "verdadeiro",
        }),
        node("print-1", "print", 1000, 180, {
          label: "Relatório",
          template: "{piloto}, {idade} anos. Missão liberada? {apta}",
        }),
        node("end-1", "end", 1280, 180, { label: "Arquivo" }),
      ],
      edges: [
        edge("e1", "start-1", "var-1"),
        edge("e2", "var-1", "var-2"),
        edge("e3", "var-2", "var-3"),
        edge("e4", "var-3", "print-1"),
        edge("e5", "print-1", "end-1"),
      ],
    },
  },

  variaveis: {
    name: "Soma orbital",
    description: "Duas variáveis numéricas viram uma terceira com expressão.",
    level: "intermediario",
    focus: ["variable", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 180, { label: "Cálculo" }),
        node("var-1", "variable", 280, 180, {
          label: "Distância A",
          variableName: "a",
          dataType: "numero",
          valueExpr: "10",
        }),
        node("var-2", "variable", 520, 180, {
          label: "Distância B",
          variableName: "b",
          dataType: "numero",
          valueExpr: "5",
        }),
        node("var-3", "variable", 760, 180, {
          label: "Total",
          variableName: "total",
          dataType: "numero",
          valueExpr: "a + b",
        }),
        node("print-1", "print", 1000, 180, {
          label: "HUD",
          template: "🛰️ Rota total: {a} + {b} = {total} unidades.",
        }),
        node("end-1", "end", 1280, 180, { label: "OK" }),
      ],
      edges: [
        edge("e1", "start-1", "var-1"),
        edge("e2", "var-1", "var-2"),
        edge("e3", "var-2", "var-3"),
        edge("e4", "var-3", "print-1"),
        edge("e5", "print-1", "end-1"),
      ],
    },
  },

  "input-nome": {
    name: "Codinome do piloto",
    description: "Perguntar um texto e mostrar na saída.",
    level: "basico",
    focus: ["input", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 180, { label: "Check-in" }),
        node("in-1", "input", 280, 180, {
          label: "Rádio",
          variableName: "codinome",
          dataType: "texto",
          prompt: "Qual é o seu codinome, comandante?",
        }),
        node("print-1", "print", 540, 180, {
          label: "Crachá",
          template: "✅ Tripulante registrado: {codinome}",
        }),
        node("end-1", "end", 800, 180, { label: "Hangar" }),
      ],
      edges: [edge("e1", "start-1", "in-1"), edge("e2", "in-1", "print-1"), edge("e3", "print-1", "end-1")],
    },
  },

  "input-combustivel": {
    name: "Abastecimento",
    description: "Perguntar um número e usar na mensagem.",
    level: "basico",
    focus: ["input", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 180, { label: "Posto" }),
        node("in-1", "input", 280, 180, {
          label: "Medidor",
          variableName: "litros",
          dataType: "numero",
          prompt: "Quantos litros de combustível foram carregados?",
        }),
        node("print-1", "print", 540, 180, {
          label: "Recibo",
          template: "⛽ Tanque abastecido com {litros} litros.",
        }),
        node("end-1", "end", 800, 180, { label: "Decolagem" }),
      ],
      edges: [edge("e1", "start-1", "in-1"), edge("e2", "in-1", "print-1"), edge("e3", "print-1", "end-1")],
    },
  },

  "print-relatorio": {
    name: "Telemetria dupla",
    description: "Várias variáveis numa única transmissão.",
    level: "intermediario",
    focus: ["variable", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 180, { label: "Sensores" }),
        node("var-1", "variable", 280, 180, {
          label: "Oxigênio",
          variableName: "oxigenio",
          dataType: "numero",
          valueExpr: "98",
        }),
        node("var-2", "variable", 520, 180, {
          label: "Pressão",
          variableName: "pressao",
          dataType: "numero",
          valueExpr: "1013",
        }),
        node("print-1", "print", 760, 180, {
          label: "Painel HUD",
          template: "🫁 O₂: {oxigenio}% · 📊 Pressão: {pressao} hPa",
        }),
        node("end-1", "end", 1020, 180, { label: "Log" }),
      ],
      edges: [
        edge("e1", "start-1", "var-1"),
        edge("e2", "var-1", "var-2"),
        edge("e3", "var-2", "print-1"),
        edge("e4", "print-1", "end-1"),
      ],
    },
  },

  "func-texto": {
    name: "Planeta em MAIÚSCULO",
    description: "Função de texto transformando um valor.",
    level: "basico",
    focus: ["function", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Mapa" }),
        node("var-1", "variable", 280, 200, {
          label: "Destino",
          variableName: "planeta",
          dataType: "texto",
          valueExpr: '"marte"',
        }),
        node("fn-1", "function", 540, 200, {
          label: "Amplificar",
          functionCategory: "texto",
          functionName: "maiuscula",
          functionArgs: ["{planeta}"],
          targetVar: "destino",
        }),
        node("print-1", "print", 820, 200, {
          label: "Rota",
          template: "🪐 Próxima parada: {destino}!",
        }),
        node("end-1", "end", 1080, 200, { label: "Curso" }),
      ],
      edges: [
        edge("e1", "start-1", "var-1"),
        edge("e2", "var-1", "fn-1"),
        edge("e3", "fn-1", "print-1"),
        edge("e4", "print-1", "end-1"),
      ],
    },
  },

  "func-matematica": {
    name: "Arredondar distância",
    description: "Função matemática num valor decimal.",
    level: "basico",
    focus: ["function", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Radar" }),
        node("var-1", "variable", 280, 200, {
          label: "Distância bruta",
          variableName: "km",
          dataType: "numero",
          valueExpr: "7.8",
        }),
        node("fn-1", "function", 540, 200, {
          label: "Ajustar",
          functionCategory: "matematica",
          functionName: "arredondar",
          functionArgs: ["{km}"],
          targetVar: "kmFinal",
        }),
        node("print-1", "print", 820, 200, {
          label: "Navegador",
          template: "📍 Distância arredondada: {kmFinal} km",
        }),
        node("end-1", "end", 1080, 200, { label: "OK" }),
      ],
      edges: [
        edge("e1", "start-1", "var-1"),
        edge("e2", "var-1", "fn-1"),
        edge("e3", "fn-1", "print-1"),
        edge("e4", "print-1", "end-1"),
      ],
    },
  },

  funcoes: {
    name: "Relatório da tripulação",
    description: "Texto, lista e matemática juntos.",
    level: "avancado",
    focus: ["function", "list", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Central" }),
        node("var-1", "variable", 280, 200, {
          label: "Piloto",
          variableName: "nome",
          dataType: "texto",
          valueExpr: '"ana maria"',
        }),
        node("list-1", "list", 520, 200, {
          label: "Notas",
          listOp: "criar",
          listName: "notas",
          itemsExpr: "8, 6, 10",
        }),
        node("fn-1", "function", 790, 200, {
          label: "Média",
          functionCategory: "lista",
          functionName: "media",
          functionArgs: ["notas"],
          targetVar: "media",
        }),
        node("fn-2", "function", 1060, 200, {
          label: "Arredondar",
          functionCategory: "matematica",
          functionName: "arredondar",
          functionArgs: ["{media}"],
          targetVar: "notaFinal",
        }),
        node("fn-3", "function", 1330, 200, {
          label: "Crachá",
          functionCategory: "texto",
          functionName: "maiuscula",
          functionArgs: ["{nome}"],
          targetVar: "nomeGritado",
        }),
        node("print-1", "print", 1600, 200, {
          label: "Boletim",
          template: "🏅 {nomeGritado} — média {notaFinal} pontos!",
        }),
        node("end-1", "end", 1880, 200, { label: "Arquivo" }),
      ],
      edges: [
        edge("e1", "start-1", "var-1"),
        edge("e2", "var-1", "list-1"),
        edge("e3", "list-1", "fn-1"),
        edge("e4", "fn-1", "fn-2"),
        edge("e5", "fn-2", "fn-3"),
        edge("e6", "fn-3", "print-1"),
        edge("e7", "print-1", "end-1"),
      ],
    },
  },

  condicao: {
    name: "Autorização de voo",
    description: "Perguntar idade e decidir o caminho SIM/NÃO.",
    level: "intermediario",
    focus: ["input", "condition", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Portão" }),
        node("in-1", "input", 280, 200, {
          label: "Documento",
          variableName: "idade",
          dataType: "numero",
          prompt: "Qual é a sua idade, comandante?",
        }),
        node("if-1", "condition", 540, 200, {
          label: "Verificação",
          leftExpr: "idade",
          operator: ">=",
          rightExpr: "18",
          trueLabel: "liberado",
          falseLabel: "negado",
        }),
        node("print-yes", "print", 820, 80, {
          label: "Verde",
          template: "✅ Autorizado! Pode decolar.",
        }),
        node("print-no", "print", 820, 340, {
          label: "Vermelho",
          template: "⛔ Ainda não. Treine mais um pouco.",
        }),
        node("end-1", "end", 1100, 200, { label: "Hangar" }),
      ],
      edges: [
        edge("e1", "start-1", "in-1"),
        edge("e2", "in-1", "if-1"),
        edge("e3", "if-1", "print-yes", "true", "sim"),
        edge("e4", "if-1", "print-no", "false", "não"),
        edge("e5", "print-yes", "end-1"),
        edge("e6", "print-no", "end-1"),
      ],
    },
  },

  "cond-planeta": {
    name: "Destino Marte?",
    description: "Condição com texto: começa com um pedaço.",
    level: "basico",
    focus: ["variable", "condition", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Rota" }),
        node("var-1", "variable", 280, 200, {
          label: "Alvo",
          variableName: "destino",
          dataType: "texto",
          valueExpr: '"Marte"',
        }),
        node("if-1", "condition", 540, 200, {
          label: "Filtro",
          leftExpr: "destino",
          operator: "comecaCom",
          rightExpr: '"Mar"',
          trueLabel: "marte",
          falseLabel: "outro",
        }),
        node("print-yes", "print", 820, 80, {
          label: "Confirmado",
          template: "🪐 Rumo a Marte confirmado!",
        }),
        node("print-no", "print", 820, 340, {
          label: "Recalcular",
          template: "🌠 Outro destino — recalcular rota.",
        }),
        node("end-1", "end", 1100, 200, { label: "Nave" }),
      ],
      edges: [
        edge("e1", "start-1", "var-1"),
        edge("e2", "var-1", "if-1"),
        edge("e3", "if-1", "print-yes", "true", "sim"),
        edge("e4", "if-1", "print-no", "false", "não"),
        edge("e5", "print-yes", "end-1"),
        edge("e6", "print-no", "end-1"),
      ],
    },
  },

  repeticao: {
    name: "Contagem orbital",
    description: "Loop Para de 1 até 5.",
    level: "basico",
    focus: ["loop", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Torre" }),
        node("loop-1", "loop", 300, 200, {
          label: "Órbita",
          loopType: "para",
          counterVar: "i",
          fromExpr: "1",
          toExpr: "5",
          stepExpr: "1",
        }),
        node("print-1", "print", 600, 80, {
          label: "Beacon",
          template: "📡 Volta {i} — sinal enviado.",
        }),
        node("end-1", "end", 600, 360, { label: "Término" }),
      ],
      edges: [
        edge("e1", "start-1", "loop-1"),
        edge("e2", "loop-1", "print-1", "body", "corpo"),
        edge("e3", "print-1", "loop-1"),
        edge("e4", "loop-1", "end-1", "done", "depois"),
      ],
    },
  },

  "loop-enquanto": {
    name: "Contagem regressiva",
    description: "Loop Enquanto até o contador chegar a zero.",
    level: "intermediario",
    focus: ["loop", "variable", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Plataforma" }),
        node("var-init", "variable", 260, 200, {
          label: "Timer",
          variableName: "n",
          dataType: "numero",
          valueExpr: "3",
        }),
        node("loop-1", "loop", 500, 200, {
          label: "Enquanto n > 0",
          loopType: "enquanto",
          leftExpr: "n",
          operator: ">",
          rightExpr: "0",
        }),
        node("print-1", "print", 780, 80, {
          label: "Megafone",
          template: "🔥 {n}...",
        }),
        node("var-dec", "variable", 780, 320, {
          label: "Diminuir",
          variableName: "n",
          dataType: "numero",
          valueExpr: "n - 1",
        }),
        node("end-1", "end", 780, 480, { label: "Decolou!" }),
      ],
      edges: [
        edge("e1", "start-1", "var-init"),
        edge("e2", "var-init", "loop-1"),
        edge("e3", "loop-1", "print-1", "body", "corpo"),
        edge("e4", "print-1", "var-dec"),
        edge("e5", "var-dec", "loop-1"),
        edge("e6", "loop-1", "end-1", "done", "depois"),
      ],
    },
  },

  listas: {
    name: "Frutas na estação",
    description: "Criar lista e percorrer com Para cada.",
    level: "intermediario",
    focus: ["list", "loop", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Mercado" }),
        node("list-1", "list", 300, 200, {
          label: "Estoque",
          listOp: "criar",
          listName: "frutas",
          itemsExpr: '"maçã", "banana", "uva"',
          dataType: "texto",
        }),
        node("loop-1", "loop", 580, 200, {
          label: "Para cada item",
          loopType: "paraCada",
          listName: "frutas",
          itemVar: "fruta",
        }),
        node("print-1", "print", 880, 80, {
          label: "Scanner",
          template: "📦 Item: {fruta}",
        }),
        node("end-1", "end", 880, 360, { label: "Inventário" }),
      ],
      edges: [
        edge("e1", "start-1", "list-1"),
        edge("e2", "list-1", "loop-1"),
        edge("e3", "loop-1", "print-1", "body", "corpo"),
        edge("e4", "print-1", "loop-1"),
        edge("e5", "loop-1", "end-1", "done", "depois"),
      ],
    },
  },

  "list-planetas": {
    name: "Catálogo estelar",
    description: "Criar uma lista e mostrar o tamanho.",
    level: "basico",
    focus: ["list", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Observatório" }),
        node("list-1", "list", 300, 200, {
          label: "Sistema solar",
          listOp: "criar",
          listName: "planetas",
          itemsExpr: '"Mercúrio", "Vênus", "Terra", "Marte"',
        }),
        node("list-2", "list", 580, 200, {
          label: "Contagem",
          listOp: "tamanho",
          listName: "planetas",
          targetVar: "quantidade",
        }),
        node("print-1", "print", 860, 200, {
          label: "Telescópio",
          template: "✨ {quantidade} planetas catalogados!",
        }),
        node("end-1", "end", 1140, 200, { label: "Atlas" }),
      ],
      edges: [
        edge("e1", "start-1", "list-1"),
        edge("e2", "list-1", "list-2"),
        edge("e3", "list-2", "print-1"),
        edge("e4", "print-1", "end-1"),
      ],
    },
  },

  "list-operacoes": {
    name: "Carga da nave",
    description: "Criar lista, adicionar item e contar.",
    level: "intermediario",
    focus: ["list", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Doca" }),
        node("list-1", "list", 280, 200, {
          label: "Baú inicial",
          listOp: "criar",
          listName: "cargas",
          itemsExpr: '"oxigênio", "água"',
        }),
        node("list-2", "list", 540, 200, {
          label: "Adicionar",
          listOp: "adicionar",
          listName: "cargas",
          valueExpr: '"comida"',
        }),
        node("list-3", "list", 800, 200, {
          label: "Inventário",
          listOp: "tamanho",
          listName: "cargas",
          targetVar: "total",
        }),
        node("print-1", "print", 1060, 200, {
          label: "Manifesto",
          template: "📋 {total} itens a bordo.",
        }),
        node("end-1", "end", 1320, 200, { label: "Partida" }),
      ],
      edges: [
        edge("e1", "start-1", "list-1"),
        edge("e2", "list-1", "list-2"),
        edge("e3", "list-2", "list-3"),
        edge("e4", "list-3", "print-1"),
        edge("e5", "print-1", "end-1"),
      ],
    },
  },

  "listas-avancado": {
    name: "Maior nota espacial",
    description: "Lista + função + condição implícita no resultado.",
    level: "avancado",
    focus: ["list", "function", "print"],
    graph: {
      nodes: [
        node("start-1", "start", 40, 200, { label: "Academia" }),
        node("list-1", "list", 280, 200, {
          label: "Provas",
          listOp: "criar",
          listName: "notas",
          itemsExpr: "7, 9, 10, 8",
        }),
        node("fn-1", "function", 540, 200, {
          label: "Recorde",
          functionCategory: "lista",
          functionName: "maior",
          functionArgs: ["notas"],
          targetVar: "recorde",
        }),
        node("fn-2", "function", 810, 200, {
          label: "Comemorar",
          functionCategory: "texto",
          functionName: "juntar",
          functionArgs: ['"Nota máxima: "', "{recorde}"],
          targetVar: "mensagem",
        }),
        node("print-1", "print", 1080, 200, {
          label: "Troféu",
          template: "🏆 {mensagem}",
        }),
        node("end-1", "end", 1340, 200, { label: "Hall da fama" }),
      ],
      edges: [
        edge("e1", "start-1", "list-1"),
        edge("e2", "list-1", "fn-1"),
        edge("e3", "fn-1", "fn-2"),
        edge("e4", "fn-2", "print-1"),
        edge("e5", "print-1", "end-1"),
      ],
    },
  },
}

export const DEFAULT_GRAPH: WorkflowGraph = EXAMPLE_PROGRAMS.hello.graph
