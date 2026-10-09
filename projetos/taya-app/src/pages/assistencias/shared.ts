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
