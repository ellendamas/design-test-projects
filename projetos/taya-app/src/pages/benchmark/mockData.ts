// Dados 100% mockados do benchmark visual — sem nenhuma importação de contexto/estado real do
// app. Compartilhado só entre B1/B2/B3 (a Versão A tem seu próprio mock em a/mock.ts desde a
// reescrita densa pedida por Ellen — ver src/pages/benchmark/a/).

export const USUARIO = {
  nome: "Marina",
  saldoScore: 782,
  saldoScoreLabel: "Score financeiro",
};

export const MISSOES = [
  { id: "m1", titulo: "Abra o app 5 dias seguidos", progresso: 80, meta: "4/5 dias" },
  { id: "m2", titulo: "Simule um crédito", progresso: 0, meta: "0/1" },
  { id: "m3", titulo: "Indique um amigo", progresso: 50, meta: "1/2 indicações" },
];

export const SUGESTOES_CHAT = [
  "Ver saldo FGTS",
  "Simular CLT",
  "Contratar assistência",
];

export type MensagemConversa =
  | { autor: "usuario"; texto: string }
  | { autor: "jade"; texto: string }
  | { autor: "jade-cards"; opcoes: { nome: string; preco: string; desc: string }[] };

// Saudação estática da B1 — tela de apresentação (saudação grande centralizada + chips),
// visível só antes da primeira interação. Some assim que o usuário clica numa sugestão ou
// manda uma mensagem, dando lugar à thread de chat com os balões (ver B1Dashboard.tsx).
export const SAUDACAO_CONTEXTUAL_B1 = {
  pergunta: "O que você quer resolver hoje?",
  contexto: "Fatura do seu cartão de crédito vence em 3 dias.",
};

// Uma conversa mockada por sugestão da B1 — o texto do botão é a própria chave, pra B1 só
// precisar passar a sugestão clicada/digitada e encontrar o roteiro certo. Cada roteiro tem
// uma fala curta de "consultando outro especialista" antes da revelação da oferta — sabor
// leve de orquestração multiagente (Jade nunca expõe uma UI separada pra isso, é só texto
// dentro da própria fala dela).
export const CONVERSAS_SUGESTAO: Record<string, MensagemConversa[]> = {
  "Ver saldo FGTS": [
    { autor: "usuario", texto: "quero ver meu saldo do FGTS" },
    { autor: "jade", texto: "Só um segundo, vou confirmar com o time de FGTS..." },
    { autor: "jade", texto: "Você tem R$ 2.400,00 disponíveis para antecipação. Quer simular as condições?" },
    {
      autor: "jade-cards",
      opcoes: [
        { nome: "Antecipação total", preco: "R$ 2.400,00", desc: "Recebe o valor disponível agora" },
        { nome: "Antecipação parcial", preco: "R$ 1.200,00", desc: "Metade do saldo, desconto menor" },
      ],
    },
    { autor: "usuario", texto: "quero a antecipação total" },
    { autor: "jade", texto: "Combinado! Deixei a antecipação total de R$ 2.400,00 pronta pra você confirmar." },
  ],
  "Simular CLT": [
    { autor: "usuario", texto: "quero simular o crédito consignado CLT" },
    { autor: "jade", texto: "Deixa eu checar com o time de crédito consignado..." },
    { autor: "jade", texto: "Encontrei uma oferta pra você. Olha as condições:" },
    {
      autor: "jade-cards",
      opcoes: [
        { nome: "12x", preco: "R$ 210,00/mês", desc: "Consignado CLT · desconto em folha" },
        { nome: "24x", preco: "R$ 118,00/mês", desc: "Consignado CLT · desconto em folha" },
      ],
    },
    { autor: "usuario", texto: "quero em 12x" },
    { autor: "jade", texto: "Perfeito! Já deixei a simulação de 12x pronta pra você revisar e confirmar." },
  ],
  "Contratar assistência": [
    { autor: "usuario", texto: "quero contratar uma assistência de saúde" },
    { autor: "jade", texto: "Vou confirmar com o time de Assistências quais planos estão com desconto..." },
    { autor: "jade", texto: "Encontrei 2 opções boas pra você. Qual combina mais?" },
    {
      autor: "jade-cards",
      opcoes: [
        { nome: "BeneMed Mensal", preco: "R$ 39,90/mês", desc: "Consultas, exames e descontos" },
        { nome: "BeneMed Anual", preco: "R$ 29,00/mês", desc: "Mesmo plano, mais econômico" },
      ],
    },
    { autor: "usuario", texto: "quero o anual" },
    { autor: "jade", texto: "Perfeito! Já deixei tudo pronto pra você confirmar o plano Anual." },
  ],
};

// Resumos de conversas passadas pro histórico (B2) — um item por roteiro de CONVERSAS_SUGESTAO,
// já que são as únicas conversas que de fato existem nesse mock.
export const HISTORICO_CONVERSAS = [
  {
    id: "h1",
    topico: "Contratar assistência",
    resumo: "Jade apresentou os planos BeneMed e deixou o Anual pronto pra confirmar.",
    quando: "Hoje, 09:12",
    icone: "Heartbeat" as const,
  },
  {
    id: "h2",
    topico: "Ver saldo FGTS",
    resumo: "Jade mostrou o saldo disponível e deixou a antecipação total pronta pra confirmar.",
    quando: "Ontem, 18:47",
    icone: "PiggyBank" as const,
  },
  {
    id: "h3",
    topico: "Simular CLT",
    resumo: "Jade simulou o consignado CLT em 12x e 24x, com desconto em folha.",
    quando: "12/10, 14:05",
    icone: "Briefcase" as const,
  },
];

export const RESGATES_INLINE_B = [
  { id: "r1", nome: "1 mês grátis BeneMed", pontos: 1200 },
  { id: "r2", nome: "Vale-compras R$25", pontos: 900 },
];
