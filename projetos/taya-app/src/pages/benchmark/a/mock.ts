// Dados mock exclusivos da Versão A (visão "Alipay denso") do benchmark — nenhuma importação
// de estado real do app, nada compartilhado com a Versão B.
//
// Guardrail 2 do briefing: todo nome de parceiro aqui é fictício e genérico, conferido pra não
// coincidir com nenhuma marca real conhecida (farmácia, energia, mercado, streaming, pets,
// beleza, telefonia, educação, lazer, mobilidade, seguros são todos inventados). A única
// exceção é a BeneMed, parceira real já integrada na jornada de Assistências do app de
// verdade — por isso pode aparecer aqui sem violar o guardrail ("parceiros reais da Pode Já
// só aparecem se já existirem no app").

export const USUARIO_A = {
  nome: "Marina",
  saldoScore: 782,
  nivel: "Prata",
  pontos: 1140,
  metaProximoNivel: 1500,
};

export const ATALHOS_GRANDES = [
  { id: "clt", label: "Consignado CLT", icone: "Briefcase" as const },
  { id: "fgts", label: "FGTS", icone: "PiggyBank" as const },
  { id: "credito-pessoal", label: "Crédito Pessoal", icone: "Wallet" as const },
];

export const CHECKIN_SEMANA = [
  { dia: "Seg", feito: true, hoje: false },
  { dia: "Ter", feito: true, hoje: false },
  { dia: "Qua", feito: true, hoje: false },
  { dia: "Qui", feito: true, hoje: false },
  { dia: "Sex", feito: false, hoje: true },
  { dia: "Sáb", feito: false, hoje: false },
  { dia: "Dom", feito: false, hoje: false },
];

// 20 atalhos (5 colunas x 4 linhas) — grade densa pedida no briefing. `tag`/`selo` nunca
// aparecem sozinhos sem o texto do label ao lado (guardrail 4: nada depende só de cor).
export const ATALHOS_GRID = [
  { id: "assistencias", label: "Assistências", icone: "Heartbeat" as const, tag: "HOT" },
  { id: "farmacia", label: "Farmácia", icone: "FirstAidKit" as const, tag: "-20%" },
  { id: "energia", label: "Energia", icone: "Lightning" as const, tag: null },
  { id: "pix", label: "Pix", icone: "QrCode" as const, tag: null },
  { id: "open-finance", label: "Open Finance", icone: "Bank" as const, tag: null },
  { id: "pontos", label: "Pontos", icone: "Coins" as const, tag: null, selo: 3 },
  { id: "cupons", label: "Cupons", icone: "Ticket" as const, tag: "NOVO" },
  { id: "recarga", label: "Recarga", icone: "DeviceMobileSpeaker" as const, tag: null },
  { id: "seguros", label: "Seguros", icone: "ShieldCheck" as const, tag: null },
  { id: "lazer", label: "Lazer", icone: "Confetti" as const, tag: null },
  { id: "educacao", label: "Educação", icone: "Student" as const, tag: null },
  { id: "mobilidade", label: "Mobilidade", icone: "Car" as const, tag: null },
  { id: "mercado", label: "Mercado", icone: "ShoppingCart" as const, tag: "-20%" },
  { id: "pets", label: "Pets", icone: "PawPrint" as const, tag: null },
  { id: "streaming", label: "Streaming", icone: "MonitorPlay" as const, tag: "NOVO" },
  { id: "beleza", label: "Beleza", icone: "Sparkle" as const, tag: null },
  { id: "viagens", label: "Viagens", icone: "Airplane" as const, tag: null },
  { id: "telefonia", label: "Telefonia", icone: "Phone" as const, tag: null },
  { id: "doacoes", label: "Doações", icone: "HandHeart" as const, tag: null },
  { id: "mais", label: "Mais", icone: "DotsThreeCircle" as const, tag: null },
];

export const BANNERS_A1 = [
  { id: "b1", titulo: "Semana do Cashback", sub: "Até 15% de volta em parceiros selecionados", cor: "from-[#FD5F31] to-[#FA9832]" },
  { id: "b2", titulo: "Indique e ganhe", sub: "R$50 por indicação aprovada", cor: "from-[#7C3AED] to-[#A78BFA]" },
  { id: "b3", titulo: "Assistência Saúde BeneMed", sub: "A partir de R$39,90/mês", cor: "from-[#0A4F73] to-[#67C7F0]" },
  { id: "b4", titulo: "Pontos em dobro hoje", sub: "Todo check-in vale o dobro até meia-noite", cor: "from-[#16A34A] to-[#4ADE80]" },
];

export const CUPONS = [
  { id: "c1", titulo: "R$10 OFF", parceiro: "FarmaVida", condicao: "Acima de R$50" },
  { id: "c2", titulo: "20% OFF", parceiro: "MercaFácil", condicao: "1ª compra" },
  { id: "c3", titulo: "Frete grátis", parceiro: "PetAmigo", condicao: "Acima de R$80" },
  { id: "c4", titulo: "R$15 OFF", parceiro: "ConectaMóvel", condicao: "Recarga acima de R$30" },
];

// Só parceiros não financeiros — guardrail 1 (crédito nunca recebe contagem regressiva/urgência).
export const OFERTAS_RELAMPAGO = [
  { id: "o1", parceiro: "FarmaVida", titulo: "Vitamina C 60 cáps.", desconto: "-35%", resgatadoPct: 73, tempoRestante: "02:14:33" },
  { id: "o2", parceiro: "StreamON", titulo: "1 mês grátis de streaming", desconto: "-100%", resgatadoPct: 48, tempoRestante: "05:40:02" },
];

export const MISSOES_DIA = [
  { id: "m1", titulo: "Abra o app hoje", pontos: 10, progresso: 100 },
  { id: "m2", titulo: "Confira 3 ofertas", pontos: 15, progresso: 33 },
  { id: "m3", titulo: "Faça o check-in", pontos: 10, progresso: 0 },
];

// Prêmio mock da roleta — nunca crédito (guardrail 5: recompensa útil pro ICP, não desconto
// em crédito).
export const PREMIO_ROLETA = { label: "50 pontos", icone: "Gift" as const };

export const PROVA_SOCIAL = [
  "Carlos S. resgatou R$20 de cashback",
  "Juliana M. completou o check-in de 7 dias",
  "Roberto A. ganhou 50 pontos na roleta",
  "Fernanda L. resgatou uma recarga de celular",
];

// Zona de crédito — guardrail 1: sem banner, cupom, tag promocional, contagem ou missão aqui
// dentro. "Próximo desconto" em vez de "vence": consignado CLT é descontado em folha
// automaticamente, não tem data de vencimento manual (correção já aplicada em B1/mockData.ts
// nessa mesma sessão — mantém a mesma precisão aqui).
export const PARA_VOCE_AGORA_CREDITO = [
  { id: "p1", titulo: "Próximo desconto do Consignado CLT: R$210,00 em 12/11", cta: "Ver detalhes" },
  { id: "p2", titulo: "Você tem R$2.400 disponíveis no FGTS", cta: "Simular" },
];

export const PRODUTOS_ATIVOS_A1 = [
  { id: "a1", nome: "Crédito Pessoal", detalhe: "6ª de 12 parcelas", valor: "R$ 318,00" },
  { id: "a2", nome: "Consignado CLT", detalhe: "Ativo desde Jan/2026", valor: "R$ 210,00" },
];

export const PARCEIROS_DESTAQUE = [
  { id: "pd1", nome: "BeneMed", categoria: "Saúde", selo: "Parceiro Pode Já" },
  { id: "pd2", nome: "FarmaVida", categoria: "Farmácia", selo: "Até 85% off" },
  { id: "pd3", nome: "EnergiaCerta", categoria: "Energia", selo: "-20%" },
  { id: "pd4", nome: "StreamON", categoria: "Streaming", selo: "Novo" },
];

// ---------------------------------------------------------------------------------------
// A2 — Serviços/parceiros
// ---------------------------------------------------------------------------------------

export const CHIPS_CATEGORIA = [
  "Todas",
  "Saúde",
  "Farmácia",
  "Energia",
  "Mercado",
  "Streaming",
  "Pets",
  "Beleza",
  "Telefonia",
  "Educação",
  "Lazer",
  "Mobilidade",
  "Seguros",
  "Crédito",
];

export const CATEGORIAS_GRID_A2 = [
  { id: "saude", nome: "Saúde", icone: "Heartbeat" as const },
  { id: "farmacia", nome: "Farmácia", icone: "FirstAidKit" as const },
  { id: "energia", nome: "Energia", icone: "Lightning" as const },
  { id: "mercado", nome: "Mercado", icone: "ShoppingCart" as const },
  { id: "streaming", nome: "Streaming", icone: "MonitorPlay" as const },
  { id: "pets", nome: "Pets", icone: "PawPrint" as const },
  { id: "beleza", nome: "Beleza", icone: "Sparkle" as const },
  { id: "telefonia", nome: "Telefonia", icone: "Phone" as const },
  { id: "educacao", nome: "Educação", icone: "Student" as const },
  { id: "lazer", nome: "Lazer", icone: "Confetti" as const },
  { id: "mobilidade", nome: "Mobilidade", icone: "Car" as const },
  { id: "seguros", nome: "Seguros", icone: "ShieldCheck" as const },
];

export const EM_ALTA = [
  { id: "e1", nome: "FarmaVida", categoria: "Farmácia" },
  { id: "e2", nome: "StreamON", categoria: "Streaming" },
  { id: "e3", nome: "PetAmigo", categoria: "Pets" },
  { id: "e4", nome: "MercaFácil", categoria: "Mercado" },
];

// Linha de crédito sem selo/nota/contagem de uso — guardrail 1: crédito nunca recebe tag
// promocional. Fica em categoria própria, só com o CTA "Simular".
export const PARCEIROS_A2 = [
  { id: "p1", nome: "BeneMed", categoria: "Saúde", selo: "Até 85% off", nota: 4.8, usoHoje: "1,2 mil usaram hoje", cta: "Ver oferta" },
  { id: "p2", nome: "FarmaVida", categoria: "Farmácia", selo: "Até 85% off", nota: 4.6, usoHoje: "980 usaram hoje", cta: "Ver oferta" },
  { id: "p3", nome: "EnergiaCerta", categoria: "Energia", selo: "-20%", nota: 4.5, usoHoje: "740 usaram hoje", cta: "Ver oferta" },
  { id: "p4", nome: "MercaFácil", categoria: "Mercado", selo: "Novo", nota: 4.3, usoHoje: "1,5 mil usaram hoje", cta: "Ver oferta" },
  { id: "p5", nome: "StreamON", categoria: "Streaming", selo: "Exclusivo", nota: 4.7, usoHoje: "2,1 mil usaram hoje", cta: "Ver oferta" },
  { id: "p6", nome: "PetAmigo", categoria: "Pets", selo: "Até 85% off", nota: 4.9, usoHoje: "610 usaram hoje", cta: "Ver oferta" },
  { id: "p7", nome: "BelezaExpress", categoria: "Beleza", selo: "Novo", nota: 4.4, usoHoje: "430 usaram hoje", cta: "Ver oferta" },
  { id: "p8", nome: "ConectaMóvel", categoria: "Telefonia", selo: "-20%", nota: 4.2, usoHoje: "890 usaram hoje", cta: "Ver oferta" },
  { id: "p9", nome: "EduCerta", categoria: "Educação", selo: "Exclusivo", nota: 4.6, usoHoje: "320 usaram hoje", cta: "Ver oferta" },
  { id: "p10", nome: "LazerClub", categoria: "Lazer", selo: "Novo", nota: 4.3, usoHoje: "510 usaram hoje", cta: "Ver oferta" },
  { id: "p11", nome: "MoveFácil", categoria: "Mobilidade", selo: "Até 85% off", nota: 4.5, usoHoje: "670 usaram hoje", cta: "Ver oferta" },
  { id: "p12", nome: "SeguroTotal", categoria: "Seguros", selo: "Novo", nota: 4.4, usoHoje: "290 usaram hoje", cta: "Ver oferta" },
  { id: "p13", nome: "Crédito Pessoal", categoria: "Crédito", selo: null, nota: null, usoHoje: null, cta: "Simular" },
];

// ---------------------------------------------------------------------------------------
// A3 — Pontos e gamificação
// ---------------------------------------------------------------------------------------

export const RANKING_A3 = [
  { posicao: 1, nome: "Camila S.", pontos: 1280, voce: false },
  { posicao: 2, nome: "Marina (você)", pontos: 1140, voce: true },
  { posicao: 3, nome: "Diego A.", pontos: 980, voce: false },
  { posicao: 4, nome: "Paulo H.", pontos: 860, voce: false },
  { posicao: 5, nome: "Renata F.", pontos: 790, voce: false },
];

export const MISSOES_A3 = [
  { id: "m1", titulo: "Abra o app 5 dias seguidos", progresso: 80, meta: "4/5 dias", tempoRestante: "2 dias" },
  { id: "m2", titulo: "Simule um crédito", progresso: 0, meta: "0/1", tempoRestante: "5 dias" },
  { id: "m3", titulo: "Indique um amigo", progresso: 50, meta: "1/2 indicações", tempoRestante: "4 dias" },
  { id: "m4", titulo: "Confira 5 ofertas", progresso: 60, meta: "3/5 ofertas", tempoRestante: "1 dia" },
  { id: "m5", titulo: "Complete seu cadastro", progresso: 100, meta: "Concluída", tempoRestante: "—" },
  { id: "m6", titulo: "Use um cupom", progresso: 0, meta: "0/1", tempoRestante: "6 dias" },
];

export const CONQUISTAS = [
  { id: "c1", nome: "Primeira semana", conquistada: true },
  { id: "c2", nome: "Indicador", conquistada: true },
  { id: "c3", nome: "Explorador", conquistada: false },
  { id: "c4", nome: "Fidelidade 30 dias", conquistada: false },
];

// Nenhum resgate em desconto de juros ou crédito — guardrail 5, inegociável.
export const RESGATES_A3 = [
  { id: "r1", nome: "R$10 de desconto na farmácia", pontos: 500 },
  { id: "r2", nome: "R$20 na conta de energia", pontos: 1200 },
  { id: "r3", nome: "Cashback de R$15 no Pix", pontos: 900 },
  { id: "r4", nome: "1 mês de streaming", pontos: 1100 },
  { id: "r5", nome: "R$10 de recarga de celular", pontos: 600 },
  { id: "r6", nome: "Vale-mercado R$25", pontos: 1000 },
  { id: "r7", nome: "1 mês grátis de assistência", pontos: 1200 },
  { id: "r8", nome: "Vale-combustível R$20", pontos: 950 },
];

export const HISTORICO_A3 = [
  { id: "h1", texto: "Login diário", pontos: 10, data: "Hoje" },
  { id: "h2", texto: "Simulação de FGTS", pontos: 30, data: "Ontem" },
  { id: "h3", texto: "Indicação aprovada", pontos: 150, data: "12/10" },
  { id: "h4", texto: "Check-in de 7 dias", pontos: 50, data: "10/10" },
];
