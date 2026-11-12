// DESIGN ONLY: o formato abaixo espelha campo a campo a API real de Discovery do parceiro de
// Open Finance (GET .../open/itp/participants/brands), documentada em
// https://developers.celcoin.com.br/docs/listar-marcas-no-open-finance. Tentei consumir essa
// API direto pra pegar dados e logos reais, mas ela exige autenticação que não temos aqui
// (retornou 401). Os dados abaixo são mock, só pra simulação de design. Os devs precisam
// trocar isso pela chamada real à API em produção, incluindo `customerFriendlyLogoUri`, que
// fica null em todos os itens aqui: não temos o logo real de nenhum banco pra simular.
export type CelcoinBrand = {
  brandId: string;
  customerFriendlyName: string;
  customerFriendlyLogoUri: string | null;
  suportaPF: boolean;
  suportaPJ: boolean;
};

export const celcoinBrandsMock: CelcoinBrand[] = [
  { brandId: "nubank", customerFriendlyName: "Nubank", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: false },
  { brandId: "itau", customerFriendlyName: "Itaú", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "bradesco", customerFriendlyName: "Bradesco", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "bb", customerFriendlyName: "Banco do Brasil", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "caixa", customerFriendlyName: "Caixa Econômica", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "santander", customerFriendlyName: "Santander", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "inter", customerFriendlyName: "Inter", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "c6", customerFriendlyName: "C6 Bank", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "picpay", customerFriendlyName: "PicPay", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: false },
  { brandId: "mercado-pago", customerFriendlyName: "Mercado Pago", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "btg", customerFriendlyName: "BTG Pactual", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "sicredi", customerFriendlyName: "Sicredi", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "sicoob", customerFriendlyName: "Sicoob", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: true },
  { brandId: "neon", customerFriendlyName: "Neon", customerFriendlyLogoUri: null, suportaPF: true, suportaPJ: false },
];

// A Pode Já só atende pessoa física. Filtra só marcas com suporte a PF, do mesmo jeito que o
// backend faria com o parâmetro `flags=pf` na chamada real à API.
export const celcoinBrandsPF = celcoinBrandsMock.filter((brand) => brand.suportaPF);

export const BRANDS_EM_DESTAQUE = ["nubank", "itau", "bradesco", "bb", "caixa"];

// DESIGN ONLY: passo a passo por banco pros mais usados. Isso não vem da API do parceiro (ela
// não devolve instrução nenhuma, só os dados da marca): é conteúdo nosso, mantido à mão só
// pros bancos em destaque. Qualquer outro banco usa o texto genérico abaixo.
export const instrucoesPorBanco: Record<string, string[]> = {
  nubank: [
    "O app do Nubank vai abrir",
    "Faça login e confirme a autorização",
    "Você volta para a Pode Já automaticamente",
  ],
  itau: [
    "O app ou o site do Itaú vai abrir",
    "Entre com sua senha eletrônica",
    "Confirme a autorização e volte para a Pode Já",
  ],
  bradesco: [
    "O app ou o site do Bradesco vai abrir",
    "Use sua senha ou biometria para entrar",
    "Confirme a autorização e volte para a Pode Já",
  ],
  bb: [
    "O app ou o site do Banco do Brasil vai abrir",
    "Digite sua senha de acesso",
    "Confirme a autorização e volte para a Pode Já",
  ],
  caixa: [
    "O app ou o site da Caixa vai abrir",
    "Faça login com sua senha",
    "Confirme a autorização e volte para a Pode Já",
  ],
};

export const INSTRUCOES_GENERICAS = [
  "O app ou o site do seu banco vai abrir",
  "Faça login e confirme a autorização",
  "Você volta para a Pode Já automaticamente",
];
