export type ManualVisual =
  | "welcome"
  | "definition"
  | "how"
  | "daily"
  | "variables"
  | "constants"
  | "types"
  | "memory"
  | "operators"
  | "relational"
  | "logical"
  | "expression"
  | "condition"
  | "ifelse"
  | "chain"
  | "loop"
  | "while"
  | "for"
  | "control"
  | "array"
  | "index"
  | "matrix"
  | "iterate"
  | "exercise"

export type ManualAccent = "cyan" | "violet" | "amber" | "emerald" | "rose" | "sky"

export interface ManualSlide {
  id: string
  title: string
  subtitle: string
  points: string[]
  visual: ManualVisual
  snippet?: string
}

export interface ManualExercise {
  id: string
  number: 1 | 2 | 3
  title: string
  question: string
  options: string[]
  correctIndex: number
  hint: string
  answer: string
}

export interface ManualLesson {
  id: string
  number: number
  title: string
  summary: string
  learnGoals: string[]
  accent: ManualAccent
  slides: ManualSlide[]
  exercises: ManualExercise[]
}

export type ManualStep =
  | { kind: "slide"; lessonId: string; lessonNumber: number; lessonTitle: string; accent: ManualAccent; data: ManualSlide }
  | { kind: "exercise"; lessonId: string; lessonNumber: number; lessonTitle: string; accent: ManualAccent; data: ManualExercise }

export function flattenLessonSteps(lesson: ManualLesson): ManualStep[] {
  const slides: ManualStep[] = lesson.slides.map((slide) => ({
    kind: "slide",
    lessonId: lesson.id,
    lessonNumber: lesson.number,
    lessonTitle: lesson.title,
    accent: lesson.accent,
    data: slide,
  }))
  const exercises: ManualStep[] = lesson.exercises.map((exercise) => ({
    kind: "exercise",
    lessonId: lesson.id,
    lessonNumber: lesson.number,
    lessonTitle: lesson.title,
    accent: lesson.accent,
    data: exercise,
  }))
  return [...slides, ...exercises]
}

export function getLessonStepCount(lesson: ManualLesson): number {
  return lesson.slides.length + lesson.exercises.length
}

export const MANUAL_LESSONS: ManualLesson[] = [
  {
    id: "algoritmo-logica",
    number: 1,
    title: "Algoritmos e lógica",
    summary: "O que é um algoritmo, por que a ordem importa e como o computador executa instruções.",
    learnGoals: [
      "Definir algoritmo com precisão",
      "Organizar um problema em sequência lógica",
      "Relacionar entrada, processamento e saída",
    ],
    accent: "cyan",
    slides: [
      {
        id: "a1-s1",
        title: "O que é um algoritmo",
        subtitle:
          "{name}, algoritmo é um conjunto finito de instruções claras, ordenadas e executáveis para resolver um problema.",
        points: [
          "Finito: termina depois de um número definido de passos.",
          "Preciso: cada instrução tem um único significado.",
          "Ordenado: a sequência dos passos altera o resultado.",
          "No Logic Flow, cada bloco que você arrasta é uma dessas instruções.",
        ],
        visual: "welcome",
      },
      {
        id: "a1-s2",
        title: "Sequência lógica",
        subtitle: "Qualquer tarefa se decompõe em etapas. Pular ou inverter uma etapa produz um resultado errado.",
        points: [
          "Início define o ponto de partida do fluxo.",
          "Os passos intermediários transformam os dados.",
          "O fim marca a conclusão do processo.",
          "Antes de montar blocos, descreva a ordem no papel.",
        ],
        visual: "definition",
      },
      {
        id: "a1-s3",
        title: "Como o computador executa",
        subtitle: "A máquina não interpreta intenção. Ela segue exatamente o que o fluxo descreve, bloco a bloco.",
        points: [
          "Modelo clássico: entrada → processamento → saída.",
          "Entrada: dados obtidos (teclado, variável, lista).",
          "Processamento: cálculos, decisões e repetição.",
          "Saída: o resultado exibido ou armazenado.",
        ],
        visual: "how",
        snippet: "entrada  →  processar  →  saída",
      },
      {
        id: "a1-s4",
        title: "Do cotidiano ao código",
        subtitle: "Tarefas simples já são algoritmos. Formalizá-las revela decisões e dependências.",
        points: [
          "Primeiro reúna os recursos necessários.",
          "Depois trate a condição: o que fazer se faltar um item.",
          "Por fim execute a ação e verifique o resultado.",
          "Se a ordem estiver invertida, o processo falha.",
        ],
        visual: "daily",
        snippet: "1. preparar\n2. se faltar ingrediente → obter\n3. executar\n4. verificar",
      },
    ],
    exercises: [
      {
        id: "a1-e1",
        number: 1,
        title: "Ordem dos passos",
        question: "Qual sequência está correta para escovar os dentes?",
        options: [
          "Enxaguar → passar pasta → pegar a escova",
          "Pegar a escova → passar pasta → escovar → enxaguar",
          "Passar pasta → pegar a escova → escovar",
        ],
        hint: "O recurso precisa estar na mão antes da ação principal.",
        correctIndex: 1,
        answer: "B. Sem a escova, não há como aplicar a pasta nem escovar. O enxágue é a etapa final.",
      },
      {
        id: "a1-e2",
        number: 2,
        title: "Identifique o algoritmo",
        question: "Qual das opções descreve um algoritmo válido?",
        options: [
          "Pensar em um número até ficar satisfeito",
          "Ler um número → se for par, mostrar “par”; senão, mostrar “ímpar” → fim",
          "Resolver o problema de algum jeito",
        ],
        hint: "Um algoritmo tem início, passos finitos e critério de término.",
        correctIndex: 1,
        answer:
          "B. Há entrada, uma decisão objetiva e um fim definido. As outras opções são vagas e podem não terminar.",
      },
      {
        id: "a1-e3",
        number: 3,
        title: "Corrija a sequência",
        question:
          "Um robô deve acender a luz. A ordem atual é: 1) apertar o interruptor  2) entrar no quarto. Por que o procedimento falha?",
        options: [
          "O interruptor está quebrado, então nenhum passo funciona",
          "A ordem está invertida: é preciso entrar no quarto antes de acionar o interruptor",
          "Falta apagar a luz depois de acender",
        ],
        hint: "A ação só é possível no ambiente correto.",
        correctIndex: 1,
        answer:
          "A ordem está invertida. O correto é entrar no quarto e, em seguida, acionar o interruptor. Sem o deslocamento, a ação não tem efeito.",
      },
    ],
  },
  {
    id: "variaveis-tipos",
    number: 2,
    title: "Variáveis, constantes e tipos",
    summary: "Como nomear, guardar e classificar dados na memória do programa.",
    learnGoals: [
      "Declarar variáveis com nomes significativos",
      "Distinguir valor mutável de constante",
      "Reconhecer inteiro, real, texto e lógico",
    ],
    accent: "violet",
    slides: [
      {
        id: "a2-s1",
        title: "O que é uma variável",
        subtitle: "Variável é um espaço nomeado na memória. O rótulo permanece; o conteúdo pode mudar. Você escolhe o nome.",
        points: [
          "O nome identifica o dado ao longo do fluxo.",
          "Prefira nomes descritivos: nota, total, ativo.",
          "Evite abreviações opacas como x1 ou tmp2.",
          "No editor, o bloco Variável cria essa caixinha para você.",
        ],
        visual: "variables",
        snippet: 'nome ← "{name}"\nidade ← 15',
      },
      {
        id: "a2-s2",
        title: "Constantes",
        subtitle: "Constante também ocupa memória, mas o valor é definido uma vez e não deve ser alterado. Use para regras fixas.",
        points: [
          "Use para valores que representam regra de negócio.",
          "Exemplos: PI, taxa máxima, limite de tentativas.",
          "Reduz erro: ninguém sobrescreve o valor no meio do fluxo.",
          "Se o dado muda durante a execução, é variável.",
        ],
        visual: "constants",
        snippet: "PI ← 3.14159\nLIMITE ← 10",
      },
      {
        id: "a2-s3",
        title: "Tipos de dados",
        subtitle: "O tipo informa ao computador que operações são válidas sobre aquele valor.",
        points: [
          "Inteiro: 0, 18, −3 — contagens e índices.",
          "Real: 7.5, 3.14 — medidas e médias.",
          "Texto: \"{name}\" — precisa de aspas.",
          "Lógico: verdadeiro ou falso — base das decisões.",
        ],
        visual: "types",
      },
      {
        id: "a2-s4",
        title: "Atribuição e memória",
        subtitle: "Atribuir é copiar um valor para o espaço da variável. A operação da direita ocorre primeiro.",
        points: [
          "idade ← 12 guarda um inteiro na variável idade.",
          "idade ← idade + 1 lê o valor atual, soma 1 e grava de novo.",
          "Misturar tipos incompatíveis gera erro ou resultado inesperado.",
          "A memória do painel Carga mostra o valor em tempo de execução.",
        ],
        visual: "memory",
        snippet: "x ← 10\nx ← x + 5\nescreva(x)   // 15",
      },
    ],
    exercises: [
      {
        id: "a2-e1",
        number: 1,
        title: "Identifique o tipo",
        question: "Classifique cada valor: 42 · \"Logic Flow\" · verdadeiro · 7.5",
        options: [
          "42 texto · \"Logic Flow\" inteiro · verdadeiro real · 7.5 lógico",
          "42 inteiro · \"Logic Flow\" texto · verdadeiro lógico · 7.5 real",
          "42 real · \"Logic Flow\" texto · verdadeiro inteiro · 7.5 lógico",
        ],
        hint: "Aspas indicam texto. Ponto decimal indica real. verdadeiro/falso é lógico.",
        correctIndex: 1,
        answer: "42 → inteiro · \"Logic Flow\" → texto · verdadeiro → lógico · 7.5 → real.",
      },
      {
        id: "a2-e2",
        number: 2,
        title: "Variável ou constante?",
        question:
          "Em um jogo, a gravidade vale sempre 9.8 e a pontuação aumenta a cada fase. O que deve ser constante e o que deve ser variável?",
        options: [
          "Gravidade variável e pontuação constante",
          "Gravidade constante e pontuação variável",
          "As duas devem ser constantes",
        ],
        hint: "O que não muda após definido é constante.",
        correctIndex: 1,
        answer: "Gravidade → constante. Pontuação → variável, porque o valor se altera durante a execução.",
      },
      {
        id: "a2-e3",
        number: 3,
        title: "Atribuição em sequência",
        question: "Qual o valor impresso após x ← 10, depois x ← x + 5, depois escreva(x)?",
        options: ["10", "15", "5"],
        hint: "A segunda atribuição usa o valor atual de x.",
        correctIndex: 1,
        answer: "15. x inicia em 10 e é atualizado para 15 antes da escrita.",
      },
    ],
  },
  {
    id: "operadores",
    number: 3,
    title: "Operadores",
    summary: "Cálculo, comparação e combinação de condições com precedência correta.",
    learnGoals: [
      "Aplicar operadores aritméticos e o resto da divisão",
      "Comparar valores e obter verdadeiro ou falso",
      "Combinar condições com E, OU e NÃO",
    ],
    accent: "amber",
    slides: [
      {
        id: "a3-s1",
        title: "Operadores aritméticos",
        subtitle: "Transformam números. A precedência segue a matemática: parênteses, depois × e ÷, por fim + e −.",
        points: [
          "+ soma e − subtração.",
          "* multiplicação e / divisão.",
          "% (ou mod) devolve o resto: 7 % 2 = 1.",
          "Parênteses eliminam ambiguidade: (8 + 2) * 3.",
        ],
        visual: "operators",
      },
      {
        id: "a3-s2",
        title: "Operadores relacionais",
        subtitle: "Comparam dois valores e produzem um resultado lógico — a base do bloco Se / Senão.",
        points: [
          "> maior e < menor.",
          ">= maior ou igual e <= menor ou igual.",
          "== (ou =) testa igualdade; != (ou <>) testa diferença.",
          "idade >= 18 resulta em verdadeiro ou falso, nunca em um número.",
        ],
        visual: "relational",
      },
      {
        id: "a3-s3",
        title: "Operadores lógicos",
        subtitle: "Combinam condições para expressar regras compostas.",
        points: [
          "E (and): as duas condições precisam ser verdadeiras.",
          "OU (or): basta uma das condições ser verdadeira.",
          "NÃO (not): inverte o valor lógico.",
          "Exemplo: (nota >= 7) E (faltas < 5).",
        ],
        visual: "logical",
      },
      {
        id: "a3-s4",
        title: "Expressões compostas",
        subtitle: "Uma expressão reúne valores e operadores até produzir um único resultado. Avalie as partes internas primeiro.",
        points: [
          "Aritmética: (10 + 5) * 2 → 30.",
          "Relacional: idade >= 18 → verdadeiro ou falso.",
          "Lógica: duas comparações unidas por E ou OU.",
          "Avalie sempre as partes internas antes de combinar.",
        ],
        visual: "expression",
        snippet: "(nota >= 7) E (faltas < 5)",
      },
    ],
    exercises: [
      {
        id: "a3-e1",
        number: 1,
        title: "Precedência",
        question: "Quanto vale (8 + 2) * 3 − 4 / 2?",
        options: ["28", "26", "30"],
        hint: "Resolva parênteses, depois multiplicação e divisão, da esquerda para a direita.",
        correctIndex: 0,
        answer: "28. (8 + 2) = 10 → 10 * 3 = 30 → 4 / 2 = 2 → 30 − 2 = 28.",
      },
      {
        id: "a3-e2",
        number: 2,
        title: "Comparação",
        question: "Se x = 15, qual expressão é verdadeira?",
        options: ["x < 10", "x >= 15", "x == 20"],
        hint: "Substitua x por 15 em cada alternativa.",
        correctIndex: 1,
        answer: "B. 15 >= 15 é verdadeiro. As outras comparações são falsas.",
      },
      {
        id: "a3-e3",
        number: 3,
        title: "Condição composta",
        question: "nota = 8 e faltas = 3. A expressão (nota >= 7) E (faltas <= 5) é verdadeira ou falsa?",
        options: ["Verdadeira", "Falsa"],
        hint: "Avalie cada lado e só então aplique o E.",
        correctIndex: 0,
        answer: "Verdadeira. 8 >= 7 e 3 <= 5 são ambos verdadeiros; E exige os dois.",
      },
    ],
  },
  {
    id: "condicionais",
    number: 4,
    title: "Estruturas condicionais",
    summary: "Como o fluxo escolhe um caminho com se, senão e senão-se.",
    learnGoals: [
      "Decidir com base em uma condição lógica",
      "Usar o caminho alternativo com senão",
      "Encadear faixas de valores com senão-se",
    ],
    accent: "emerald",
    slides: [
      {
        id: "a4-s1",
        title: "Por que o fluxo decide",
        subtitle: "Sem decisão, o programa segue sempre o mesmo caminho. Condicionais tornam o comportamento dependente dos dados.",
        points: [
          "A condição é uma expressão lógica.",
          "Se for verdadeira, executa um bloco.",
          "Se for falsa, ignora esse bloco ou segue o senão.",
          "No canvas, o bloco Se / Senão cria dois caminhos.",
        ],
        visual: "condition",
      },
      {
        id: "a4-s2",
        title: "Se (if)",
        subtitle: "Testa uma única condição. O bloco interno só roda quando o teste é verdadeiro.",
        points: [
          "A condição precisa resultar em verdadeiro ou falso.",
          "Não use atribuição no lugar de comparação.",
          "Se a condição for falsa, o fluxo continua depois do se.",
          "Ideal para ações opcionais: só executar se houver dado.",
        ],
        visual: "condition",
        snippet: "se (n > 0) então\n  escreva(\"positivo\")\nfimse",
      },
      {
        id: "a4-s3",
        title: "Senão (else)",
        subtitle: "Garante um caminho quando a condição falha. Exatamente um dos dois blocos será executado.",
        points: [
          "Caminho A: condição verdadeira.",
          "Caminho B: condição falsa.",
          "Evita deixar o caso contrário sem tratamento.",
          "Exemplo clássico: maior de idade ou menor de idade.",
        ],
        visual: "ifelse",
        snippet: "se idade >= 18 então\n  escreva(\"adulto\")\nsenão\n  escreva(\"menor\")\nfimse",
      },
      {
        id: "a4-s4",
        title: "Decisões encadeadas",
        subtitle: "senão-se (else if) cobre várias faixas. Avalie do caso mais específico para o mais geral.",
        points: [
          "A primeira condição verdadeira vence; as demais são ignoradas.",
          "A ordem das faixas importa: >= 9 antes de >= 7.",
          "O senão final captura tudo o que não entrou nas regras.",
          "Não sobreponha intervalos de forma ambígua.",
        ],
        visual: "chain",
        snippet: "se nota >= 9 então \"A\"\nsenão se nota >= 7 então \"B\"\nsenão \"C\"",
      },
    ],
    exercises: [
      {
        id: "a4-e1",
        number: 1,
        title: "Trace o caminho",
        question: "idade = 16. O que o programa escreve?\nse idade >= 18 então escreva(\"Adulto\") senão escreva(\"Menor\")",
        options: ["Adulto", "Menor", "Nada é escrito"],
        hint: "16 >= 18 é falso, então o fluxo segue o senão.",
        correctIndex: 1,
        answer: "Menor. A condição é falsa e o bloco senão é executado.",
      },
      {
        id: "a4-e2",
        number: 2,
        title: "Escreva a condição",
        question: "Como testar se um número n é estritamente positivo?",
        options: ["se (n != 0) então …", "se (n > 0) então …", "se (n >= 0) então …"],
        hint: "Positivo significa maior que zero, não apenas diferente de zero.",
        correctIndex: 1,
        answer: "se (n > 0) então … — n != 0 também incluiria negativos, o que está incorreto.",
      },
      {
        id: "a4-e3",
        number: 3,
        title: "Corrija o critério",
        question:
          "O desconto deveria valer para idade maior ou igual a 60, mas quem tem 60 anos nunca recebe. O teste usado é idade > 60. Qual o erro?",
        options: [
          "Trocar para idade >= 60, porque 60 fica de fora com >",
          "Trocar para idade == 60, para acertar só esse valor",
          "Manter idade > 60 e somar 1 à idade antes do teste",
        ],
        hint: "Compare > com >= no limite da faixa.",
        correctIndex: 0,
        answer: "Troque para idade >= 60. Com > 60, o valor 60 fica de fora da regra.",
      },
    ],
  },
  {
    id: "repeticao",
    number: 5,
    title: "Estruturas de repetição",
    summary: "Quando usar enquanto e para, e como garantir que o loop termina.",
    learnGoals: [
      "Reconhecer problemas que pedem repetição",
      "Escolher while ou for conforme o caso",
      "Atualizar o estado para evitar loop infinito",
    ],
    accent: "sky",
    slides: [
      {
        id: "a5-s1",
        title: "Por que repetir",
        subtitle: "Loops executam o mesmo bloco várias vezes, sem você duplicar código.",
        points: [
          "Contar de 1 a 100.",
          "Pedir senha até o valor ser válido.",
          "Percorrer todos os itens de uma lista.",
          "Se a quantidade de voltas é conhecida, prefira para.",
        ],
        visual: "loop",
      },
      {
        id: "a5-s2",
        title: "Enquanto (while)",
        subtitle: "Repete enquanto a condição permanecer verdadeira. Pode executar zero vezes.",
        points: [
          "A condição é testada antes de cada volta.",
          "Se já começa falsa, o corpo não roda.",
          "É preciso alterar alguma variável dentro do corpo.",
          "Condição que nunca fica falsa gera loop infinito.",
        ],
        visual: "while",
        snippet: "enquanto n > 0 faça\n  escreva(n)\n  n ← n - 1\nfimenquanto",
      },
      {
        id: "a5-s3",
        title: "Para (for)",
        subtitle: "Usa um contador com início, fim e passo. Adequado quando o intervalo é conhecido.",
        points: [
          "O contador começa no valor inicial.",
          "A cada volta, avança até atingir o limite.",
          "Os extremos entram na contagem: de 1 até 5 são 5 voltas.",
          "Evite alterar o contador manualmente no corpo.",
        ],
        visual: "for",
        snippet: "para i de 1 até 10 faça\n  escreva(i)\nfimpara",
      },
      {
        id: "a5-s4",
        title: "Controle de término",
        subtitle: "Todo loop precisa de um critério claro de parada. Sem ele, a execução não devolve o controle.",
        points: [
          "While: a condição deve se tornar falsa em algum momento.",
          "For: o contador chega ao limite e encerra.",
          "Atualize o estado no corpo — senão a condição não muda.",
          "Teste com valores pequenos antes de ampliar o intervalo.",
        ],
        visual: "control",
      },
    ],
    exercises: [
      {
        id: "a5-e1",
        number: 1,
        title: "Quantas voltas",
        question: "Quantas vezes o corpo executa?\npara i de 1 até 5 faça\n  escreva(i)\nfimpara",
        options: ["4 vezes", "5 vezes", "6 vezes"],
        hint: "Inclua o valor inicial e o valor final.",
        correctIndex: 1,
        answer: "5 vezes. i assume 1, 2, 3, 4 e 5.",
      },
      {
        id: "a5-e2",
        number: 2,
        title: "Complete o acumulador",
        question:
          "Complete para somar 1 + 2 + … + 10:\nsoma ← 0\npara i de ___ até ___ faça\n  soma ← soma + i\nfimpara",
        options: ["para i de 0 até 10", "para i de 1 até 10", "para i de 1 até 9"],
        hint: "O contador percorre todos os termos da soma.",
        correctIndex: 1,
        answer: "para i de 1 até 10. Ao final, soma = 55.",
      },
      {
        id: "a5-e3",
        number: 3,
        title: "Trace a saída",
        question: "O que é escrito?\nn ← 3\nenquanto n > 0 faça\n  escreva(n)\n  n ← n - 1\nfimenquanto",
        options: ["3, 2, 1, 0", "3, 2, 1", "3, 2"],
        hint: "Acompanhe n a cada volta até a condição falhar.",
        correctIndex: 1,
        answer: "3, depois 2, depois 1. Quando n chega a 0, o enquanto encerra.",
      },
    ],
  },
  {
    id: "vetores-matrizes",
    number: 6,
    title: "Listas",
    summary: "Listas indexadas, acesso por posição e tabelas de duas dimensões.",
    learnGoals: [
      "Guardar vários valores em uma única variável",
      "Acessar elementos pelo índice",
      "Percorrer listas e interpretar matrizes",
    ],
    accent: "rose",
    slides: [
      {
        id: "a6-s1",
        title: "O que é um vetor",
        subtitle: "Vetor (array) é uma coleção ordenada de valores do mesmo tipo, referenciada por um único nome.",
        points: [
          "Um nome, várias posições.",
          "A ordem é estável: o primeiro item permanece o primeiro.",
          "O índice começa em 0 na maioria das linguagens e no Logic Flow.",
          "Exemplo: notas ← [7, 8, 9, 6].",
        ],
        visual: "array",
        snippet: "notas ← [7, 8, 9, 6]",
      },
      {
        id: "a6-s2",
        title: "Índices",
        subtitle: "O índice é o endereço da posição. O primeiro elemento está em [0], nunca em [1].",
        points: [
          "notas[0] → 7, o primeiro valor.",
          "notas[1] → 8, o segundo valor.",
          "O último índice é tamanho − 1.",
          "Acessar um índice inexistente causa erro.",
        ],
        visual: "index",
      },
      {
        id: "a6-s3",
        title: "Matrizes",
        subtitle: "Matriz é um vetor de vetores: uma tabela endereçada por linha e coluna.",
        points: [
          "Acesso no formato tabela[linha][coluna].",
          "A primeira linha é [0]; a primeira coluna também.",
          "Útil para grades, mapas e planilhas.",
          "Mantenha todas as linhas com o mesmo número de colunas.",
        ],
        visual: "matrix",
        snippet: "mat[1][0]  // linha 1, coluna 0",
      },
      {
        id: "a6-s4",
        title: "Percorrendo a lista",
        subtitle: "Loops e vetores se combinam: o contador vira o índice de cada posição. Você percorre a lista sem repetir o código.",
        points: [
          "O for vai de 0 até tamanho − 1.",
          "lista[i] lê o elemento da volta atual.",
          "para cada item em lista percorre sem gerenciar o índice.",
          "No editor, o bloco Repetir percorre a lista criada em Lista.",
        ],
        visual: "iterate",
        snippet: "para i de 0 até tamanho(lista) - 1 faça\n  escreva(lista[i])\nfimpara",
      },
    ],
    exercises: [
      {
        id: "a6-e1",
        number: 1,
        title: "Acesse o elemento",
        question: "Dado nomes ← [\"{name}\", \"Bia\", \"Caio\"], qual é o valor de nomes[1]?",
        options: ['"Ana"', '"Bia"', '"Caio"'],
        hint: "O índice 0 corresponde ao primeiro nome.",
        correctIndex: 1,
        answer: "\"Bia\". O índice 1 é a segunda posição. O primeiro item, \"{name}\", está em nomes[0].",
      },
      {
        id: "a6-e2",
        number: 2,
        title: "Tamanho e último índice",
        question: "valores ← [10, 20, 30, 40, 50]. Quantos itens há e qual o índice do último?",
        options: [
          "5 itens; o último índice é 4",
          "5 itens; o último índice é 5",
          "4 itens; o último índice é 4",
        ],
        hint: "Com n elementos, os índices válidos vão de 0 até n − 1.",
        correctIndex: 0,
        answer: "5 itens. O último índice é 4, e valores[4] = 50.",
      },
      {
        id: "a6-e3",
        number: 3,
        title: "Leitura em matriz",
        question: "Em mat ← [[1, 2], [3, 4], [5, 6]], quanto vale mat[1][0]?",
        options: ["1", "3", "4"],
        hint: "Primeiro selecione a linha, depois a coluna.",
        correctIndex: 1,
        answer: "3. mat[1] é [3, 4]; o índice 0 dessa linha é 3.",
      },
    ],
  },
]

export function getManualLesson(id: string): ManualLesson | undefined {
  return MANUAL_LESSONS.find((lesson) => lesson.id === id)
}

export const MANUAL_TOTAL_EXERCISES = MANUAL_LESSONS.reduce((sum, lesson) => sum + lesson.exercises.length, 0)
export const MANUAL_TOTAL_SLIDES = MANUAL_LESSONS.reduce((sum, lesson) => sum + lesson.slides.length, 0)
