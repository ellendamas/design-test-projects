import { useSearchParams } from "react-router-dom";
import { calcularProximoVencimento, DIAS_COBRANCA, parseDataISOLocal, type DiaCobranca } from "@/pages/assistencias/shared";

const DIA_COBRANCA_PADRAO: DiaCobranca = 15;
const MENSALIDADES_PAGAS_PADRAO = 1;

export type Mensalidades = {
  diaCobranca: DiaCobranca;
  contratadoEm: Date;
  proximoVencimento: Date;
  mensalidadesPagas: number;
};

// "Hoje" simulável por ?dataHoje=AAAA-MM-DD (DESIGN ONLY, Prompt 1f) — único jeito de testar a
// regra dos 30 dias (calcularProximoVencimento em assistencias/shared.ts) sem esperar o
// calendário real virar. Exportada à parte porque telas que ainda não têm nenhuma mensalidade
// paga (ex: o preview em ConfirmarDadosPage.tsx, durante a própria contratação) precisam só do
// "hoje" simulado, não do agregado inteiro de useMensalidades.
export function obterDataHojeSimulada(searchParams: URLSearchParams): Date {
  const forcada = searchParams.get("dataHoje");
  return forcada ? parseDataISOLocal(forcada) : new Date();
}

// Prompt 1f (22/10) — ponto único de dado pra dia de cobrança, próximo vencimento e
// mensalidades pagas: protótipo, simulado inteiro por parâmetro de URL (ver seção 6 da spec).
// Em produção, troca pra ler de uma API de billing sem mexer em nenhuma tela que chama este
// hook — é exatamente pra isso que ele existe, um ponto único, não um por tela.
//
// `diaCobrancaConhecido` é o valor que a tela já sabe por fora da URL (o dia escolhido nesta
// sessão de compra, vindo de location.state, ou o dia realmente ativo em
// getDiaCobrancaAtivo()) — usado como fallback quando ?diaCobranca= não está na URL. A URL
// sempre vence quando presente, mesmo padrão de override DESIGN ONLY do resto do app (ver
// estadoAssinaturaDesignOnly.ts).
//
// Regra da data (seção 5 da spec): a 1ª mensalidade é paga na contratação; o vencimento da 2ª é
// calcularProximoVencimento(contratadoEm, diaCobranca). A cada mensalidade paga além da
// primeira, a data avança mais um mês — por isso o `+ (mensalidadesPagas - 1)` abaixo.
export function useMensalidades(diaCobrancaConhecido?: DiaCobranca | null): Mensalidades {
  const [searchParams] = useSearchParams();

  const diaCobrancaForcado = Number(searchParams.get("diaCobranca"));
  const diaCobranca = (DIAS_COBRANCA as readonly number[]).includes(diaCobrancaForcado)
    ? (diaCobrancaForcado as DiaCobranca)
    : diaCobrancaConhecido ?? DIA_COBRANCA_PADRAO;

  const dataHoje = obterDataHojeSimulada(searchParams);
  const contratadoEmForcado = searchParams.get("contratadoEm");
  const contratadoEm = contratadoEmForcado ? parseDataISOLocal(contratadoEmForcado) : dataHoje;

  const mensalidadesPagasForcado = Number(searchParams.get("mensalidadesPagas"));
  const mensalidadesPagas =
    Number.isInteger(mensalidadesPagasForcado) && mensalidadesPagasForcado > 0
      ? mensalidadesPagasForcado
      : MENSALIDADES_PAGAS_PADRAO;

  const primeiroVencimento = calcularProximoVencimento(contratadoEm, diaCobranca);
  const proximoVencimento = new Date(
    primeiroVencimento.getFullYear(),
    primeiroVencimento.getMonth() + (mensalidadesPagas - 1),
    primeiroVencimento.getDate(),
  );

  return { diaCobranca, contratadoEm, proximoVencimento, mensalidadesPagas };
}
