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
