import { getStoredUser } from "@/App";
import type { ReferralOrigin } from "./shared";

// Taxonomia de eventos Amplitude do programa "Indique e ganhe" (BeneMed) — seção 7 da spec
// (docs/journey-specs/indique-e-ganhe-benemed-journey-spec.md). Mesmo espírito de
// src/utils/analytics.ts (console.log no lugar de um SDK de verdade), só que aqui cada evento
// carrega as propriedades padrão (usuário/sessão/plataforma/fluxo) + as propriedades próprias
// de cada evento, pra já sair no formato que o Amplitude espera quando a integração entrar.
//
// Eventos marcados "servidor" na spec (link gerado, atribuição, compra, ciclo de comissão) não
// têm backend de verdade nesse protótipo — as funções abaixo simulam a emissão no lugar certo
// do fluxo (comentado em cada uma), só pra deixar claro na timeline do console onde cada evento
// nasceria se o Bruno estivesse integrando o webhook da BeneMed de verdade.

const FLOW_NAME = "indique_e_ganhe_benemed";

function getSessionId(): string {
  if (typeof window === "undefined") return "s-ssr";
  const KEY = "podeja_referral_session_id";
  const existente = window.sessionStorage.getItem(KEY);
  if (existente) return existente;
  const novo = `s-${Math.random().toString(36).slice(2, 10)}`;
  window.sessionStorage.setItem(KEY, novo);
  return novo;
}

// Nenhum evento carrega nome, e-mail, telefone ou CPF (R7) — por isso o user_id aqui é um hash
// raso do e-mail (nunca o e-mail em si), e quem não está logado (landing pública) usa
// anonymous_id, como pede a seção 7 da spec.
function hashRaso(valor: string): string {
  let h = 0;
  for (let i = 0; i < valor.length; i++) {
    h = (h * 31 + valor.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

function idsPadrao(): { user_id?: string; anonymous_id?: string } {
  const user = getStoredUser();
  if (user?.email) return { user_id: `u-${hashRaso(user.email)}` };
  if (typeof window === "undefined") return {};
  const KEY = "podeja_referral_anonymous_id";
  let anon = window.localStorage.getItem(KEY);
  if (!anon) {
    anon = `a-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(KEY, anon);
  }
  return { anonymous_id: anon };
}

type PropriedadesPadrao = {
  screen_name: string;
  step_name: string;
};

function track(eventName: string, padrao: PropriedadesPadrao, properties: Record<string, unknown> = {}) {
  const payload = {
    event_name: eventName,
    ...idsPadrao(),
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    platform: "Web",
    flow_name: FLOW_NAME,
    step_name: padrao.step_name,
    screen_name: padrao.screen_name,
    ...properties,
  };
  console.log(`[analytics] ${eventName}`, payload);
  // amplitude.track(eventName, payload)
}

// --- IG-00a/IG-00b/IG-05/IG-06 — banners ------------------------------------------------------
// (IG-01, o card dentro de Assistências, saiu de escopo — a indicação só aparece no dashboard
// e na confirmação da contratação agora; `referral_entry_viewed` foi removido com ele)

export function trackReferralBannerViewed(placement: "dashboard" | "pos_contratacao") {
  track(
    "referral_banner_viewed",
    { screen_name: placement === "dashboard" ? "dashboard_banner" : "confirmacao_contratacao_banner", step_name: "entrada" },
    { placement },
  );
}

export function trackReferralBannerClicked(placement: "dashboard" | "pos_contratacao") {
  track(
    "referral_banner_clicked",
    { screen_name: placement === "dashboard" ? "dashboard_banner" : "confirmacao_contratacao_banner", step_name: "entrada" },
    { placement },
  );
}

export function trackReferralBannerDismissed(placement: "dashboard" | "pos_contratacao") {
  track(
    "referral_banner_dismissed",
    { screen_name: placement === "dashboard" ? "dashboard_banner" : "confirmacao_contratacao_banner", step_name: "entrada" },
    { placement },
  );
}

// --- IG-02 — tela de indicação ----------------------------------------------------------------

export function trackReferralScreenViewed(origin: ReferralOrigin, hasExistingLink?: boolean) {
  track(
    "referral_screen_viewed",
    { screen_name: "indique_ganhe", step_name: "tela_indicacao" },
    { origin, ...(hasExistingLink !== undefined ? { has_existing_link: hasExistingLink } : {}) },
  );
}

// Servidor (simulado): o código só é "gerado no servidor" na primeira visita de cada pessoa —
// chamado a partir de getOrCreateReferralCode() em shared.ts, no exato ponto em que o código
// novo é persistido pela primeira vez.
export function trackReferralLinkGenerated(referralCode: string, isFirstLink: boolean) {
  track("referral_link_generated", { screen_name: "indique_ganhe", step_name: "link" }, { referral_code: referralCode, is_first_link: isFirstLink });
}

export function trackReferralLinkGenerationFailed(errorType: string, httpStatus?: number) {
  track(
    "referral_link_generation_failed",
    { screen_name: "indique_ganhe", step_name: "link" },
    { error_type: errorType, ...(httpStatus !== undefined ? { http_status: httpStatus } : {}) },
  );
}

export function trackReferralLinkShareStarted(referralCode: string, channel: "whatsapp" | "native_share") {
  track("referral_link_share_started", { screen_name: "indique_ganhe", step_name: "compartilhamento" }, { referral_code: referralCode, channel });
}

export function trackReferralLinkCopied(referralCode: string) {
  track("referral_link_copied", { screen_name: "indique_ganhe", step_name: "compartilhamento" }, { referral_code: referralCode });
}

export function trackReferralRulesOpened(origin?: string) {
  track("referral_rules_opened", { screen_name: "regras_programa", step_name: "regras" }, origin ? { origin } : {});
}

// --- IG-04 — landing pública -------------------------------------------------------------------

export function trackReferralLandingViewed(referralValid: boolean, referralCode?: string, utmSource?: string, utmCampaign?: string) {
  track(
    "referral_landing_viewed",
    { screen_name: "landing_benemed", step_name: "landing" },
    {
      referral_valid: referralValid,
      ...(referralCode ? { referral_code: referralCode } : {}),
      ...(utmSource ? { utm_source: utmSource } : {}),
      ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
    },
  );
}

export function trackReferralPlanSelected(planId: "individual" | "familiar", planPriceBrl: number) {
  track("referral_plan_selected", { screen_name: "landing_benemed", step_name: "landing" }, { plan_id: planId, plan_price_brl: planPriceBrl });
}

export function trackReferralLandingCtaClicked(planId: "individual" | "familiar", referralCode?: string) {
  track(
    "referral_landing_cta_clicked",
    { screen_name: "landing_benemed", step_name: "landing" },
    { plan_id: planId, ...(referralCode ? { referral_code: referralCode } : {}) },
  );
}

// Servidor (simulado): dispararia quando a conta é criada ou acessada com o cookie/parâmetro de
// atribuição presente — aqui não existe esse passo de verdade (cadastro/login ficam fora desta
// spec). O ponto em que a pessoa segue pro cadastro, com `ref` na URL, é PlanosPublico.tsx
// (dentro da LP pública em SaudeProdutoPage.tsx, modo "publica") — é ali que o dev real vai
// plugar este evento, como registro do que o backend faria a seguir.
export function trackReferralSignupAttributed(
  referralCode: string,
  attributionMethod: "url_param" | "cookie" | "server_lookup",
  selfReferral: boolean,
  isNewUser?: boolean,
) {
  track(
    "referral_signup_attributed",
    { screen_name: "landing_benemed", step_name: "atribuicao" },
    { referral_code: referralCode, attribution_method: attributionMethod, self_referral: selfReferral, ...(isNewUser !== undefined ? { is_new_user: isNewUser } : {}) },
  );
}

// Servidor (simulado).
export function trackReferralAttributionFailed(reason: "code_invalid" | "window_expired" | "already_attributed", referralCode?: string) {
  track(
    "referral_attribution_failed",
    { screen_name: "landing_benemed", step_name: "atribuicao" },
    { reason, ...(referralCode ? { referral_code: referralCode } : {}) },
  );
}

// --- Compra e ciclo de comissão (servidor, simulado) --------------------------------------------

export function trackReferralPurchaseCompleted(referralCode: string, planId: "individual" | "familiar", orderId: string, amountBrl: number, selfReferral: boolean) {
  track(
    "referral_purchase_completed",
    { screen_name: "assistencias_contratacao", step_name: "compra" },
    { referral_code: referralCode, plan_id: planId, order_id: orderId, amount_brl: amountBrl, self_referral: selfReferral },
  );
}

export function trackReferralCommissionCreated(commissionId: string, amountBrl: number, commissionPct: number, planId: "individual" | "familiar") {
  track("referral_commission_created", { screen_name: "", step_name: "comissao" }, { commission_id: commissionId, amount_brl: amountBrl, commission_pct: commissionPct, plan_id: planId });
}

export function trackReferralCommissionConfirmed(commissionId: string, amountBrl: number, daysToConfirm?: number) {
  track(
    "referral_commission_confirmed",
    { screen_name: "", step_name: "comissao" },
    { commission_id: commissionId, amount_brl: amountBrl, ...(daysToConfirm !== undefined ? { days_to_confirm: daysToConfirm } : {}) },
  );
}

export function trackReferralCommissionPaid(commissionId: string, amountBrl: number, daysToPay?: number) {
  track(
    "referral_commission_paid",
    { screen_name: "", step_name: "comissao" },
    { commission_id: commissionId, amount_brl: amountBrl, ...(daysToPay !== undefined ? { days_to_pay: daysToPay } : {}) },
  );
}

export function trackReferralCommissionReversed(commissionId: string, reason: "cancellation" | "refund" | "chargeback" | "fraud", amountBrl?: number) {
  track(
    "referral_commission_reversed",
    { screen_name: "", step_name: "comissao" },
    { commission_id: commissionId, reason, ...(amountBrl !== undefined ? { amount_brl: amountBrl } : {}) },
  );
}
