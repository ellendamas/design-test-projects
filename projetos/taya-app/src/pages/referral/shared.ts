import { useEffect, useState } from "react";
import { PLANOS } from "@/pages/assistencias/shared";
import { permiteOverrideDesignOnly } from "@/config/referral";

// Dados e regras de negócio mockados do programa "Indique e ganhe" (BeneMed) — spec em
// docs/journey-specs/indique-e-ganhe-benemed-journey-spec.md. Só os planos Mensal (individual)
// e Familiar entram no cálculo de comissão (R1): são os dois únicos citados na
// CommissionTable/IG-02 da spec, então filtramos PLANOS (que também tem Semestral/Anual, que
// não pagam indicação) em vez de redefinir preço em outro lugar.
export const PLANO_MENSAL = PLANOS.find((p) => p.id === "mensal")!;
export const PLANO_FAMILIAR = PLANOS.find((p) => p.id === "familiar")!;

// R1 — Comissão: 10% da primeira mensalidade paga, sem recorrência.
export const COMMISSION_PCT = 0.1;

export function comissaoDoPlano(precoMes: number): number {
  return Math.round(precoMes * COMMISSION_PCT * 100) / 100;
}

export const COMISSAO_MENSAL = 3.99; // 10% de R$ 39,90
export const COMISSAO_FAMILIAR = 5.39; // 10% de R$ 53,90

// ---------------------------------------------------------------------------
// Código de indicação (R7 — aleatório, não sequencial, sem dado pessoal)
// ---------------------------------------------------------------------------

const REFERRAL_CODE_KEY = "podeja_referral_code";
// Exclui caracteres ambíguos (0/O, 1/I/l) pra o código ficar legível quando lido em voz alta ou
// digitado manualmente — mesma preocupação de qualquer código curto compartilhado por link.
const CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const CODE_LENGTH = 8;

function gerarCodigoAleatorio(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < CODE_LENGTH; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let codigo = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    codigo += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return codigo;
}

// Um código por pessoa, imutável — gerado uma vez e sempre o mesmo depois disso (idempotente,
// como pede a spec em "primeiro acesso" de IG-02). Sem backend real, "o servidor gera" vira
// "gera na primeira leitura e persiste no localStorage".
export function getOrCreateReferralCode(): string {
  if (typeof window === "undefined") return "";
  const existente = window.localStorage.getItem(REFERRAL_CODE_KEY);
  if (existente) return existente;
  const novo = gerarCodigoAleatorio();
  window.localStorage.setItem(REFERRAL_CODE_KEY, novo);
  return novo;
}

// [A CONFIRMAR o domínio com o Bruno] — domínio como a spec já dava (seção 5, IG-02), mas o
// caminho mudou de /benemed pra /assistencia-saude por pedido de revisão: se o parceiro de
// assistência de saúde mudar no futuro, uma URL com o nome da BeneMed ficaria errada (e já
// compartilhada por quem indicou antes da troca). Rota correspondente em App.tsx.
export function linkDeIndicacao(codigo: string): string {
  return `https://www.podeja.com.br/assistencia-saude?ref=${codigo}`;
}

export function formatoDeCodigoValido(codigo: string | null | undefined): boolean {
  if (!codigo) return false;
  return new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`).test(codigo);
}

// ---------------------------------------------------------------------------
// "Minhas indicações" (IG-02 MyReferralsList) — lista mockada, sem backend real
// ---------------------------------------------------------------------------

export type StatusComissao = "pendente" | "confirmada" | "paga" | "estornada";

export type Indicacao = {
  id: string;
  data: string; // dd/mm/aaaa, já formatado — não existe fuso/i18n nesse protótipo
  planoId: "mensal" | "familiar";
  valorComissao: number;
  status: StatusComissao;
};

export const STATUS_LABEL: Record<StatusComissao, string> = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  paga: "Paga",
  estornada: "Estornada",
};

// Lista semente determinística (não é re-sorteada a cada render) cobrindo os 4 status
// possíveis, pra dar pra revisar a tela com dado representativo sem precisar completar uma
// venda de verdade. ?indicacoes=vazio (DESIGN ONLY) força o empty state no lugar dela.
const INDICACOES_SEED: Indicacao[] = [
  { id: "ref-001", data: "02/10/2026", planoId: "familiar", valorComissao: COMISSAO_FAMILIAR, status: "paga" },
  { id: "ref-002", data: "11/10/2026", planoId: "mensal", valorComissao: COMISSAO_MENSAL, status: "confirmada" },
  { id: "ref-003", data: "18/10/2026", planoId: "mensal", valorComissao: COMISSAO_MENSAL, status: "pendente" },
  { id: "ref-004", data: "25/09/2026", planoId: "mensal", valorComissao: COMISSAO_MENSAL, status: "estornada" },
];

// dd/mm/aaaa -> timestamp, só pra ordenar (mesmo formato já usado em `data`, sem fuso/i18n).
function paraDataOrdenavel(data: string): number {
  const [dia, mes, ano] = data.split("/").map(Number);
  return new Date(ano, mes - 1, dia).getTime();
}

// Mais recente primeiro, como pedido na revisão da IG-02.
export function getMinhasIndicacoes(): Indicacao[] {
  if (typeof window !== "undefined" && permiteOverrideDesignOnly()) {
    const forcarVazio = new URLSearchParams(window.location.search).get("indicacoes");
    if (forcarVazio === "vazio") return [];
  }
  return [...INDICACOES_SEED].sort((a, b) => paraDataOrdenavel(b.data) - paraDataOrdenavel(a.data));
}

export function totaisDeComissao(indicacoes: Indicacao[]) {
  const aReceber = indicacoes
    .filter((i) => i.status === "pendente" || i.status === "confirmada")
    .reduce((soma, i) => soma + i.valorComissao, 0);
  const jaRecebido = indicacoes
    .filter((i) => i.status === "paga")
    .reduce((soma, i) => soma + i.valorComissao, 0);
  return { aReceber, jaRecebido };
}

export function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ---------------------------------------------------------------------------
// R3 — Atribuição (cookie first-party + parâmetro de URL) e R4 — autoindicação
// ---------------------------------------------------------------------------

export const REFERRAL_COOKIE_NAME = "podeja_ref";
// Janela de atribuição proposta na spec (R3) — parâmetro de negócio invisível na UI, não copy,
// então implementado direto como default enquanto não é confirmado pelo Barreto/Bruno.
export const ATTRIBUTION_WINDOW_DAYS = 30;
// Prazo de segurança proposto na spec (R5) pra comissão virar "confirmada" — mesmo raciocínio:
// parâmetro de negócio, não copy visível, pendente de confirmação de Financeiro/Jurídico.
export const COMMISSION_SAFETY_WINDOW_DAYS = 7;

// Grava o código recebido como cookie first-party (R3 — 70% das sessões abrem dentro do
// Instagram/Facebook, onde cookie costuma não acompanhar a pessoa; por isso a spec também pede
// o parâmetro de URL seguir até o cadastro/login, feito em BenemedLandingPage.tsx separadamente
// desta função). Mantém a primeira atribuição vigente (R3 "disputa: primeiro toque vence").
export function gravarAtribuicao(codigo: string): void {
  if (typeof document === "undefined") return;
  const existente = lerAtribuicaoCookie();
  if (existente) return; // primeiro toque vence — não sobrescreve
  const maxAge = ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60;
  document.cookie = `${REFERRAL_COOKIE_NAME}=${codigo}; max-age=${maxAge}; path=/; samesite=lax`;
}

export function lerAtribuicaoCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFERRAL_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// R4 — autoindicação: permitida, só marcada. Aqui "self_referral" é true quando o código da URL
// bate com o código da própria pessoa logada (mock: não há conta separada pra simular um
// indicado de verdade, então essa é a única forma de demonstrar o caminho no protótipo).
export function ehAutoindicacao(codigoRecebido: string | null): boolean {
  if (!codigoRecebido || typeof window === "undefined") return false;
  const meuCodigo = window.localStorage.getItem(REFERRAL_CODE_KEY);
  return !!meuCodigo && meuCodigo === codigoRecebido;
}

// ---------------------------------------------------------------------------
// IG-05 — card de indicação dentro de "Para você agora" no dashboard (HomeScreen em App.tsx).
// Trocamos o banner de largura cheia com botão de fechar (X) por este card, sem fechar manual:
// ele mesmo controla quando volta a aparecer, com uma regra de dias — a cada vez que é
// mostrado, fica quieto pelos próximos N dias antes de aparecer de novo. Reaproveita o default
// de 14 dias que a spec já propunha pra essa janela (antes associado à dispensa manual, agora
// ao próprio impacto/visualização do card).
// ---------------------------------------------------------------------------

const CARD_LAST_SHOWN_KEY = "podeja_referral_dashboard_card_last_shown_at";
const CARD_REPEAT_DAYS = 14; // default proposto na spec, parâmetro de negócio — não copy

// Síncrono de propósito: `temCardParaVoceAgora` em App.tsx precisa dessa decisão no mesmo
// render em que monta a lista de cards, pra já contar (ou não) esse card no "pelo menos 1
// ativo" que decide se o título "Para você agora" aparece.
//
// ?cardIndicacao=mostrar|ocultar (DESIGN ONLY) força o resultado, ignorando a regra dos 14
// dias — sem isso, depois da primeira vez que o card aparece (em qualquer teste, inclusive
// este) ele fica 14 dias "quieto" antes de aparecer de novo, o que torna muito fácil abrir o
// dashboard de novo pra revisar e não ver o card ali (ele já tinha sido mostrado e marcado).
export function deveMostrarCardIndicacaoHoje(): boolean {
  if (typeof window === "undefined") return false;
  if (permiteOverrideDesignOnly()) {
    const forcado = new URLSearchParams(window.location.search).get("cardIndicacao");
    if (forcado === "mostrar") return true;
    if (forcado === "ocultar") return false;
  }
  const salvo = window.localStorage.getItem(CARD_LAST_SHOWN_KEY);
  if (!salvo) return true;
  const diasDesde = (Date.now() - Number(salvo)) / (1000 * 60 * 60 * 24);
  return diasDesde >= CARD_REPEAT_DAYS;
}

// Chamado (via useEffect, uma vez por exibição) assim que o card decide aparecer — é o que
// faz ele ficar quieto pelos próximos CARD_REPEAT_DAYS antes de poder aparecer de novo.
export function marcarCardIndicacaoComoMostrado(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CARD_LAST_SHOWN_KEY, String(Date.now()));
}

// ---------------------------------------------------------------------------
// IG-06 — dispensa "Agora não" do banner pós-contratação (só nesta sessão, não persiste —
// diferente do banner do dashboard, que tem regra de 14 dias; aqui a tela de confirmação só
// aparece uma vez por contratação, então dispensar e sumir já é suficiente)
// ---------------------------------------------------------------------------

// "assistencias" saiu (era a origem do card IG-01, removido de Assistências); "conta" entrou
// no lugar — ponto de acesso fixo em Minha Conta, pra quem viu um banner mas não indicou na
// hora conseguir achar o link depois, sem depender de ver o banner de novo.
export type ReferralOrigin = "conta" | "banner_dashboard" | "banner_pos_contratacao";

// ---------------------------------------------------------------------------
// Estados de visibilidade (R2 — flag) compartilhados por IG-01 e IG-05: default, oculto,
// loading e error, como pede a spec para os dois. Simula uma breve checagem de flag (como se
// viesse de uma config remota) antes de resolver pra default/oculto — o "erro" é forçável via
// ?referralFlag=erro (DESIGN ONLY) pra revisar o estado sem precisar derrubar nada de verdade.
// Nesse estado o card/banner simplesmente não renderiza nada (mesmo resultado visual do
// "oculto" — a diferença é só qual caminho de código levou a isso), exatamente como a spec
// descreve: "se a flag não carregar, o card/banner some e [a tela] segue normal".
// ---------------------------------------------------------------------------

export type VisibilidadeFlag = "default" | "oculto" | "loading" | "error";

const LOADING_SIMULADO_MS = 400;

export function useVisibilidadeFlag(elegivel: boolean): VisibilidadeFlag {
  const [estado, setEstado] = useState<VisibilidadeFlag>("loading");

  useEffect(() => {
    if (typeof window === "undefined") {
      setEstado(elegivel ? "default" : "oculto");
      return;
    }
    const forcarErro = permiteOverrideDesignOnly() && new URLSearchParams(window.location.search).get("referralFlag") === "erro";
    if (forcarErro) {
      setEstado("error");
      return;
    }
    if (!elegivel) {
      setEstado("oculto");
      return;
    }
    const timer = window.setTimeout(() => setEstado("default"), LOADING_SIMULADO_MS);
    return () => window.clearTimeout(timer);
  }, [elegivel]);

  return estado;
}
