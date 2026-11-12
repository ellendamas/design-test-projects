export type OpenFinanceBankId = "nubank" | "caixa" | "bb" | "bradesco" | "itau";

export const openFinanceBanks: Array<{
  id: OpenFinanceBankId;
  name: string;
  color: string;
  initials: string;
  eta: string;
  steps: string[];
}> = [
  {
    id: "nubank",
    name: "Nubank",
    color: "#820AD1",
    initials: "N",
    eta: "Menos de 1 minuto",
    steps: [
      "O app do Nubank vai abrir automaticamente",
      "Toque em 'Permitir' na tela de autorização",
      "Confirme com sua senha ou biometria do Nubank",
      "Pronto — você volta para o Pode Já automaticamente",
    ],
  },
  {
    id: "caixa",
    name: "Caixa Econômica",
    color: "#005CA9",
    initials: "C",
    eta: "Cerca de 2 minutos",
    steps: [
      "O app Caixa vai abrir automaticamente",
      "Faça login com sua senha do app Caixa",
      "Na tela de compartilhamento, toque em 'Autorizar'",
      "Selecione os dados e confirme",
      "Você volta para o Pode Já automaticamente",
    ],
  },
  {
    id: "bb",
    name: "Banco do Brasil",
    color: "#F9BB00",
    initials: "BB",
    eta: "Cerca de 2 minutos",
    steps: [
      "O app do Banco do Brasil vai abrir",
      "Digite sua senha de 8 dígitos",
      "Toque em 'Compartilhar dados' e confirme",
      "Você volta para o Pode Já automaticamente",
    ],
  },
  {
    id: "bradesco",
    name: "Bradesco",
    color: "#CC092F",
    initials: "B",
    eta: "Cerca de 2 minutos",
    steps: [
      "O app Bradesco vai abrir automaticamente",
      "Use sua senha ou biometria para entrar",
      "Toque em 'Autorizar compartilhamento'",
      "Confirme os dados e toque em 'Concluir'",
      "Você volta para o Pode Já automaticamente",
    ],
  },
  {
    id: "itau",
    name: "Itaú",
    color: "#EC7000",
    initials: "I",
    eta: "Cerca de 2 minutos",
    steps: [
      "O app Itaú vai abrir automaticamente",
      "Entre com sua senha eletrônica",
      "Toque em 'Permitir acesso' no Open Finance",
      "Confirme com token ou biometria",
      "Você volta para o Pode Já automaticamente",
    ],
  },
];

export const tier1BankIds: OpenFinanceBankId[] = ["nubank", "caixa", "bb", "bradesco", "itau"];

export const openFinanceBankDirectory: Array<{
  id: string;
  name: string;
  color: string;
  initials: string;
  available: boolean;
  group: "top" | "other";
}> = [
  { id: "nubank",       name: "Nubank",          color: "#820AD1", initials: "N",  available: true,  group: "top" },
  { id: "caixa",        name: "Caixa Econômica", color: "#005CA9", initials: "C",  available: true,  group: "top" },
  { id: "bb",           name: "Banco do Brasil", color: "#F9BB00", initials: "BB", available: true,  group: "top" },
  { id: "bradesco",     name: "Bradesco",        color: "#CC092F", initials: "B",  available: true,  group: "top" },
  { id: "itau",         name: "Itaú",            color: "#EC7000", initials: "I",  available: true,  group: "top" },
  { id: "santander",    name: "Santander",       color: "#EC0000", initials: "S",  available: false, group: "top" },
  { id: "inter",        name: "Inter",           color: "#FF7A00", initials: "I",  available: false, group: "top" },
  { id: "c6",           name: "C6 Bank",         color: "#111827", initials: "C6", available: false, group: "top" },
  { id: "picpay",       name: "PicPay",          color: "#21C25E", initials: "P",  available: false, group: "top" },
  { id: "mercado-pago", name: "Mercado Pago",    color: "#009EE3", initials: "MP", available: false, group: "top" },
  { id: "btg",          name: "BTG Pactual",     color: "#0A3D91", initials: "B",  available: false, group: "other" },
  { id: "sicredi",      name: "Sicredi",         color: "#62BB46", initials: "S",  available: false, group: "other" },
  { id: "sicoob",       name: "Sicoob",          color: "#005A49", initials: "S",  available: false, group: "other" },
  { id: "bv",           name: "BV",              color: "#7E3AF2", initials: "BV", available: false, group: "other" },
  { id: "next",         name: "Next",            color: "#00F2A9", initials: "N",  available: false, group: "other" },
  { id: "neon",         name: "Neon",            color: "#00B9FF", initials: "N",  available: false, group: "other" },
  { id: "ame",          name: "Ame Digital",     color: "#E11D48", initials: "A",  available: false, group: "other" },
  { id: "pagbank",      name: "PagBank",         color: "#16A34A", initials: "P",  available: false, group: "other" },
  { id: "original",     name: "Original",        color: "#00A859", initials: "O",  available: false, group: "other" },
  { id: "banrisul",     name: "Banrisul",        color: "#0057B8", initials: "B",  available: false, group: "other" },
  { id: "safra",        name: "Safra",           color: "#1D4ED8", initials: "S",  available: false, group: "other" },
  { id: "modal",        name: "Modal",           color: "#6B7280", initials: "M",  available: false, group: "other" },
];
