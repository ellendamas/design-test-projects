// DESIGN ONLY: dados mockados da Vida financeira (gastos, atividades, fluxo de caixa, cheque
// especial e cartões). Nenhum valor aqui vem de cálculo real sobre os dados do Open Finance,
// é só o suficiente pra demonstrar a navegação, os gráficos e os estados das telas.

export type MesChave = string; // "2026-01".."2026-11"

export const MES_ATUAL: MesChave = "2026-11";

export const MES_LABEL: Record<MesChave, string> = {
  "2026-01": "Jan",
  "2026-02": "Fev",
  "2026-03": "Mar",
  "2026-04": "Abr",
  "2026-05": "Mai",
  "2026-06": "Jun",
  "2026-07": "Jul",
  "2026-08": "Ago",
  "2026-09": "Set",
  "2026-10": "Out",
  "2026-11": "Nov",
};

// Entradas e saídas mês a mês (Fluxo de caixa). totalGastoPorMes (Gastos, Atividades) deriva
// das saídas daqui, pra não ter dois números diferentes pro mesmo mês em telas diferentes.
export const fluxoCaixaPorMes: Record<MesChave, { entradas: number; saidas: number }> = {
  "2026-01": { entradas: 4500, saidas: 2750 },
  "2026-02": { entradas: 4600, saidas: 2860 },
  "2026-03": { entradas: 4650, saidas: 3020 },
  "2026-04": { entradas: 4700, saidas: 2990 },
  "2026-05": { entradas: 4800, saidas: 3110 },
  "2026-06": { entradas: 4800, saidas: 2980 },
  "2026-07": { entradas: 4900, saidas: 3100 },
  "2026-08": { entradas: 5000, saidas: 2870 },
  "2026-09": { entradas: 5100, saidas: 3460 },
  "2026-10": { entradas: 5150, saidas: 3470 },
  "2026-11": { entradas: 5200, saidas: 3240 },
};

export const MESES_ORDENADOS = Object.keys(fluxoCaixaPorMes) as MesChave[];

export const totalGastoPorMes: Record<MesChave, number> = Object.fromEntries(
  MESES_ORDENADOS.map((mes) => [mes, fluxoCaixaPorMes[mes].saidas]),
) as Record<MesChave, number>;

function mesAnterior(mes: MesChave): MesChave | null {
  const idx = MESES_ORDENADOS.indexOf(mes);
  return idx > 0 ? MESES_ORDENADOS[idx - 1] : null;
}

// --- Gastos por categoria (Gastos do mês) ---

export type Periodo = "semana" | "1mes" | "6meses" | "1ano";

export const PERIODO_LABEL: Record<Periodo, string> = {
  semana: "Semana",
  "1mes": "1 mês",
  "6meses": "6 meses",
  "1ano": "1 ano",
};

export type CategoriaGasto = { id: string; nome: string; icone: string; valor: number; pct: number };
export type GastoPorBanco = { bancoId: string; totalGasto: number; categorias: CategoriaGasto[] };
export type GastoPrincipal = { id: string; descricao: string; bancoId: string; valor: number; data: string };

type DadosPeriodo = { totalGasto: number; porBanco: GastoPorBanco[]; principais: GastoPrincipal[] };

// Base de 1 mês, batendo com totalGastoPorMes["2026-11"] (R$ 3.240).
const BASE_1_MES: DadosPeriodo = {
  totalGasto: 3240,
  porBanco: [
    {
      bancoId: "nubank",
      totalGasto: 1200,
      categorias: [
        { id: "alimentacao", nome: "Alimentação", icone: "ForkKnife", valor: 480, pct: 40 },
        { id: "transporte", nome: "Transporte", icone: "Car", valor: 310, pct: 26 },
        { id: "assinaturas", nome: "Assinaturas", icone: "DeviceMobile", valor: 180, pct: 15 },
        { id: "outros", nome: "Outros", icone: "Tag", valor: 230, pct: 19 },
      ],
    },
    {
      bancoId: "itau",
      totalGasto: 2040,
      categorias: [
        { id: "moradia", nome: "Moradia", icone: "HouseLine", valor: 750, pct: 37 },
        { id: "compras", nome: "Compras", icone: "Bag", valor: 410, pct: 20 },
        { id: "alimentacao", nome: "Alimentação", icone: "ForkKnife", valor: 410, pct: 20 },
        { id: "farmacia", nome: "Farmácia", icone: "Pill", valor: 120, pct: 6 },
        { id: "outros", nome: "Outros", icone: "Tag", valor: 350, pct: 17 },
      ],
    },
  ],
  principais: [
    { id: "g1", descricao: "Aluguel", bancoId: "itau", valor: 750, data: "2026-11-05" },
    { id: "g2", descricao: "Supermercado Extra", bancoId: "nubank", valor: 320, data: "2026-11-10" },
    { id: "g3", descricao: "Posto Ipiranga", bancoId: "nubank", valor: 240, data: "2026-11-08" },
    { id: "g4", descricao: "Loja de roupas", bancoId: "itau", valor: 210, data: "2026-11-12" },
    { id: "g5", descricao: "Netflix + Spotify + Prime", bancoId: "nubank", valor: 87, data: "2026-11-01" },
    { id: "g6", descricao: "Farmácia", bancoId: "itau", valor: 95, data: "2026-11-07" },
  ],
};

const MULTIPLICADOR_PERIODO: Record<Periodo, number> = {
  semana: 0.25,
  "1mes": 1,
  "6meses": 5.8,
  "1ano": 11.3,
};

function escalar(valor: number, mult: number) {
  return Math.round(valor * mult);
}

export function getGastosPorPeriodo(periodo: Periodo): DadosPeriodo {
  const mult = MULTIPLICADOR_PERIODO[periodo];
  return {
    totalGasto: escalar(BASE_1_MES.totalGasto, mult),
    porBanco: BASE_1_MES.porBanco.map((banco) => ({
      ...banco,
      totalGasto: escalar(banco.totalGasto, mult),
      categorias: banco.categorias.map((cat) => ({ ...cat, valor: escalar(cat.valor, mult) })),
    })),
    // Período maior que 1 mês: não faz sentido repetir cada gasto avulso proporcionalmente
    // (ex.: a assinatura mensal não vira 6 linhas em "6 meses"), então pra semana cortamos a
    // lista e pra períodos mais longos agregamos o valor de cada item com um fator mais ameno.
    principais: (periodo === "semana" ? BASE_1_MES.principais.slice(0, 3) : BASE_1_MES.principais).map((g) => ({
      ...g,
      valor: periodo === "semana" || periodo === "1mes" ? g.valor : escalar(g.valor, mult / 3),
    })),
  };
}

// Nome do ícone (string) de cada categoria, pra quem só tem o categoriaId (ex.: Transacao) e
// precisa do mesmo ícone usado em CategoriaGasto, sem duplicar o mapeamento.
export const CATEGORIA_ICONE: Record<string, string> = Object.fromEntries(
  BASE_1_MES.porBanco.flatMap((banco) => banco.categorias.map((cat) => [cat.id, cat.icone])),
);

export function agruparPorCategoria(porBanco: GastoPorBanco[]): CategoriaGasto[] {
  const mapa = new Map<string, CategoriaGasto>();
  porBanco.forEach((banco) => {
    banco.categorias.forEach((cat) => {
      const atual = mapa.get(cat.id);
      if (atual) {
        atual.valor += cat.valor;
      } else {
        mapa.set(cat.id, { ...cat });
      }
    });
  });
  const lista = Array.from(mapa.values());
  const total = lista.reduce((sum, c) => sum + c.valor, 0);
  return lista.map((c) => ({ ...c, pct: total > 0 ? Math.round((c.valor / total) * 100) : 0 })).sort((a, b) => b.valor - a.valor);
}

// Sub-categorias de cada categoria, como fração do valor da categoria. Não é um dado
// independente, por isso funciona pra qualquer período/banco sem precisar duplicar números.
const SUBCATEGORIA_SPLIT: Record<string, { nome: string; pct: number }[]> = {
  alimentacao: [
    { nome: "Supermercado", pct: 0.55 },
    { nome: "Restaurantes", pct: 0.3 },
    { nome: "Delivery", pct: 0.15 },
  ],
  transporte: [
    { nome: "Combustível", pct: 0.5 },
    { nome: "Aplicativos (Uber, 99)", pct: 0.35 },
    { nome: "Transporte público", pct: 0.15 },
  ],
  assinaturas: [
    { nome: "Streaming", pct: 0.6 },
    { nome: "Apps e serviços", pct: 0.4 },
  ],
  moradia: [
    { nome: "Aluguel", pct: 0.7 },
    { nome: "Água, luz e internet", pct: 0.3 },
  ],
  compras: [
    { nome: "Vestuário", pct: 0.5 },
    { nome: "Eletrônicos", pct: 0.3 },
    { nome: "Casa e decoração", pct: 0.2 },
  ],
  outros: [
    { nome: "Compras diversas", pct: 0.6 },
    { nome: "Taxas e tarifas", pct: 0.4 },
  ],
};

export function getSubcategorias(categoria: CategoriaGasto): { nome: string; valor: number }[] {
  const split = SUBCATEGORIA_SPLIT[categoria.id] ?? [{ nome: categoria.nome, pct: 1 }];
  return split.map((s) => ({ nome: s.nome, valor: Math.round(categoria.valor * s.pct) }));
}

// --- Séries pros gráficos de Gastos, por período ---

export type PontoSerie = { label: string; atual: number; anterior?: number };

// Distribuição fixa de peso por dia da semana (soma 1), só pra desenhar a barra semanal.
// Fim de semana pesa mais, como é comum em gasto de cartão/pix.
const PESOS_SEMANA = [0.1, 0.08, 0.12, 0.1, 0.22, 0.25, 0.13];
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function serieSemanal(totalSemana: number): PontoSerie[] {
  return DIAS_SEMANA.map((label, i) => ({ label, atual: Math.round(totalSemana * PESOS_SEMANA[i]) }));
}

function serieDiariaAcumulada(totalMes: number, totalMesAnterior: number, dias = 30): PontoSerie[] {
  const curva = (total: number) => {
    const pesos = Array.from({ length: dias }, (_, i) => {
      const diaSemana = i % 7;
      const fimDeSemana = diaSemana === 5 || diaSemana === 6 ? 1.5 : 1;
      return (1 + 0.25 * Math.sin(i / 3)) * fimDeSemana;
    });
    const soma = pesos.reduce((s, p) => s + p, 0);
    let acumulado = 0;
    return pesos.map((p) => (acumulado += Math.round((p / soma) * total)));
  };
  const atual = curva(totalMes);
  const anterior = curva(totalMesAnterior);
  return Array.from({ length: dias }, (_, i) => ({ label: String(i + 1), atual: atual[i], anterior: anterior[i] }));
}

function serieMensal(meses: MesChave[]): PontoSerie[] {
  // DESIGN ONLY: "mesmo período, mas anterior" ainda não tem um ano inteiro de histórico
  // mockado. Aproxima com os mesmos meses 8% menores, só pra ilustrar a linha tracejada.
  return meses.map((mes) => ({ label: MES_LABEL[mes] ?? mes, atual: totalGastoPorMes[mes] ?? 0, anterior: Math.round((totalGastoPorMes[mes] ?? 0) * 0.92) }));
}

export type RitmoGastos = {
  serie: PontoSerie[];
  totalAtual: number;
  totalAnterior: number;
  delta: number; // atual - anterior; positivo = gastando mais que no mês passado
  pct: number;
};

// Mesma curva diária acumulada do gráfico de Gastos (período "1 mês"), só que como o elemento
// principal da home, pedido do Barreto (GPM) na sync de 13/11/2026: "ritmo de gasto" é o que
// ele checa toda semana. Não é um dado novo, é o "Gastos do mês" em formato mais acionável.
export function getRitmoGastos(): RitmoGastos {
  const serie = getSerieGastos("1mes", totalGastoPorMes[MES_ATUAL]);
  const ultimo = serie[serie.length - 1];
  const totalAtual = ultimo.atual;
  const totalAnterior = ultimo.anterior ?? 0;
  const delta = totalAtual - totalAnterior;
  const pct = totalAnterior > 0 ? Math.round((delta / totalAnterior) * 100) : 0;
  return { serie, totalAtual, totalAnterior, delta, pct };
}

export function getSerieGastos(periodo: Periodo, totalPeriodoAtual: number): PontoSerie[] {
  if (periodo === "semana") return serieSemanal(totalPeriodoAtual);
  if (periodo === "1mes") {
    const anterior = mesAnterior(MES_ATUAL);
    return serieDiariaAcumulada(totalGastoPorMes[MES_ATUAL], anterior ? totalGastoPorMes[anterior] : totalGastoPorMes[MES_ATUAL] * 0.9);
  }
  if (periodo === "6meses") return serieMensal(MESES_ORDENADOS.slice(-6));
  return serieMensal(MESES_ORDENADOS); // 1ano: todos os meses mockados, até o atual
}

// --- Atividades (transações) ---

export type TipoTransacao = "pix" | "cartao" | "boleto" | "debito_automatico";

export const TIPO_LABEL: Record<TipoTransacao, string> = {
  pix: "Pix",
  cartao: "Cartão",
  boleto: "Boleto",
  debito_automatico: "Débito automático",
};

export type Transacao = {
  id: string;
  data: string; // YYYY-MM-DD
  descricao: string;
  tipo: TipoTransacao;
  valor: number;
  categoriaId: string;
  bancoId: string;
};

type MerchantTemplate = { descricao: string; categoriaId: string; tipo: TipoTransacao; bancoId: string; valorBase: number };

const MERCHANT_POOL: MerchantTemplate[] = [
  { descricao: "Aluguel", categoriaId: "moradia", tipo: "debito_automatico", bancoId: "itau", valorBase: 750 },
  { descricao: "Conta de luz", categoriaId: "moradia", tipo: "boleto", bancoId: "itau", valorBase: 140 },
  { descricao: "Internet", categoriaId: "moradia", tipo: "debito_automatico", bancoId: "itau", valorBase: 100 },
  { descricao: "Supermercado Extra", categoriaId: "alimentacao", tipo: "cartao", bancoId: "nubank", valorBase: 320 },
  { descricao: "iFood", categoriaId: "alimentacao", tipo: "pix", bancoId: "nubank", valorBase: 55 },
  { descricao: "Restaurante Sabor Caseiro", categoriaId: "alimentacao", tipo: "cartao", bancoId: "itau", valorBase: 95 },
  { descricao: "Posto Ipiranga", categoriaId: "transporte", tipo: "cartao", bancoId: "nubank", valorBase: 180 },
  { descricao: "Uber", categoriaId: "transporte", tipo: "cartao", bancoId: "nubank", valorBase: 28 },
  { descricao: "Netflix", categoriaId: "assinaturas", tipo: "cartao", bancoId: "nubank", valorBase: 45 },
  { descricao: "Spotify", categoriaId: "assinaturas", tipo: "cartao", bancoId: "nubank", valorBase: 22 },
  { descricao: "Loja Renner", categoriaId: "compras", tipo: "cartao", bancoId: "itau", valorBase: 180 },
  { descricao: "Farmácia São Paulo", categoriaId: "farmacia", tipo: "pix", bancoId: "itau", valorBase: 60 },
  { descricao: "Tarifa de manutenção", categoriaId: "outros", tipo: "debito_automatico", bancoId: "itau", valorBase: 29 },
  { descricao: "Academia", categoriaId: "outros", tipo: "cartao", bancoId: "nubank", valorBase: 99 },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function getTransacoesDoMes(mes: MesChave): Transacao[] {
  const fator = (totalGastoPorMes[mes] ?? totalGastoPorMes[MES_ATUAL]) / totalGastoPorMes[MES_ATUAL];
  const [ano, mesNum] = mes.split("-").map(Number);
  const diasNoMes = new Date(ano, mesNum, 0).getDate();
  return MERCHANT_POOL.map((m, idx) => {
    const dia = (hashStr(mes + m.descricao) % diasNoMes) + 1;
    const diaStr = String(dia).padStart(2, "0");
    return {
      id: `${mes}-${idx}`,
      data: `${mes}-${diaStr}`,
      descricao: m.descricao,
      tipo: m.tipo,
      valor: Math.round(m.valorBase * fator),
      categoriaId: m.categoriaId,
      bancoId: m.bancoId,
    };
  }).sort((a, b) => b.data.localeCompare(a.data));
}

// --- Cheque especial (antes "Limite usado", agora "Limite da conta") ---

export type LimiteConta = { bancoId: string; limiteTotal: number; historico: Record<MesChave, number> };

// Catálogo por banco, mesmo padrão do CARTAO_CATALOGO: cobre os mesmos bancos que dá pra
// conectar pelo fluxo de Open Finance, pra conectar/desconectar qualquer um deles refletir
// aqui sem precisar editar nada. Antes só nubank/itau tinham entrada. Conectar outro banco
// (ex.: Bradesco, BB) pra testar com vários bancos mostrava tudo zerado (bug sinalizado pela
// Ellen em 16/11/2026).
const LIMITE_CONTA_CATALOGO: Record<string, { limiteTotal: number; usadoAtual: number }> = {
  nubank: { limiteTotal: 1000, usadoAtual: 150 },
  itau: { limiteTotal: 2000, usadoAtual: 780 },
  bradesco: { limiteTotal: 1500, usadoAtual: 300 },
  bb: { limiteTotal: 1800, usadoAtual: 450 },
  caixa: { limiteTotal: 1200, usadoAtual: 200 },
  santander: { limiteTotal: 1600, usadoAtual: 100 },
  inter: { limiteTotal: 2200, usadoAtual: 50 },
  c6: { limiteTotal: 2500, usadoAtual: 600 },
  picpay: { limiteTotal: 500, usadoAtual: 0 },
  "mercado-pago": { limiteTotal: 600, usadoAtual: 0 },
  btg: { limiteTotal: 3000, usadoAtual: 0 },
  sicredi: { limiteTotal: 900, usadoAtual: 120 },
  sicoob: { limiteTotal: 800, usadoAtual: 90 },
  neon: { limiteTotal: 400, usadoAtual: 0 },
};

export function getLimitePorBanco(bancosConectados: { id: string }[]): LimiteConta[] {
  return bancosConectados
    .filter((banco) => LIMITE_CONTA_CATALOGO[banco.id])
    .map((banco) => {
      const { limiteTotal, usadoAtual } = LIMITE_CONTA_CATALOGO[banco.id];
      return { bancoId: banco.id, limiteTotal, historico: gerarHistoricoCartao(usadoAtual) };
    });
}

// --- Cartões de crédito ---

export type Parcelamento = {
  id: string;
  descricao: string;
  valorParcela: number;
  totalParcelas: number;
  mesInicio: MesChave; // mês da 1ª parcela
};

export type CartaoConectado = {
  id: string;
  bancoId: string;
  nome: string;
  bandeira: string;
  final: string;
  limiteTotal: number;
  limiteUsado: number;
  faturaAtual: number;
  rotativo: { emRotativo: number; pagoEsteMes: number; mesesEmRotativo: number } | null;
  historicoMensal: Record<MesChave, number>;
  parcelamentos: Parcelamento[];
};

type CartaoCatalogoEntry = Omit<CartaoConectado, "id" | "bancoId" | "historicoMensal">;

// Variação mês a mês aplicada sobre a fatura atual de cada cartão, só pra gerar um histórico
// plausível sem precisar digitar 6 números por cartão.
const RATIOS_HISTORICO: Record<MesChave, number> = {
  "2026-06": 0.9,
  "2026-07": 0.95,
  "2026-08": 0.85,
  "2026-09": 1.1,
  "2026-10": 0.97,
  "2026-11": 1,
};

function gerarHistoricoCartao(faturaAtual: number): Record<MesChave, number> {
  return Object.fromEntries(MESES_ORDENADOS.slice(-6).map((m) => [m, Math.round(faturaAtual * RATIOS_HISTORICO[m])])) as Record<MesChave, number>;
}

// Catálogo de cartão mockado por banco, pra qualquer um dos bancos que dá pra conectar pelo
// fluxo de Open Finance (mesmos brandIds de celcoinBrandsData.ts). Assim, ao testar
// conectar/desconectar um banco em Minha Conta > Open Finance, o cartão correspondente
// aparece ou some sozinho em Vida financeira, sem precisar editar nada aqui pra isso.
const CARTAO_CATALOGO: Record<string, CartaoCatalogoEntry> = {
  nubank: {
    nome: "Nubank Ultravioleta",
    bandeira: "Mastercard",
    final: "4821",
    limiteTotal: 5000,
    limiteUsado: 2100,
    faturaAtual: 1450,
    rotativo: null,
    parcelamentos: [
      { id: "p1", descricao: "Notebook Dell", valorParcela: 245, totalParcelas: 12, mesInicio: "2026-10" },
      { id: "p2", descricao: "Passagem aérea", valorParcela: 180, totalParcelas: 6, mesInicio: "2026-08" },
    ],
  },
  itau: {
    nome: "Itaú Click",
    bandeira: "Visa",
    final: "9034",
    limiteTotal: 3000,
    limiteUsado: 2780,
    faturaAtual: 980,
    rotativo: { emRotativo: 420, pagoEsteMes: 180, mesesEmRotativo: 3 },
    parcelamentos: [{ id: "p3", descricao: "Geladeira", valorParcela: 310, totalParcelas: 10, mesInicio: "2026-05" }],
  },
  bradesco: { nome: "Bradesco Neo", bandeira: "Mastercard", final: "1123", limiteTotal: 4000, limiteUsado: 1200, faturaAtual: 650, rotativo: null, parcelamentos: [] },
  bb: { nome: "Ourocard Internacional", bandeira: "Visa", final: "5567", limiteTotal: 3500, limiteUsado: 900, faturaAtual: 420, rotativo: null, parcelamentos: [] },
  caixa: { nome: "Caixa Elo", bandeira: "Elo", final: "7788", limiteTotal: 2000, limiteUsado: 1850, faturaAtual: 310, rotativo: { emRotativo: 150, pagoEsteMes: 50, mesesEmRotativo: 1 }, parcelamentos: [] },
  santander: { nome: "Santander Free", bandeira: "Mastercard", final: "3341", limiteTotal: 2500, limiteUsado: 600, faturaAtual: 280, rotativo: null, parcelamentos: [] },
  inter: { nome: "Inter Gold", bandeira: "Mastercard", final: "2290", limiteTotal: 4500, limiteUsado: 1000, faturaAtual: 390, rotativo: null, parcelamentos: [] },
  c6: { nome: "C6 Carbon", bandeira: "Mastercard", final: "6650", limiteTotal: 6000, limiteUsado: 3200, faturaAtual: 1700, rotativo: null, parcelamentos: [] },
  picpay: { nome: "PicPay Card", bandeira: "Visa", final: "4412", limiteTotal: 1500, limiteUsado: 400, faturaAtual: 150, rotativo: null, parcelamentos: [] },
  "mercado-pago": { nome: "Cartão Mercado Pago", bandeira: "Mastercard", final: "8890", limiteTotal: 1800, limiteUsado: 500, faturaAtual: 190, rotativo: null, parcelamentos: [] },
  btg: { nome: "BTG+", bandeira: "Visa", final: "1199", limiteTotal: 8000, limiteUsado: 1200, faturaAtual: 600, rotativo: null, parcelamentos: [] },
  sicredi: { nome: "Sicredi Mastercard", bandeira: "Mastercard", final: "3302", limiteTotal: 2200, limiteUsado: 700, faturaAtual: 220, rotativo: null, parcelamentos: [] },
  sicoob: { nome: "Sicoobcard", bandeira: "Visa", final: "9981", limiteTotal: 2000, limiteUsado: 450, faturaAtual: 170, rotativo: null, parcelamentos: [] },
  neon: { nome: "Neon Mastercard", bandeira: "Mastercard", final: "6623", limiteTotal: 1200, limiteUsado: 300, faturaAtual: 110, rotativo: null, parcelamentos: [] },
};

// Deriva os cartões a partir dos bancos de verdade conectados (OpenFinanceContext), não de
// uma lista fixa. Conectar/desconectar um banco em Minha Conta > Open Finance muda o que
// aparece aqui. Banco conectado sem produto de cartão no catálogo simplesmente não gera cartão.
export function getCartoesConectados(bancosConectados: { id: string }[]): CartaoConectado[] {
  return bancosConectados
    .filter((banco) => CARTAO_CATALOGO[banco.id])
    .map((banco) => {
      const catalogo = CARTAO_CATALOGO[banco.id];
      return { ...catalogo, id: `cartao-${banco.id}`, bancoId: banco.id, historicoMensal: gerarHistoricoCartao(catalogo.faturaAtual) };
    });
}

// Mês + n, independente do intervalo mockado em MESES_ORDENADOS. Usado pra calcular a data
// da última parcela mesmo quando ela cai fora dos 11 meses que temos em MES_LABEL.
export function addMeses(mes: MesChave, n: number): string {
  const [ano, mesNum] = mes.split("-").map(Number);
  const date = new Date(ano, mesNum - 1 + n, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

function diffMeses(mesReferencia: MesChave, mesInicio: MesChave): number {
  return (
    (Number(mesReferencia.slice(0, 4)) - Number(mesInicio.slice(0, 4))) * 12 +
    (Number(mesReferencia.slice(5, 7)) - Number(mesInicio.slice(5, 7)))
  );
}

// Número da parcela vigente num mês de referência (1-indexado), sempre dentro de
// [1, totalParcelas]. Útil pra mostrar "parcela X de Y" mesmo fora do intervalo do parcelamento.
export function getParcelaAtual(p: Parcelamento, mesReferencia: MesChave = MES_ATUAL): number {
  return Math.min(Math.max(diffMeses(mesReferencia, p.mesInicio) + 1, 1), p.totalParcelas);
}

// Diferente de getParcelaAtual: aqui o parcelamento só "existe" nesse mês se a parcela sem
// clamping cair dentro de [1, totalParcelas]. Depois de quitado, não aparece mais no filtro.
export function parcelamentoAtivoNoMes(p: Parcelamento, mes: MesChave): boolean {
  const parcela = diffMeses(mes, p.mesInicio) + 1;
  return parcela >= 1 && parcela <= p.totalParcelas;
}

// Reaproveita o pool de lojas (MERCHANT_POOL) filtrado pro banco do cartão, escalando os
// valores pro total daquele cartão naquele mês. Não é uma lista de compras real do cartão,
// só o suficiente pra ilustrar a fatura.
export function getTransacoesCartao(cartao: CartaoConectado, mes: MesChave): Transacao[] {
  const pool = MERCHANT_POOL.filter((m) => m.tipo === "cartao" && m.bancoId === cartao.bancoId);
  if (pool.length === 0) return [];
  const somaBase = pool.reduce((sum, m) => sum + m.valorBase, 0);
  const totalMes = cartao.historicoMensal[mes] ?? 0;
  const fator = somaBase > 0 ? totalMes / somaBase : 0;
  const [ano, mesNum] = mes.split("-").map(Number);
  const diasNoMes = new Date(ano, mesNum, 0).getDate();
  return pool
    .map((m, idx) => {
      const dia = (hashStr(mes + cartao.id + m.descricao) % diasNoMes) + 1;
      return {
        id: `${cartao.id}-${mes}-${idx}`,
        data: `${mes}-${String(dia).padStart(2, "0")}`,
        descricao: m.descricao,
        tipo: m.tipo,
        valor: Math.round(m.valorBase * fator),
        categoriaId: m.categoriaId,
        bancoId: m.bancoId,
      };
    })
    .sort((a, b) => b.data.localeCompare(a.data));
}

// --- Assinaturas ---

export type FormaPagamento = "debito" | "cartao";

export type Assinatura = {
  id: string;
  nome: string;
  valor: number;
  bancoId: string;
  formaPagamento: FormaPagamento;
  cartaoId?: string;
  ativaDesde: MesChave;
};

export const assinaturasMock: Assinatura[] = [
  { id: "as1", nome: "Netflix", valor: 44.9, bancoId: "nubank", formaPagamento: "cartao", cartaoId: "cartao-nubank", ativaDesde: "2026-03" },
  { id: "as2", nome: "Spotify", valor: 21.9, bancoId: "nubank", formaPagamento: "cartao", cartaoId: "cartao-nubank", ativaDesde: "2026-01" },
  { id: "as3", nome: "Amazon Prime", valor: 14.9, bancoId: "itau", formaPagamento: "debito", ativaDesde: "2026-01" },
  { id: "as4", nome: "iCloud+", valor: 11.9, bancoId: "itau", formaPagamento: "cartao", cartaoId: "cartao-itau", ativaDesde: "2026-06" },
  { id: "as5", nome: "Academia (app)", valor: 39.9, bancoId: "nubank", formaPagamento: "debito", ativaDesde: "2026-09" },
];

export function getAssinaturasDoMes(mes: MesChave): Assinatura[] {
  return assinaturasMock.filter((a) => a.ativaDesde <= mes);
}

export function getTotalAssinaturasPorMes(mes: MesChave): number {
  return getAssinaturasDoMes(mes).reduce((sum, a) => sum + a.valor, 0);
}

export function getSerieAssinaturas(): { mes: MesChave; label: string; valor: number }[] {
  return MESES_ORDENADOS.slice(-6).map((m) => ({ mes: m, label: MES_LABEL[m] ?? m, valor: getTotalAssinaturasPorMes(m) }));
}

export function getGastoAcumuladoAssinatura(a: Assinatura, ateMes: MesChave = MES_ATUAL): number {
  return a.valor * Math.max(diffMeses(ateMes, a.ativaDesde) + 1, 0);
}

// Assinaturas pagas por um cartão em rotativo, ou por débito de um banco com cheque especial
// em uso no mês atual. Não é um julgamento ("você devia cancelar"), só a ligação entre os
// dois dados que já existem.
export function getAssinaturasEmRisco(bancosConectados: { id: string }[]): Assinatura[] {
  const cartoes = getCartoesConectados(bancosConectados);
  const limites = getLimitePorBanco(bancosConectados);
  return assinaturasMock.filter((a) => {
    if (a.formaPagamento === "cartao") {
      return !!cartoes.find((c) => c.id === a.cartaoId)?.rotativo;
    }
    const banco = limites.find((b) => b.bancoId === a.bancoId);
    return !!banco && (banco.historico[MES_ATUAL] ?? 0) > 0;
  });
}

// --- Destaques (antigos "insights"): recortes de dados já existentes, sem frase de opinião.
// Cada um só aponta pra um fato (maior/menor/mais usado) e linka pra tela onde ele já aparece. ---

export type GrupoDestaque = "gastos" | "cartoes" | "contas";

export const GRUPO_DESTAQUE_LABEL: Record<GrupoDestaque, string> = {
  gastos: "Gastos",
  cartoes: "Cartões",
  contas: "Contas",
};

export type Destaque = {
  id: string;
  grupo: GrupoDestaque;
  icone: string;
  titulo: string;
  subtitulo: string;
  valor: number;
  tipoValor: "currency" | "percent";
  destino: string;
};

export function getDestaques(bancosConectados: { id: string; nome: string; saldo: number }[]): Destaque[] {
  if (bancosConectados.length === 0) return [];
  const destaques: Destaque[] = [];

  const gastosMes = getGastosPorPeriodo("1mes");
  const categorias = agruparPorCategoria(gastosMes.porBanco);
  if (categorias[0]) {
    destaques.push({
      id: "maior-categoria",
      grupo: "gastos",
      icone: categorias[0].icone,
      titulo: "Maior categoria de gasto",
      subtitulo: categorias[0].nome,
      valor: categorias[0].valor,
      tipoValor: "currency",
      destino: "/vida-financeira/gastos",
    });
  }

  // Destaque informativo (fato, sem CTA pro Saúde por Assinatura: isso agora é o banner
  // separado VidaFinanceiraSaudeBanner, pedido pela Ellen em 16/11/2026). Esse card só aponta
  // o gasto com farmácia no mês e leva pro detalhe em Gastos, como os outros destaques.
  const gastoFarmacia = categorias.find((c) => c.id === "farmacia");
  if (gastoFarmacia && gastoFarmacia.valor > 0) {
    destaques.push({
      id: "gasto-farmacia",
      grupo: "gastos",
      icone: "Pill",
      titulo: "Gasto com farmácia",
      subtitulo: gastoFarmacia.nome,
      valor: gastoFarmacia.valor,
      tipoValor: "currency",
      destino: "/vida-financeira/gastos",
    });
  }

  const maiorGasto = [...gastosMes.principais].sort((a, b) => b.valor - a.valor)[0];
  if (maiorGasto) {
    destaques.push({
      id: "maior-gasto",
      grupo: "gastos",
      icone: "Receipt",
      titulo: "Maior gasto",
      subtitulo: maiorGasto.descricao,
      valor: maiorGasto.valor,
      tipoValor: "currency",
      destino: "/vida-financeira/transacoes",
    });
  }

  const bancoMenorSaldo = [...bancosConectados].sort((a, b) => a.saldo - b.saldo)[0];
  destaques.push({
    id: "menor-saldo",
    grupo: "contas",
    icone: "Bank",
    titulo: "Banco com menor saldo",
    subtitulo: bancoMenorSaldo.nome,
    valor: bancoMenorSaldo.saldo,
    tipoValor: "currency",
    destino: "/vida-financeira",
  });

  const cartoes = getCartoesConectados(bancosConectados);
  const cartaoMaisPertoLimite = [...cartoes].sort((a, b) => b.limiteUsado / b.limiteTotal - a.limiteUsado / a.limiteTotal)[0];
  if (cartaoMaisPertoLimite) {
    destaques.push({
      id: "cartao-limite",
      grupo: "cartoes",
      icone: "CreditCard",
      titulo: "Cartão mais perto do limite",
      subtitulo: cartaoMaisPertoLimite.nome,
      valor: Math.round((cartaoMaisPertoLimite.limiteUsado / cartaoMaisPertoLimite.limiteTotal) * 100),
      tipoValor: "percent",
      destino: "/vida-financeira/cartoes/limites",
    });
  }

  cartoes
    .filter((c) => c.rotativo)
    .forEach((c) => {
      destaques.push({
        id: `rotativo-${c.id}`,
        grupo: "cartoes",
        icone: "ArrowsClockwise",
        titulo: "Rotativo em aberto",
        subtitulo: c.nome,
        valor: c.rotativo!.emRotativo,
        tipoValor: "currency",
        destino: "/vida-financeira/cartoes/faturas",
      });
    });

  const bancoChequeEspecial = getLimitePorBanco(bancosConectados)
    .filter((b) => (b.historico[MES_ATUAL] ?? 0) > 0)
    .sort((a, b) => (b.historico[MES_ATUAL] ?? 0) / b.limiteTotal - (a.historico[MES_ATUAL] ?? 0) / a.limiteTotal)[0];
  if (bancoChequeEspecial) {
    destaques.push({
      id: "cheque-especial",
      grupo: "contas",
      icone: "Gauge",
      titulo: "Cheque especial mais usado",
      subtitulo: bancosConectados.find((b) => b.id === bancoChequeEspecial.bancoId)?.nome ?? bancoChequeEspecial.bancoId,
      valor: Math.round(((bancoChequeEspecial.historico[MES_ATUAL] ?? 0) / bancoChequeEspecial.limiteTotal) * 100),
      tipoValor: "percent",
      destino: "/vida-financeira/limites",
    });
  }

  const { entradas, saidas } = fluxoCaixaPorMes[MES_ATUAL];
  destaques.push({
    id: "fluxo-caixa",
    grupo: "contas",
    icone: "TrendUp",
    titulo: "Fluxo de caixa",
    subtitulo: entradas - saidas >= 0 ? "Positivo" : "Negativo",
    valor: entradas - saidas,
    tipoValor: "currency",
    destino: "/vida-financeira/fluxo-de-caixa",
  });

  return destaques;
}
