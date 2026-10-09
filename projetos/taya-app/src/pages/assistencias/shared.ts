// Dados e constantes compartilhados entre as telas do fluxo de oferta BeneMed
// (Saúde dentro de Assistências) — plano escolhido, chave de telefone validado.

export type PlanoId = "mensal" | "semestral" | "anual" | "familiar";
export type ModalidadePlano = "individual" | "familiar";

export type Plano = {
  id: PlanoId;
  /** Código do plano no catálogo da BeneMed, quando fornecido pelo parceiro. Não aparece na UI. */
  idExterno?: string;
  modalidade: ModalidadePlano;
  nome: string;
  precoMes: string;
  cobranca: string;
  /** Texto curto de coberta, ex: "Você + 3 dependentes" — só o plano Familiar usa por enquanto. */
  cobertura?: string;
  destaque?: string;
};

export const PLANOS: Plano[] = [
  { id: "mensal", modalidade: "individual", nome: "Mensal", precoMes: "R$ 39,90", cobranca: "Cobrança mensal" },
  { id: "semestral", modalidade: "individual", nome: "Semestral", precoMes: "R$ 33,00", cobranca: "R$ 198,00 a cada 6 meses" },
  { id: "anual", modalidade: "individual", nome: "Anual", precoMes: "R$ 29,00", cobranca: "R$ 348,00 a cada 12 meses", destaque: "Mais econômico" },
  // Por enquanto só existe uma periodicidade pro Familiar (mensal) — se a BeneMed oferecer
  // semestral/anual pra essa modalidade depois, entra como novo item aqui, mesmo padrão.
  { id: "familiar", idExterno: "205", modalidade: "familiar", nome: "Familiar", precoMes: "R$ 53,90", cobranca: "Cobrança mensal", cobertura: "Você + 3 dependentes", destaque: "Mais econômico para a família" },
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
// sucesso/falha de cobrança, então isso é 100% mock, persistido (pra sobreviver à navegação
// entre telas: card → pagamento → confirmação, que resolve a falha de verdade).
// Dois jeitos de ligar o estado de falha pra testar sem precisar do webhook:
//   1) ?assinaturaCobranca=falhou na URL (DESIGN ONLY) — funciona sozinho, mesmo sem assinatura
//      ativa (bypass só de preview), e também persiste — não precisa ficar repetindo o
//      parâmetro nas próximas telas do fluxo de regularização.
//   2) window.localStorage.setItem("podeja_benemed_cobranca_falhou", "true") no console —
//      nesse caso só conta se já existir uma assinatura ativa (comportamento "realista").
const COBRANCA_FALHOU_KEY = "podeja_benemed_cobranca_falhou";

export function cobrancaBenemedFalhou(): boolean {
  if (typeof window === "undefined") return false;
  const forcado = new URLSearchParams(window.location.search).get("assinaturaCobranca");
  if (forcado === "falhou") {
    window.localStorage.setItem(COBRANCA_FALHOU_KEY, "true");
    return true; // DESIGN ONLY — bypassa a checagem de assinatura ativa
  }
  if (forcado === "em_dia") {
    window.localStorage.removeItem(COBRANCA_FALHOU_KEY);
    return false;
  }
  return temAssinaturaBenemedAtiva() && window.localStorage.getItem(COBRANCA_FALHOU_KEY) === "true";
}

// Chamado ao confirmar o pagamento de regularização (ConfirmacaoPage.tsx) — some com o card de
// falha de cobrança e com o estado de "regularização" em PagamentoPage.tsx.
export function resolverCobrancaBenemed(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(COBRANCA_FALHOU_KEY);
}
