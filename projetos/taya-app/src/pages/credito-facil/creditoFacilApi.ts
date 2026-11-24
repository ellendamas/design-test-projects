// DESIGN ONLY — mocks da LeadGen API da Facio, parceira que opera o produto Crédito Fácil.
// Nenhuma chamada de rede real acontece aqui. Ver journey-spec:
// docs/journey-specs/credito-facil-contorno-journey-spec.md

import { getStoredUser } from "@/App";

export type CreditoFacilOffer = { maxValue: number; description: string };
export type CreditoFacilAvailability = { isAvailable: boolean; offer?: CreditoFacilOffer };

// DESIGN ONLY — simula POST /leadgen/availability. `forcarResultado` permite testar os três
// estados sem depender de uma chamada real (ver uso em CreditoPessoalReprovada e
// CreditoFacilIntroPage).
export async function consultarDisponibilidadeCreditoFacil(opts?: {
  forcarResultado?: "disponivel" | "indisponivel" | "erro";
}): Promise<CreditoFacilAvailability> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (opts?.forcarResultado === "erro") {
    throw new Error("Falha ao consultar disponibilidade na Facio");
  }
  if (opts?.forcarResultado === "indisponivel") {
    return { isAvailable: false };
  }
  return {
    isAvailable: true,
    offer: {
      // Texto verbatim do retorno real da API de consulta (LeadGen API, exemplo de payload).
      maxValue: 300,
      description: "Antecipe até R$ 300 com a Facio. Taxas a partir de R$ 9,90.",
    },
  };
}

export type CreditoFacilLeadData = {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
};

// DESIGN ONLY — simula POST /leadgen/lead. Em produção, a URL retornada (`registrationUrl`) já
// vem pronta da Facio, com o utm_source/utm_content que identificam o lead como da Pode Já.
export async function cadastrarLeadCreditoFacil(
  _dados: CreditoFacilLeadData,
  opts?: { forcarErro?: boolean },
): Promise<{ registrationUrl: string }> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (opts?.forcarErro) {
    throw new Error("Não foi possível gerar o link da Facio agora");
  }
  const token = Math.random().toString(36).slice(2, 10);
  return {
    registrationUrl: `https://facio.com.br/app/cadastro-simplificado/?token=${token}&utm_source=pode-ja&utm_medium=leadgen-api&utm_campaign=link`,
  };
}

const VEIO_NEGATIVADO_CLT_KEY = "veio_negativado_clt";

// DESIGN ONLY — sinaliza que o usuário foi negativado no Consignado CLT antes de ir pro Crédito
// Pessoal (chamado nas telas de inelegibilidade do CLT, ao navegar pro Crédito Pessoal). Usado
// nas telas de negativa/inelegibilidade do Crédito Pessoal pra decidir a "dupla negativa": quem
// já foi negado nos dois produtos vê só o banner do Crédito Fácil, sem o cross-sell genérico (ver
// journey-spec, seção 5 — pedido da Ellen: não faz sentido oferecer Saúde por Assinatura, algo
// pra gastar, pra quem está precisando de dinheiro).
export function marcarNegativadoClt() {
  try {
    window.localStorage.setItem(VEIO_NEGATIVADO_CLT_KEY, "true");
  } catch {
    // localStorage indisponível — segue sem marcar, sem travar a navegação
  }
}

export function veioNegativadoClt(): boolean {
  try {
    return window.localStorage.getItem(VEIO_NEGATIVADO_CLT_KEY) === "true";
  } catch {
    return false;
  }
}

// DESIGN ONLY — leitura dos dados do lead a partir do que o app já tem. Usada tanto pela tela de
// confirmar dados (como valor inicial, editável) quanto pelo fast-track da intro (ver
// podeFazerFastTrackCreditoFacil), pra não duplicar a lógica nos dois lugares.
export function lerDadosCreditoFacil(): CreditoFacilLeadData {
  const user = getStoredUser();
  const telefone = (() => {
    try {
      return window.localStorage.getItem("podeja_celular") ?? "(11) 99999-8888";
    } catch {
      return "(11) 99999-8888";
    }
  })();
  // Coletada no cadastro (etapa 2) e já persistida em produção, segundo a Ellen (24/11/2026).
  // Aqui lida do mesmo lugar que a tela Meus dados grava (localStorage, DESIGN ONLY).
  const dataNascimento = (() => {
    try {
      return window.localStorage.getItem("podeja_data_nascimento") ?? "15/03/1990";
    } catch {
      return "15/03/1990";
    }
  })();

  return {
    // "||" em vez de "??" por precaução: um bug corrigido em 24/11/2026 em dois pontos do login
    // chegou a gravar `email: ""` no "podeja_user" de sessões antigas, e "??" não cai no
    // fallback pra string vazia (só pra null/undefined). Protege contra esse e casos parecidos.
    name: user?.name || "Cliente Pode Já",
    cpf: user?.cpf || "000.000.000-00",
    birthDate: dataNascimento,
    email: user?.email || "cliente@exemplo.com",
    phone: telefone,
  };
}

// DESIGN ONLY — regra pedida pela Ellen em 24/11/2026: se o usuário já tem todos os dados
// obrigatórios disponíveis no app e pelo menos um método de contato verificado (e-mail ou
// celular), a intro pula a tela de confirmar dados e vai direto pro redirecionamento.
//
// Nome, CPF, e-mail e data de nascimento são coletados no cadastro (data de nascimento na etapa
// 2) e já ficam persistidos em produção, segundo a Ellen — por isso não travam o fast-track aqui.
// O único dado que ainda pode faltar de verdade é o celular, que só conta como disponível se o
// usuário já tiver configurado em Minha Conta (não o mock de fallback). Sem o parâmetro de
// simulação, o fast-track fecha como `true` pra quem já tem celular configurado e pelo menos um
// contato verificado — o que cobre boa parte da base, não só um caso raro.
export function podeFazerFastTrackCreditoFacil(opts?: { forcar?: boolean }): boolean {
  if (opts?.forcar !== undefined) return opts.forcar;

  const user = getStoredUser();
  let temCelularConfigurado = false;
  let temContatoVerificado = false;
  try {
    temCelularConfigurado = window.localStorage.getItem("podeja_celular") !== null;
    temContatoVerificado =
      window.localStorage.getItem("podeja_email_validado") === "true" ||
      window.localStorage.getItem("podeja_telefone_validado") === "true";
  } catch {
    // localStorage indisponível — trata como dado não disponível, segue fluxo normal (sem pular)
  }

  const temTodosOsDados =
    Boolean(user?.name) && Boolean(user?.cpf) && Boolean(user?.email) && temCelularConfigurado;

  return temTodosOsDados && temContatoVerificado;
}
