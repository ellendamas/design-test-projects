import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { SubPageLayout } from "@/App";
import { cn } from "@/lib/utils";
import { PLANOS_CONTEUDO } from "@/data/saudeConteudo";
import { PLANOS, planosExibidos, proximaEtapaAposVerificacao, type Plano, type PlanoId } from "@/pages/assistencias/shared";
import { trackStep } from "@/utils/analytics";
import { ASSINATURA_ATIVA_SO_POR_PARAMETRO, estadoAssinaturaViaParametro, planoAtivoViaParametro } from "./estadoAssinaturaDesignOnly";
import { AVISO_SAUDE_POR_ESTADO, type AcaoEstadoAssinatura } from "./estadosAssinaturaConteudo";
import { AvisoAssinaturaAtiva } from "./secoes/AvisoAssinaturaAtiva";

const PRAZOS_INDIVIDUAL: PlanoId[] = ["mensal", "semestral", "anual"];

// Rota: /assistencias/saude/planos — v3 (21/10): volta a mostrar Semestral e Anual, agora como
// um seletor de prazo dentro do card Individual (mesmo padrão de linha da antiga SaudePage.tsx:
// círculo de seleção, nome e subtítulo à esquerda, preço à direita), em vez dos 2 planos soltos
// da v2. O card Familiar volta a ter o tratamento em degradê da tela antiga (git show
// HEAD:./src/pages/assistencias/SaudePage.tsx) — os dois pesavam igual na v2, decisão revertida
// aqui a pedido de Ellen. Os dois chips de cobrança/cancelamento e a nota "Bom saber" saíram da
// tela: a informação de cancelamento já está na dúvida "Posso cancelar?", a natureza do produto
// na dúvida "É plano de saúde?" e no rodapé legal, e Pix/cartão no passo "Pague e use" do "Como
// funciona" — conferido antes de remover (nenhum dos três perdeu lugar na jornada).
export default function SaudePlanosPage() {
  const navigate = useNavigate();
  const [prazoSelecionado, setPrazoSelecionado] = useState<PlanoId>("mensal");
  const assinaturaAtiva = ASSINATURA_ATIVA_SO_POR_PARAMETRO ? planoAtivoViaParametro() !== null : false;
  const estado = assinaturaAtiva ? estadoAssinaturaViaParametro() ?? "ativo" : null;
  // "cancelado" é o único estado em que esta tela volta a mostrar os cards (com o aviso e os
  // botões desativados abaixo) — todo o resto (inclusive sem assinatura nenhuma) segue cada um
  // pro seu próprio caminho: sem estado, cards normais; com qualquer outro estado, aviso no
  // lugar dos cards, igual já era pra "ativo" antes deste prompt.
  const avisoEstado = estado && estado !== "cancelado" ? AVISO_SAUDE_POR_ESTADO[estado] : null;

  const irParaPagamentoPix = () => navigate("/assistencias/saude/pagamento", { state: { plano: planoAtivoViaParametro() ?? undefined } });
  const executarAcaoEstado = (acao: AcaoEstadoAssinatura) => {
    if (acao === "pagar_pix" || acao === "regularizar") irParaPagamentoPix();
    else navigate("/contratos");
  };

  const handleContratar = (planoId: PlanoId) => {
    if (estado === "cancelado") return;
    trackStep("saude_plano_selecionado", { plano_id: planoId });
    const plano = planosExibidos().find((p) => p.id === planoId);
    if (!plano) return;
    navigate(proximaEtapaAposVerificacao(), { state: { plano } });
  };

  if (avisoEstado) {
    return (
      <SubPageLayout title="Planos">
        <div className="pb-6">
          <AvisoAssinaturaAtiva
            titulo={avisoEstado.titulo}
            texto={avisoEstado.texto}
            botaoLabel={avisoEstado.botao.label}
            onBotao={() => executarAcaoEstado(avisoEstado.botao.acao)}
          />
        </div>
      </SubPageLayout>
    );
  }

  const planoIndividualAtual = PLANOS.find((p) => p.id === prazoSelecionado) as Plano;
  const planoFamiliar = PLANOS.find((p) => p.id === "familiar") as Plano;
  const conteudoIndividual = PLANOS_CONTEUDO.mensal;
  const conteudoFamiliar = PLANOS_CONTEUDO.familiar;
  // Único jeito de chegar aqui com os cards visíveis E uma assinatura: "cancelado" (ver
  // avisoEstado acima — todo o resto já retornou o aviso antes de chegar neste ponto).
  const cancelado = estado === "cancelado";

  return (
    <SubPageLayout title="Planos">
      <div className="space-y-4 pb-6">
        {cancelado && (
          <div className="rounded-2xl border border-border bg-[#FFF3EE] p-4 text-center text-sm font-medium text-foreground">
            Você pode contratar de novo depois de 3 meses do cancelamento.
          </div>
        )}
        {/* Card Individual — preço do topo muda com o prazo escolhido no seletor abaixo da lista
            de benefícios. Um único botão "Contratar Individual" usa o prazo selecionado. */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FD5F31]">{conteudoIndividual.etiqueta}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {planoIndividualAtual.precoMes}
            <span className="text-sm font-medium text-muted-foreground"> por mês</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{conteudoIndividual.paraQuem}</p>

          <ul className="mt-3 space-y-2">
            {conteudoIndividual.itens.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#1A7A4C]" weight="fill" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {PRAZOS_INDIVIDUAL.map((id) => {
              const plano = PLANOS.find((p) => p.id === id) as Plano;
              const selecionado = prazoSelecionado === id;
              return (
                <button key={id} type="button" onClick={() => setPrazoSelecionado(id)} className="w-full text-left">
                  <div
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors",
                      selecionado ? "border-[#FD5F31] bg-[#FFF3EE]" : "border-border bg-white hover:border-[#FD5F31]/40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                          selecionado ? "border-[#FD5F31] bg-[#FD5F31] text-white" : "border-border bg-white text-transparent",
                        )}
                      >
                        <CheckCircle size={16} weight="fill" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{plano.nome}</p>
                          {plano.destaque && (
                            <span className="rounded-full bg-[#FD5F31] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              {plano.destaque}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{plano.cobranca}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-foreground">{plano.precoMes}</p>
                      <p className="text-[11px] text-muted-foreground">por mês</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleContratar(prazoSelecionado)}
            disabled={cancelado}
            className="mt-4 h-12 w-full rounded-full bg-[#FD5F31] text-sm font-semibold text-white disabled:opacity-50"
          >
            {conteudoIndividual.cta}
          </button>
        </div>

        {/* Card Familiar — mesmo tratamento em degradê da antiga SaudePage.tsx: fundo na cor da
            marca, texto branco, tag de destaque, preço grande. Botão "claro" (branco, texto na
            cor da marca) pra contrastar com o fundo, diferente do botão laranja do Individual. */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#FD5F31] to-[#D94E28] p-5 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{conteudoFamiliar.etiqueta}</p>
            {planoFamiliar.destaque && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                {planoFamiliar.destaque}
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold">
            {planoFamiliar.precoMes}
            <span className="text-sm font-medium text-white/80"> por mês</span>
          </p>
          <p className="mt-1 text-sm font-semibold">{conteudoFamiliar.paraQuem}</p>

          <ul className="mt-3 space-y-2">
            {conteudoFamiliar.itens.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-white/90">
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-white" weight="fill" />
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => handleContratar("familiar")}
            disabled={cancelado}
            className="mt-4 h-12 w-full rounded-full bg-white text-sm font-semibold text-[#FD5F31] disabled:opacity-50"
          >
            {conteudoFamiliar.cta}
          </button>
        </div>
      </div>
    </SubPageLayout>
  );
}
