// Config mock do programa "Indique e ganhe" (BeneMed) — R2 da spec
// (docs/journey-specs/indique-e-ganhe-benemed-journey-spec.md). Em produção isso viria de um
// serviço de feature flag real; aqui é um arquivo estático que simula a mesma forma (flag
// global + lista de permitidos), pra já nascer no formato que vai virar configuração remota
// depois, sem precisar mudar a assinatura das funções que o consomem.

// Estado inicial da Fase 0 do rollout (seção 9 da spec): flag ligada, mas só o time interno
// enxerga o programa. Abrir pra todos é mudar `referralAllowlist`/a checagem de domínio abaixo
// por configuração, sem novo deploy — nessa prévia mockada, sem redeploy nenhum mesmo.
export const referralEnabled = true;

// Lista de permitidos mockada — time interno da Taya. Incluí o e-mail da Ellen (quem pediu essa
// spec) pra já dar pra testar o fluxo logado de ponta a ponta sem precisar editar nada.
export const referralAllowlist: string[] = [
  "ellen.damasceno@taya.com.br",
  "bruno@taya.com.br",
  "barreto@taya.com.br",
];

const REFERRAL_OVERRIDE_KEY = "podeja_referral_override";

// TRAVA — todos os overrides DESIGN ONLY deste módulo (?referral=on|off aqui, mais
// ?indicacoes=vazio, ?referralFlag=erro e ?referralLink=erro em pages/referral/) só valem fora
// do domínio de produção real da Pode Já. Em produção a flag vem do servidor (serviço de
// feature flag de verdade), sem override por query string — como esse protótipo não tem um
// ambiente de produção real pra diferenciar por env var, a checagem é pelo hostname.
const PRODUCTION_HOSTNAMES = ["podeja.com.br", "www.podeja.com.br"];

export function permiteOverrideDesignOnly(): boolean {
  if (typeof window === "undefined") return false;
  return !PRODUCTION_HOSTNAMES.includes(window.location.hostname);
}

// DESIGN ONLY — ?referral=on|off na URL força a elegibilidade pro programa, pra revisar as
// telas sem precisar logar com um e-mail da allowlist. Funciona sozinho (persiste), mesmo
// padrão de ?assinaturaPlano=/?assinaturaCobranca= em assistencias/shared.ts: "on" e "off"
// gravam a escolha; qualquer outro valor (ou ausência do parâmetro) lê o que já foi gravado.
function referralOverrideViaUrl(): boolean | null {
  if (typeof window === "undefined" || !permiteOverrideDesignOnly()) return null;
  const forcado = new URLSearchParams(window.location.search).get("referral");
  if (forcado === "on") {
    window.localStorage.setItem(REFERRAL_OVERRIDE_KEY, "on");
    return true;
  }
  if (forcado === "off") {
    window.localStorage.setItem(REFERRAL_OVERRIDE_KEY, "off");
    return false;
  }
  const salvo = window.localStorage.getItem(REFERRAL_OVERRIDE_KEY);
  if (salvo === "on") return true;
  if (salvo === "off") return false;
  return null;
}

// Elegibilidade real (R2 da spec, Fase 0 do rollout): flag ligada && pessoa na allowlist.
// IMPORTANTE pra quem for codar isso de verdade: a checagem é contra a allowlist (lista de
// pessoas do time interno), nunca contra domínio de e-mail — quem é indicado não
// necessariamente tem e-mail @taya.com.br, então validar por domínio não faz sentido nem pra
// quem indica (o time pode logar com e-mail pessoal) nem pra quem é indicado.
//
// Neste protótipo a checagem de allowlist fica DESLIGADA de propósito: o card, o banner e a
// tela ficam visíveis pra qualquer pessoa logada, pra não travar a revisão por causa do e-mail
// usado na conta de teste. `email` continua recebido aqui só pra manter a assinatura igual à
// que a versão real vai usar — troque o `return true` abaixo por uma checagem contra
// `referralAllowlist` quando for implementar a Fase 0 de verdade.
export function isReferralEligible(email: string | null | undefined): boolean {
  if (!referralEnabled) return false;
  const override = referralOverrideViaUrl();
  if (override !== null) return override;
  void email; // reservado pra checagem real contra referralAllowlist — não usado no protótipo
  return true;
}
