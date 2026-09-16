export type ManualVisual =
  | "welcome"
  | "learn"
  | "definition"
  | "purpose"
  | "how"
  | "daily"
  | "everywhere"
  | "launch"

export interface ManualSlide {
  id: string
  emoji: string
  title: string
  subtitle: string
  points: string[]
  visual: ManualVisual
  accent: "cyan" | "violet" | "amber" | "emerald" | "rose" | "sky"
}

export const MANUAL_SLIDES: ManualSlide[] = [
  {
    id: "welcome",
    emoji: "🧑‍🚀",
    title: "Bem-vindo, Comandante!",
    subtitle: "Você acaba de embarcar na Estação Orbital Logic Flow — um laboratório espacial para aprender lógica de programação brincando.",
    points: [
      "Monte fluxos arrastando blocos, como peças de um foguete.",
      "Veja o computador executar passo a passo, em tempo real.",
      "Salve missões e volte quando quiser continuar a jornada.",
    ],
    visual: "welcome",
    accent: "cyan",
  },
  {
    id: "learn",
    emoji: "🎯",
    title: "O que você vai aprender",
    subtitle: "Aqui você descobre algoritmos de um jeito leve — montando programas visuais, sem complicação.",
    points: [
      "Variáveis — caixinhas que guardam informações.",
      "Condições — escolher caminhos com Se / Senão.",
      "Repetição — loops para não repetir tudo na mão.",
      "Listas e funções — organizar dados e usar ferramentas prontas.",
    ],
    visual: "learn",
    accent: "violet",
  },
  {
    id: "what",
    emoji: "🧠",
    title: "O que é um algoritmo?",
    subtitle: "Algoritmo é uma sequência finita de passos, bem definidos, para resolver um problema ou atingir um objetivo.",
    points: [
      "É como uma receita ou um roteiro de missão espacial.",
      "Cada passo é claro — sem “acho que” ou “mais ou menos”.",
      "Tem começo, meio e fim — sempre termina.",
      "Se você seguir na ordem certa, chega ao resultado esperado.",
    ],
    visual: "definition",
    accent: "amber",
  },
  {
    id: "why",
    emoji: "💡",
    title: "Para que serve?",
    subtitle: "Algoritmos existem para transformar problemas em soluções repetíveis — para humanos e para máquinas.",
    points: [
      "Automatizar tarefas chatas ou demoradas.",
      "Tomar decisões com base em regras (ex.: aprovado ou não).",
      "Processar muita informação sem se perder.",
      "Criar jogos, apps, robôs e até guiar naves no espaço.",
    ],
    visual: "purpose",
    accent: "emerald",
  },
  {
    id: "how",
    emoji: "⚙️",
    title: "Como funciona?",
    subtitle: "Todo algoritmo segue a mesma lógica: recebe algo, processa em etapas e devolve um resultado.",
    points: [
      "Entrada — o que entra (número, texto, lista…).",
      "Processamento — os passos no meio (calcular, comparar, repetir).",
      "Saída — o resultado final (mensagem, valor, decisão).",
      "A ordem importa! Trocar passos pode mudar tudo.",
    ],
    visual: "how",
    accent: "sky",
  },
  {
    id: "daily",
    emoji: "☕",
    title: "Algoritmo do dia a dia",
    subtitle: "Você usa algoritmos o tempo todo — mesmo sem perceber. Veja fazer um café:",
    points: [
      "1. Pegar a xícara",
      "2. Se tiver pó → colocar na cafeteira; senão → ir à loja",
      "3. Ferver água e passar pelo café",
      "4. Servir e provar ☕",
    ],
    visual: "daily",
    accent: "amber",
  },
  {
    id: "where",
    emoji: "🌍",
    title: "Onde algoritmos são usados?",
    subtitle: "Estão por toda parte — do celular no seu bolso até missões reais no espaço.",
    points: [
      "Redes sociais — o que aparece no seu feed.",
      "GPS e mapas — a rota mais rápida até o destino.",
      "Jogos — regras, pontuação e inimigos.",
      "Medicina, bancos, clima e estações espaciais como esta! 🛸",
    ],
    visual: "everywhere",
    accent: "violet",
  },
  {
    id: "launch",
    emoji: "🚀",
    title: "Pronto para decolar?",
    subtitle: "Agora é sua vez: crie um projeto, monte seu primeiro fluxo e aperte Play para ver a mágica acontecer.",
    points: [
      "Comece pelo exemplo “Olá, comandante”.",
      "Explore as missões no painel lateral.",
      "Errar faz parte — é assim que se aprende!",
    ],
    visual: "launch",
    accent: "cyan",
  },
]
