// Jornada "Excluir conta" (Minha Conta > Segurança) — trabalho novo, não existe em produção
// nem no protótipo antes disto. Usa como referência o fluxo real de "suspender conta" (só esse
// existe em produção hoje), mas excluir é permanente: sem reativação, e com a regra extra de
// contrato ativo que a Ellen definiu (ver cada arquivo desta pasta).
import { permiteOverrideDesignOnly } from "@/config/referral";

// Lista real de produção (não inventada): mesmos 7 motivos que a suspensão de conta usa hoje
// (`GET /me/account/suspension/preview`, confirmado em
// taya-b2c-frontend/e2e/data/api/me/account/suspension/preview.api.json — a exclusão ainda não
// existe em produção, então reaproveitei o motivo real mais próximo que existe, igual já fizemos
// pra reaproveitar o resto do fluxo de suspensão). Slugs em inglês de propósito, iguais aos da
// API real.
export type MotivoExclusaoId = "not_using" | "better_offer" | "rates" | "app_issues" | "privacy" | "notifications" | "other";

export const MOTIVOS_EXCLUSAO: { id: MotivoExclusaoId; label: string }[] = [
  { id: "not_using", label: "Vou ficar um tempo sem usar" },
  { id: "better_offer", label: "Encontrei condições melhores em outro lugar" },
  { id: "rates", label: "As taxas e condições não me atenderam" },
  { id: "app_issues", label: "Tive problemas com o app ou o atendimento" },
  { id: "privacy", label: "Preocupação com meus dados" },
  { id: "notifications", label: "Recebo notificações demais" },
  { id: "other", label: "Outro motivo" },
];

// Único motivo com sinal claro de "pode voltar" — por isso é o único com o desvio pra suspensão
// (decisão da Ellen: oferecer a alternativa reversível só onde faz sentido de verdade, não em
// toda escolha). A Pode Já ainda não tem uma jornada de suspensão própria no protótipo, então o
// desvio é só texto informativo, sem link pra lugar nenhum.
export const MOTIVO_COM_DESVIO_SUSPENSAO: MotivoExclusaoId = "not_using";

// Ellen pediu pra deixar a ordem dos motivos embaralhada (mesmo padrão já usado em
// `categoriasEmBreve`, App.tsx: Fisher-Yates, uma vez por visita via useMemo no componente que
// chama esta função, não a cada render).
export function embaralharMotivos<T>(lista: readonly T[]): T[] {
  const embaralhado = [...lista];
  for (let i = embaralhado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
  }
  return embaralhado;
}

export const COMENTARIO_EXCLUSAO_MAX_LENGTH = 500;

// DESIGN ONLY — ?contratoAtivo=1|0 força os dois ramos da tela de impactos pra revisão. Os
// dados mock de Meus Contratos (CLT/FGTS/crédito pessoal) vêm sempre preenchidos neste
// protótipo, então sem um jeito de forçar "0" o ramo self-service (sem contrato) ficaria
// impossível de revisar. null = sem override, usa o sinal real (contratos mock + assinatura
// BeneMed). Atrás de permiteOverrideDesignOnly(), mesmo padrão já usado no resto do app.
export function contratoAtivoOverrideViaParametro(): boolean | null {
  if (typeof window === "undefined") return null;
  if (!permiteOverrideDesignOnly()) return null;
  const forcado = new URLSearchParams(window.location.search).get("contratoAtivo");
  if (forcado === "1") return true;
  if (forcado === "0") return false;
  return null;
}

// Formato só pra parecer um protocolo de verdade — sem relação com nenhum gerador real do
// backend. 8 caracteres, sem 0/O/1/I pra não confundir na leitura, prefixo fixo "EXC".
export function gerarProtocoloExclusao(): string {
  const alfabeto = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let codigo = "";
  for (let i = 0; i < 8; i++) {
    codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `EXC-${codigo}`;
}
