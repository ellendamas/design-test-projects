import { PLANOS, type Plano } from "@/pages/assistencias/shared";

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
export type EstadoAssinatura = "ativo" | "ativacao" | "pendente" | "atraso" | "cancelamento" | "cancelado";

const ESTADOS_VALIDOS: readonly EstadoAssinatura[] = ["ativo", "ativacao", "pendente", "atraso", "cancelamento", "cancelado"];

export function estadoAssinaturaViaParametro(): EstadoAssinatura | null {
  if (typeof window === "undefined") return null;
  const forcado = new URLSearchParams(window.location.search).get("assinaturaEstado");
  if (forcado && (ESTADOS_VALIDOS as string[]).includes(forcado)) return forcado as EstadoAssinatura;
  return null;
}
