// Dados 100% mockados do benchmark visual — sem nenhuma importação de contexto/estado real do
// app. Cada tela deste módulo lê só daqui, nunca de src/context/* ou src/pages/assistencias/*.

export const USUARIO = {
  nome: "Marina",
  saldoScore: 782,
  saldoScoreLabel: "Score financeiro",
};

export const ATALHOS_A = [
  { id: "clt", label: "CLT", icone: "Briefcase" as const },
  { id: "fgts", label: "FGTS", icone: "PiggyBank" as const },
  { id: "credito-pessoal", label: "Crédito Pessoal", icone: "Wallet" as const },
  { id: "assistencias", label: "Assistências", icone: "Heartbeat" as const },
  { id: "energia", label: "Energia", icone: "Lightning" as const },
  { id: "pontos", label: "Pontos", icone: "Coins" as const },
  { id: "open-finance", label: "Open Finance", icone: "Bank" as const },
  { id: "mais", label: "Mais", icone: "SquaresFour" as const },
];

export const BANNERS = [
  { id: "b1", titulo: "Saúde com desconto", sub: "A partir de R$39,90/mês", cor: "from-[#FD5F31] to-[#D94E28]" },
  { id: "b2", titulo: "Antecipe seu FGTS", sub: "Dinheiro na conta em minutos", cor: "from-[#0A4F73] to-[#67C7F0]" },
  { id: "b3", titulo: "Indique e ganhe", sub: "R$50 por indicação aprovada", cor: "from-[#7C3AED] to-[#A78BFA]" },
];

export const PARA_VOCE_AGORA_A = [
  { id: "p1", titulo: "Sua parcela do CLT vence em 3 dias", cta: "Ver detalhes" },
  { id: "p2", titulo: "Você tem R$2.400 disponíveis no FGTS", cta: "Simular" },
  { id: "p3", titulo: "Complete seu cadastro e ganhe 50 pontos", cta: "Completar" },
];

export const PRODUTOS_ATIVOS = [
  { id: "a1", nome: "Crédito Pessoal", detalhe: "6ª de 12 parcelas", valor: "R$ 318,00" },
  { id: "a2", nome: "Consignado CLT", detalhe: "Ativo desde Jan/2026", valor: "R$ 210,00" },
];

export const CATEGORIAS_SERVICOS = [
  { id: "saude", nome: "Saúde", icone: "Stethoscope" as const },
  { id: "educacao", nome: "Educação", icone: "Student" as const },
  { id: "mobilidade", nome: "Mobilidade", icone: "Car" as const },
  { id: "energia", nome: "Energia", icone: "Lightning" as const },
  { id: "seguros", nome: "Seguros", icone: "ShieldCheck" as const },
  { id: "lazer", nome: "Lazer", icone: "Confetti" as const },
];

export const PARCEIROS = [
  { id: "p1", nome: "BeneMed", categoria: "saude", oferta: "Até 85% off" },
  { id: "p2", nome: "Zema Financeira", categoria: "mobilidade", oferta: "Taxas reduzidas" },
  { id: "p3", nome: "Lotus Mais", categoria: "educacao", oferta: "Novo parceiro" },
  { id: "p4", nome: "Unico Seguros", categoria: "seguros", oferta: "1º mês grátis" },
  { id: "p5", nome: "C6 Energia", categoria: "energia", oferta: "20% de desconto" },
  { id: "p6", nome: "VIVA Lazer", categoria: "lazer", oferta: "Exclusivo app" },
];

export const RANKING_SEMANAL = [
  { posicao: 1, nome: "Camila S.", pontos: 1280, voce: false },
  { posicao: 2, nome: "Marina (você)", pontos: 1140, voce: true },
  { posicao: 3, nome: "Diego A.", pontos: 980, voce: false },
  { posicao: 4, nome: "Paulo H.", pontos: 860, voce: false },
];

export const MISSOES = [
  { id: "m1", titulo: "Abra o app 5 dias seguidos", progresso: 80, meta: "4/5 dias" },
  { id: "m2", titulo: "Simule um crédito", progresso: 0, meta: "0/1" },
  { id: "m3", titulo: "Indique um amigo", progresso: 50, meta: "1/2 indicações" },
];

export const RESGATES = [
  { id: "r1", nome: "R$10 de desconto Crédito Pessoal", pontos: 500 },
  { id: "r2", nome: "1 mês grátis BeneMed", pontos: 1200 },
  { id: "r3", nome: "Vale-compras R$25", pontos: 900 },
  { id: "r4", nome: "Cashback 2% extra", pontos: 700 },
];

export const HISTORICO_PONTOS = [
  { id: "h1", texto: "Login diário", pontos: 10, data: "Hoje" },
  { id: "h2", texto: "Simulação de FGTS", pontos: 30, data: "Ontem" },
  { id: "h3", texto: "Indicação aprovada", pontos: 150, data: "12/10" },
];

export const SUGESTOES_CHAT = [
  "Ver saldo FGTS",
  "Simular CLT",
  "Contratar assistência",
];

// Saudação do B1 — tela inicial estática (sem conversa em andamento ainda), input como
// elemento hero (ref: Claude.ai/Perplexity/ChatGPT). O nome vem de USUARIO.nome; aqui só a
// pergunta central e a linha de contexto discreta abaixo dela.
export const SAUDACAO_CONTEXTUAL_B1 = {
  pergunta: "O que você quer resolver hoje?",
  contexto: "Sua parcela do CLT vence em 3 dias.",
};

export const CONVERSA_B2 = [
  { autor: "usuario" as const, texto: "quero contratar uma assistência de saúde" },
  { autor: "jade" as const, texto: "Encontrei 2 opções boas pra você. Qual combina mais?" },
  {
    autor: "jade-cards" as const,
    opcoes: [
      { nome: "BeneMed Mensal", preco: "R$ 39,90/mês", desc: "Consultas, exames e descontos" },
      { nome: "BeneMed Anual", preco: "R$ 29,00/mês", desc: "Mesmo plano, mais econômico" },
    ],
  },
  { autor: "usuario" as const, texto: "quero o anual" },
  { autor: "jade" as const, texto: "Perfeito! Já deixei tudo pronto pra você confirmar o plano Anual." },
];

export const RESGATES_INLINE_B = [
  { id: "r1", nome: "1 mês grátis BeneMed", pontos: 1200 },
  { id: "r2", nome: "Vale-compras R$25", pontos: 900 },
];
