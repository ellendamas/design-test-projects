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
  { id: "mensal", modalidade: "individual", nome: "Mensal", precoMes: "R$ 39,90", cobranca: "Cobrança mensal" },
  { id: "semestral", modalidade: "individual", nome: "Semestral", precoMes: "R$ 33,00", cobranca: "R$ 198,00 a cada 6 meses" },
  { id: "anual", modalidade: "individual", nome: "Anual", precoMes: "R$ 29,00", cobranca: "R$ 348,00 a cada 12 meses", destaque: "Mais econômico" },
  // Por enquanto só existe uma periodicidade pro Familiar (mensal) — se a BeneMed oferecer
  // semestral/anual pra essa modalidade depois, entra como novo item aqui, mesmo padrão.
  { id: "familiar", idExterno: "205", modalidade: "familiar", nome: "Familiar", precoMes: "R$ 53,90", cobranca: "Cobrança mensal", cobertura: "Você + 3 dependentes", destaque: "Mais econômico para a família" },
];

// Planos exibidos na tela /assistencias/saude/planos — os 4 prazos do Individual (Mensal,
// Semestral, Anual, selecionáveis num mesmo card) mais o Familiar (só mensal por enquanto).
export const PLANOS_EXIBIDOS: PlanoId[] = ["mensal", "semestral", "anual", "familiar"];

export function planosExibidos(): Plano[] {
  return PLANOS.filter((p) => PLANOS_EXIBIDOS.includes(p.id));
}

// Planos exibidos na LP pública (/saude, Prompt 2 v3) — só as duas periodicidades mensais, sem
// o seletor de prazo da tela de planos do app: Semestral e Anual ficam de fora de propósito.
export const PLANOS_EXIBIDOS_PUBLICO: PlanoId[] = ["mensal", "familiar"];

export function planosExibidosPublico(): Plano[] {
  return PLANOS.filter((p) => PLANOS_EXIBIDOS_PUBLICO.includes(p.id));
}

// Mesma chave usada em leilao-clt/MfaPage.tsx e minha-conta/VerificarContato.tsx — o
// telefone validado é um estado compartilhado em todo o app, não específico dessa jornada.
export const TELEFONE_VALIDADO_KEY = "podeja_telefone_validado";

export function telefoneJaValidado(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(TELEFONE_VALIDADO_KEY) === "true";
}

// Mesma chave usada em minha-conta/VerificarContato.tsx (tipo="email") — o único outro lugar
// do app com verificação de e-mail hoje.
export const EMAIL_VALIDADO_KEY = "podeja_email_validado";

export function emailJaValidado(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(EMAIL_VALIDADO_KEY) === "true";
}

// Telefone e e-mail são sempre exigidos agora, não só em planos com Pix recorrente — decide a
// próxima etapa do fluxo verificando os dois em ordem fixa (celular primeiro, depois e-mail).
// Usado em SaudePage.tsx (ao continuar) e nas duas telas de verificação (ao concluir uma,
// verifica se falta a outra antes de ir pra confirmação de dados).
export function proximaEtapaAposVerificacao():
  | "/assistencias/saude/verificar-celular"
  | "/assistencias/saude/verificar-email"
  | "/assistencias/saude/confirmar-dados" {
  if (!telefoneJaValidado()) return "/assistencias/saude/verificar-celular";
  if (!emailJaValidado()) return "/assistencias/saude/verificar-email";
  return "/assistencias/saude/confirmar-dados";
}

export type AssistenciaSaudeState = {
  plano: Plano;
};

// Dias disponíveis pra cobrança dos planos Mensal e Familiar — os dois com Pix recorrente mês
// a mês (Semestral/Anual são recorrentes também, mas em ciclos mais longos, sem escolha de
// dia). Lista fixa por enquanto, sem vir de nenhuma API.
export const DIAS_COBRANCA = [5, 10, 15, 20, 25] as const;
export type DiaCobranca = (typeof DIAS_COBRANCA)[number];

// ---------------------------------------------------------------------------
// Prompt 1f (22/10) — regra de vencimento da próxima mensalidade, confirmada pelo time de
// cobrança: a primeira mensalidade é paga na contratação; a segunda vence no dia escolhido,
// mas só se esse dia cair a 30 dias ou mais da contratação (senão, pula pro mês seguinte, pra
// não cobrar de novo cedo demais). Funções puras, sem I/O, com testes em
// calcularProximoVencimento.test.ts (mesma pasta) — `node --test
// src/pages/assistencias/calcularProximoVencimento.test.ts` roda sem precisar de nenhuma
// dependência nova (Node 24 já faz strip de tipos TS nativamente).
// ---------------------------------------------------------------------------

// Converte "AAAA-MM-DD" num Date à meia-noite no fuso local (São Paulo neste app, já que não
// há troca de fuso no protótipo) — `new Date(string)` evita de propósito, porque esse
// construtor interpreta a string como UTC e pode voltar um dia quando formatado de volta num
// fuso negativo (exatamente o erro que esta tarefa pede pra evitar).
export function parseDataISOLocal(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

// Diferença em dias de calendário entre duas datas, ignorando hora/fuso — normaliza as duas
// pra meia-noite UTC antes de subtrair, pra um horário de verão no meio do intervalo não
// desviar a conta em 1 dia (23h/25h não são múltiplos exatos de 86400000ms).
function diferencaEmDiasCalendario(a: Date, b: Date): number {
  const aUTC = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bUTC = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bUTC - aUTC) / 86_400_000);
}

// Soma 1 mês a uma data, preservando o dia do mês — seguro aqui porque os dias escolhidos
// (DIAS_COBRANCA) nunca passam de 25, então nunca estoura o número de dias do mês seguinte.
function somarUmMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth() + 1, data.getDate());
}

// Regra de vencimento (seção 1 do Prompt 1f): a candidata é a primeira data, estritamente
// depois da contratação, cujo dia do mês seja o dia escolhido — se o dia da contratação já foi
// alcançado ou passado no mês da contratação, a candidata cai no mês seguinte. Se a candidata
// ficar a menos de 30 dias da contratação, soma mais um mês a ela.
export function calcularProximoVencimento(dataContratacao: Date, diaEscolhido: DiaCobranca): Date {
  const ano = dataContratacao.getFullYear();
  const mes = dataContratacao.getMonth();
  const diaContratacao = dataContratacao.getDate();

  let candidata =
    diaContratacao < diaEscolhido ? new Date(ano, mes, diaEscolhido) : new Date(ano, mes + 1, diaEscolhido);

  if (diferencaEmDiasCalendario(dataContratacao, candidata) < 30) {
    candidata = somarUmMes(candidata);
  }

  return candidata;
}

// dd/mm/aaaa — formato pedido em todas as telas desta tarefa. `padStart` em vez de
// `toLocaleDateString` pra não depender de locale do ambiente (Node do servidor de build,
// navegador do usuário) pra um formato que a spec já define exatamente.
export function formatarDataBR(data: Date): string {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${data.getFullYear()}`;
}

// Estado mockado de "tem assinatura BeneMed ativa" — sem backend real ainda, igual ao resto
// do fluxo. Setado em ConfirmacaoPage.tsx (pagamento confirmado) e lido tanto em
// AssinaturaPage.tsx (Minha assinatura) quanto no card "O2" do Para Você Agora
// (RecomendacoesContext.tsx), que deve sumir quando isso for true.
const ASSINATURA_ATIVA_KEY = "podeja_benemed_assinatura_ativa";

// ?assinaturaPlano=mensal|semestral|anual|familiar na URL (DESIGN ONLY) simula ter essa
// assinatura ativa sem precisar completar o fluxo de contratação de verdade — funciona sozinho
// (persiste, mesmo padrão de ?assinaturaCobranca=falhou/?assinaturaVigencia=proxima) e é lido
// direto por temAssinaturaBenemedAtiva() e getAssinaturaBenemedAtiva(), independente da ordem
// em que são chamadas (cada uma resolve o forçado por conta própria).
function planoForcadoViaUrl(): Plano | null {
  if (typeof window === "undefined") return null;
  const forcado = new URLSearchParams(window.location.search).get("assinaturaPlano");
  if (!forcado) return null;
  const plano = PLANOS.find((p) => p.id === forcado) ?? null;
  if (plano) window.localStorage.setItem(ASSINATURA_ATIVA_KEY, plano.id);
  return plano;
}

export function temAssinaturaBenemedAtiva(): boolean {
  if (typeof window === "undefined") return false;
  if (planoForcadoViaUrl()) return true;
  return window.localStorage.getItem(ASSINATURA_ATIVA_KEY) !== null;
}

export function getAssinaturaBenemedAtiva(): Plano | null {
  if (typeof window === "undefined") return null;
  const forcado = planoForcadoViaUrl();
  if (forcado) return forcado;
  const planoId = window.localStorage.getItem(ASSINATURA_ATIVA_KEY) as PlanoId | null;
  return PLANOS.find((p) => p.id === planoId) ?? null;
}

export function ativarAssinaturaBenemed(plano: Plano, diaCobranca?: DiaCobranca | null): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSINATURA_ATIVA_KEY, plano.id);
  if (diaCobranca) {
    window.localStorage.setItem(DIA_COBRANCA_ATIVO_KEY, String(diaCobranca));
  } else {
    window.localStorage.removeItem(DIA_COBRANCA_ATIVO_KEY);
  }
}

// Dia de cobrança escolhido em ConfirmarDadosPage.tsx (só existe pro plano Mensal) —
// persistido na ativação pra Minha Assinatura (AssinaturaPage.tsx) poder mostrar a data real
// da próxima cobrança, em vez de só o texto genérico "Cobrança mensal".
const DIA_COBRANCA_ATIVO_KEY = "podeja_benemed_dia_cobranca";

export function getDiaCobrancaAtivo(): DiaCobranca | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DIA_COBRANCA_ATIVO_KEY);
  const dia = Number(raw);
  return (DIAS_COBRANCA as readonly number[]).includes(dia) ? (dia as DiaCobranca) : null;
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

// Mock de "vigência perto de vencer" pro card de aviso de renovação manual dos planos
// Semestral/Anual (ver card "P6" em RecomendacoesContext.tsx) — ainda não existe data real de
// vigência vinda da BeneMed. Essa função só guarda o toggle; o bypass "funciona sozinho" (sem
// precisar de uma assinatura Semestral/Anual real) fica em RecomendacoesContext.tsx, igual ao
// ?assinaturaCobranca=falhou do P5. Formas de ligar/desligar pra testar:
//   1) ?assinaturaVigencia=proxima na URL (DESIGN ONLY) — liga, mostra o P6 direto e persiste.
//   2) ?assinaturaVigencia=em_dia na URL — desliga e persiste.
//   3) window.localStorage.setItem("podeja_benemed_vigencia_proxima", "true") no console —
//      nesse caso só conta se já existir uma assinatura Semestral/Anual ativa.
const VIGENCIA_PROXIMA_KEY = "podeja_benemed_vigencia_proxima";

export function vigenciaBenemedProximaDoFim(): boolean {
  if (typeof window === "undefined") return false;
  const forcado = new URLSearchParams(window.location.search).get("assinaturaVigencia");
  if (forcado === "proxima") {
    window.localStorage.setItem(VIGENCIA_PROXIMA_KEY, "true");
    return true;
  }
  if (forcado === "em_dia") {
    window.localStorage.removeItem(VIGENCIA_PROXIMA_KEY);
    return false;
  }
  return window.localStorage.getItem(VIGENCIA_PROXIMA_KEY) === "true";
}

// Motivos de cancelamento — etapa intermediária antes de confirmar (ver
// CancelarMotivoPage.tsx). Lista simples e fixa, sem vir de API.
export type MotivoCancelamentoId = "preco" | "nao_uso" | "nao_atendeu" | "outro";

export const MOTIVOS_CANCELAMENTO: { id: MotivoCancelamentoId; label: string }[] = [
  { id: "preco", label: "Preço" },
  { id: "nao_uso", label: "Não uso" },
  { id: "nao_atendeu", label: "Não atendeu minhas expectativas" },
  { id: "outro", label: "Outro motivo" },
];

// Registro do aceite do contrato (Prompt 1g, 22/10) — "versao"/"hash" vêm de
// contratoBenemedConteudo.ts, "aceitoEm" é o momento em que a caixa foi marcada em
// ConfirmarDadosPage.tsx. Não existe hoje, em nenhum fluxo do app, um caminho real de envio de
// consentimento pro backend — o mais próximo é o comentário em
// src/pages/consignado-clt/ProvedoresPage.tsx:222 ("TODO: POST /consentimentos..."), que nunca
// chegou a ser implementado. Esta função segue a mesma convenção: fica como um ponto único e
// óbvio pro backend entrar depois, sem espalhar a chamada pelas telas.
export type AceiteContrato = { versao: string; hash: string; aceitoEm: string };

export function registrarAceiteContrato(aceite: AceiteContrato): void {
  // TODO: POST /contratos/aceites { usuario_id, versao, hash, aceito_em, ip, dispositivo } —
  // prova de aceite para auditoria/jurídico. IP e dispositivo não dá pra capturar aqui (só o
  // backend vê o IP de origem; "dispositivo" precisaria de um user-agent/device-id que este
  // protótipo não coleta hoje) — ver lista de pendências na entrega do Prompt 1g.
  console.log("[aceite de contrato]", aceite);
}
