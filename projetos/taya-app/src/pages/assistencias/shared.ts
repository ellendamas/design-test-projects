// Dados e constantes compartilhados entre as telas do fluxo de oferta BeneMed
// (Saúde dentro de Assistências) — plano escolhido, chave de telefone validado.

export type PlanoId = "mensal" | "semestral" | "anual";

export type Plano = {
  id: PlanoId;
  nome: string;
  precoMes: string;
  cobranca: string;
  destaque?: string;
};

export const PLANOS: Plano[] = [
  { id: "mensal", nome: "Mensal", precoMes: "R$ 39,90", cobranca: "Cobrança mensal" },
  { id: "semestral", nome: "Semestral", precoMes: "R$ 33,00", cobranca: "R$ 198,00 a cada 6 meses" },
  { id: "anual", nome: "Anual", precoMes: "R$ 29,00", cobranca: "R$ 348,00 a cada 12 meses", destaque: "Mais econômico" },
];

// Mesma chave usada em leilao-clt/MfaPage.tsx e minha-conta/VerificarContato.tsx — o
// telefone validado é um estado compartilhado em todo o app, não específico dessa jornada.
export const TELEFONE_VALIDADO_KEY = "podeja_telefone_validado";

export function telefoneJaValidado(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(TELEFONE_VALIDADO_KEY) === "true";
}

export type AssistenciaSaudeState = {
  plano: Plano;
};

// Estado mockado de "tem assinatura BeneMed ativa" — sem backend real ainda, igual ao resto
// do fluxo. Setado em ConfirmacaoPage.tsx (pagamento confirmado) e lido tanto em
// AssinaturaPage.tsx (Minha assinatura) quanto no card "O2" do Para Você Agora
// (RecomendacoesContext.tsx), que deve sumir quando isso for true.
const ASSINATURA_ATIVA_KEY = "podeja_benemed_assinatura_ativa";

export function temAssinaturaBenemedAtiva(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ASSINATURA_ATIVA_KEY) !== null;
}

export function getAssinaturaBenemedAtiva(): Plano | null {
  if (typeof window === "undefined") return null;
  const planoId = window.localStorage.getItem(ASSINATURA_ATIVA_KEY) as PlanoId | null;
  return PLANOS.find((p) => p.id === planoId) ?? null;
}

export function ativarAssinaturaBenemed(plano: Plano): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSINATURA_ATIVA_KEY, plano.id);
}

// Status de cobrança da assinatura — ainda não existe webhook real da BeneMed avisando
// sucesso/falha de cobrança, então isso é 100% mock. Dois jeitos de ligar o estado de falha pra
// testar o card "Não conseguimos cobrar" no Para Você Agora, sem precisar do webhook:
//   1) ?assinaturaCobranca=falhou na URL (DESIGN ONLY) — sozinho já é suficiente pra
//      pré-visualizar o card, mesmo sem ter passado pelo fluxo de compra antes (mesmo padrão de
//      ?erro=/?status= no resto do app: o parâmetro nunca depende de outro estado pra funcionar)
//   2) trocar a constante COBRANCA_FALHOU_MOCK abaixo pra true — nesse caso sim, só conta se
//      já existir uma assinatura ativa (comportamento "realista", sem bypass)
const COBRANCA_FALHOU_MOCK = false; // troque pra true pra simular falha sem usar o query param

export function cobrancaBenemedFalhou(): boolean {
  if (typeof window !== "undefined") {
    const forcado = new URLSearchParams(window.location.search).get("assinaturaCobranca");
    if (forcado === "falhou") return true; // DESIGN ONLY — bypassa a checagem de assinatura ativa
    if (forcado === "em_dia") return false;
  }
  return temAssinaturaBenemedAtiva() && COBRANCA_FALHOU_MOCK;
}
