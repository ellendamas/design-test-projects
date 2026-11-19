import { PLANOS, type Plano, type PlanoId } from "@/pages/assistencias/shared";

// protótipo; em produção, ler `temAssinaturaBenemedAtiva()`. Diferente dela, esta checagem
// ignora o que está persistido no localStorage e olha só o parâmetro `?assinaturaPlano=` da URL
// atual — assim a página do produto e a tela de planos sempre voltam pro estado padrão "sem
// plano" a cada visita, mesmo que a pessoa já tenha forçado o estado ativo antes nesta sessão
// (pedido explícito: o padrão tem que ser sem plano, mesmo com assinatura mockada ativa).
export const ASSINATURA_ATIVA_SO_POR_PARAMETRO = true;

export function planoAtivoViaParametro(): Plano | null {
  if (typeof window === "undefined") return null;
  const forcado = new URLSearchParams(window.location.search).get("assinaturaPlano");
  if (!forcado) return null;
  return PLANOS.find((p) => p.id === forcado) ?? null;
}

// Prompt 1e (22/10) — estados de assinatura, também protótipo: em produção, ler o estado real
// (ex: de uma API de billing), não um parâmetro de URL. Independente de `?assinaturaPlano=` de
// propósito: em Minha assinatura e em Meus contratos sempre existe algum plano pra mostrar (real
// ou PLANOS[0] como fallback), então o teste de estado funciona ali mesmo sem forçar o plano
// via parâmetro — só a página da Saúde e a tela de Planos, que já tratam "sem plano" como padrão,
// precisam dos dois parâmetros juntos pra mostrar qualquer coisa de assinante.
//
// Prompt 1h (23/10) — o time de desenvolvimento confirmou que "ativacao", "cancelamento" e
// "atraso" não chegam de verdade do parceiro: o tipo continua com os 7 valores (não apaga
// código), mas só os 4 em ESTADOS_EXIBIDOS aparecem na tela. "encerrado" é novo, só pros planos
// Semestral e Anual (ver estadoAssinaturaEfetivo abaixo).
export type EstadoAssinatura = "ativo" | "ativacao" | "pendente" | "atraso" | "cancelamento" | "cancelado" | "encerrado";

const ESTADOS_VALIDOS: readonly EstadoAssinatura[] = ["ativo", "ativacao", "pendente", "atraso", "cancelamento", "cancelado", "encerrado"];

// Só estes 4 podem ser forçados por `?assinaturaEstado=` e aparecer de verdade na tela —
// "ativacao", "cancelamento" e "atraso" ficam fora da UI, mas continuam no tipo e nas tabelas de
// conteúdo (estadosAssinaturaConteudo.ts), sem apagar nada.
export const ESTADOS_EXIBIDOS: readonly EstadoAssinatura[] = ["ativo", "pendente", "cancelado", "encerrado"];

export function estadoAssinaturaViaParametro(): EstadoAssinatura | null {
  if (typeof window === "undefined") return null;
  const forcado = new URLSearchParams(window.location.search).get("assinaturaEstado");
  if (forcado && (ESTADOS_VALIDOS as string[]).includes(forcado)) return forcado as EstadoAssinatura;
  return null;
}

// Ponto único de leitura do estado "de verdade" pras telas: aplica os dois fallbacks pedidos no
// Prompt 1h — estado ausente ou fora de ESTADOS_EXIBIDOS cai em "ativo", e "encerrado" só vale
// pros planos Semestral e Anual (qualquer outro plano também cai em "ativo"). Use esta função em
// vez de `estadoAssinaturaViaParametro()` direto em qualquer tela nova.
export function estadoAssinaturaEfetivo(planoId?: PlanoId | null): EstadoAssinatura {
  const bruto = estadoAssinaturaViaParametro();
  if (!bruto || !ESTADOS_EXIBIDOS.includes(bruto)) return "ativo";
  if (bruto === "encerrado" && planoId !== "semestral" && planoId !== "anual") return "ativo";
  return bruto;
}

// `?pixVencido=1`, usado junto com `?assinaturaEstado=pendente` — simula o código Pix já expirado
// pra revisar o texto/botão alternativo ("Gerar novo Pix") sem esperar o prazo real de expiração.
export function pixVencidoViaParametro(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("pixVencido") === "1";
}
