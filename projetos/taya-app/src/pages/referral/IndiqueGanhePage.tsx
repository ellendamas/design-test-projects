import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Copy, Share, ShareNetwork, Stethoscope, Wallet, Info } from "@phosphor-icons/react";
import { toast } from "sonner";
import { SubPageLayout } from "@/App";
import { Card, CardContent } from "@/components/ui/card";
import { permiteOverrideDesignOnly } from "@/config/referral";
import {
  COMISSAO_FAMILIAR,
  COMISSAO_MENSAL,
  PLANO_FAMILIAR,
  PLANO_MENSAL,
  STATUS_LABEL,
  formatarBRL,
  getMinhasIndicacoes,
  getOrCreateReferralCode,
  linkDeIndicacao,
  totaisDeComissao,
  type ReferralOrigin,
} from "./shared";
import { ProgramRulesSheet } from "./ProgramRulesSheet";
import {
  trackReferralLinkCopied,
  trackReferralLinkGenerated,
  trackReferralLinkGenerationFailed,
  trackReferralLinkShareStarted,
  trackReferralRulesOpened,
  trackReferralScreenViewed,
} from "./trackReferral";

type LinkState = "loading" | "ready" | "error";

// Prompt 1e (22/10) — mensagem de compartilhamento volta a existir (tinha sido simplificada pra
// compartilhar só o link numa rodada anterior). Link sempre no fim da mensagem, como pedido.
const MENSAGEM_COMPARTILHAMENTO = (link: string) =>
  `Cuide de quem você ama com a Saúde por Assinatura da Pode Já: clínico geral por vídeo 24 horas e descontos em remédios, consultas, exames e dentista. A partir de R$ 39,90 por mês. ${link}`;

// Texto de cada passo exatamente como a spec (seção 5, IG-02), só dividido na primeira ":" pra
// destacar a palavra-chave igual ao card de referência de Assistências.
const COMO_FUNCIONA = [
  { titulo: "Compartilhe", texto: "envie seu link a quem você quer ajudar.", icone: <ShareNetwork size={32} className="text-[#FD5F31]" /> },
  { titulo: "A pessoa contrata", texto: "pela página da BeneMed na Pode Já.", icone: <Stethoscope size={32} className="text-[#FD5F31]" /> },
  { titulo: "Você recebe", texto: "depois do primeiro pagamento confirmado e do prazo de segurança.", icone: <Wallet size={32} className="text-[#FD5F31]" /> },
];

// IG-02 — "Indique e ganhe: BeneMed". Gera o código (idempotente) ao montar, simulando uma
// chamada de servidor com um pequeno atraso (estado "loading" do campo de link) antes de
// liberar a tela — ?referralLink=erro (DESIGN ONLY) força a falha na geração pra revisão.
export default function IndiqueGanhePage() {
  const location = useLocation();
  const origin = ((location.state as { origin?: ReferralOrigin } | null)?.origin ?? "conta") as ReferralOrigin;

  const [linkState, setLinkState] = useState<LinkState>("loading");
  const [codigo, setCodigo] = useState("");
  const [regrasAbertas, setRegrasAbertas] = useState(false);
  const codigoJaExistiaRef = useRef<boolean>(false);

  useEffect(() => {
    codigoJaExistiaRef.current = !!window.localStorage.getItem("podeja_referral_code");
    trackReferralScreenViewed(origin, codigoJaExistiaRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const forcarErro = permiteOverrideDesignOnly() && new URLSearchParams(window.location.search).get("referralLink") === "erro";
    const timer = window.setTimeout(() => {
      if (forcarErro) {
        setLinkState("error");
        trackReferralLinkGenerationFailed("server_error", 500);
        return;
      }
      const novoCodigo = getOrCreateReferralCode();
      setCodigo(novoCodigo);
      setLinkState("ready");
      trackReferralLinkGenerated(novoCodigo, !codigoJaExistiaRef.current);
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  const tentarDeNovo = () => {
    setLinkState("loading");
    window.setTimeout(() => {
      const novoCodigo = getOrCreateReferralCode();
      setCodigo(novoCodigo);
      setLinkState("ready");
      trackReferralLinkGenerated(novoCodigo, !codigoJaExistiaRef.current);
    }, 450);
  };

  const link = codigo ? linkDeIndicacao(codigo) : "";

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast("Link copiado");
      trackReferralLinkCopied(codigo);
    } catch {
      toast("Não foi possível copiar o link. Tente novamente.");
    }
  };

  // Compartilhamento genérico (Web Share API) — abre o seletor do sistema, com qualquer app
  // que a pessoa tiver instalado, não só WhatsApp. Sem Web Share (ex.: a maioria dos
  // navegadores de desktop), não faz sentido escolher um app específico no lugar dela: copia a
  // mensagem com o link pra colar onde quiser, e isso conta como "copiado" na taxonomia (não
  // existe canal "clipboard" na tabela de eventos da spec, só whatsapp/native_share).
  const compartilhar = async () => {
    const texto = MENSAGEM_COMPARTILHAMENTO(link);
    if (navigator.share) {
      try {
        await navigator.share({ text: texto });
        trackReferralLinkShareStarted(codigo, "native_share");
      } catch (erro) {
        // compartilhamento cancelado pela pessoa — sem mensagem de erro, por decisão da spec
        if ((erro as DOMException)?.name !== "AbortError") {
          toast("Não foi possível abrir o compartilhamento.");
        }
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(texto);
      toast("Mensagem copiada. Cole onde quiser compartilhar.");
      trackReferralLinkCopied(codigo);
    } catch {
      toast("Não foi possível copiar a mensagem. Tente novamente.");
    }
  };

  const indicacoes = getMinhasIndicacoes();
  const { aReceber, jaRecebido } = totaisDeComissao(indicacoes);

  return (
    <SubPageLayout title="Indique e ganhe" hideNav>
      <div className="space-y-5 pb-6">
        {/* Hero — substitui o antigo ReferralHeader + CommissionTable: "10%" em destaque, acima
            da dobra em 393x852. Sem o rótulo "Indique e ganhe" (já é o título da página, no
            header do SubPageLayout) e sem o link de regras (único acesso agora é pelo cabeçalho
            do "Como funciona", pra não duplicar entrada). Mesmo gradiente da marca usado nos
            banners do dashboard (from-[#FD5F31] to-[#FA9832]) — ReferralBanner.tsx reaproveita
            esse mesmo grafismo, em tamanho menor. */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#FD5F31] to-[#FA9832] p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-extrabold">
              10%
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-snug">Indique a Saúde por Assinatura e ganhe 10%</h1>
              <p className="mt-0.5 text-sm text-white/85">da primeira mensalidade de quem contratar pelo seu link.</p>
            </div>
          </div>
        </div>

        {/* Planos — mesmo tratamento visual nos dois cartões agora (cartão branco com borda,
            como o Individual já era): o gradiente que só o Familiar tinha antes dava a entender
            que ele estava "selecionado", mas nenhum dos dois é selecionável aqui (ao contrário
            da página de planos da BeneMed, de onde vinha aquele estilo). A diferença entre os
            dois fica só na etiqueta "Maior comissão" do Familiar, que paga mais em valor
            absoluto (ainda que a porcentagem seja a mesma pros dois). */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-sm font-semibold text-foreground">{PLANO_MENSAL.nome}</p>
            <p className="text-xs text-muted-foreground">Individual</p>
            <p className="mt-3 text-xl font-bold text-[#FD5F31]">{PLANO_MENSAL.precoMes}</p>
            <p className="text-[11px] text-muted-foreground">por mês</p>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-[11px] text-muted-foreground">Você recebe por venda</p>
              <p className="text-base font-bold text-foreground">{formatarBRL(COMISSAO_MENSAL)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground">{PLANO_FAMILIAR.nome}</p>
              <span className="rounded-full bg-[#FFF3EE] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#FD5F31]">
                Maior comissão
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Você + até 3 dependentes</p>
            <p className="mt-3 text-xl font-bold text-[#FD5F31]">{PLANO_FAMILIAR.precoMes}</p>
            <p className="text-[11px] text-muted-foreground">por mês</p>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-[11px] text-muted-foreground">Você recebe por venda</p>
              <p className="text-base font-bold text-foreground">{formatarBRL(COMISSAO_FAMILIAR)}</p>
            </div>
          </div>
        </div>

        {/* ReferralLinkBox + ShareButton — campo com o ícone de copiar (só o link) e um botão de
            compartilhar genérico (Web Share API, não mais um botão verde de WhatsApp) que leva a
            mensagem de MENSAGEM_COMPARTILHAMENTO, com o link no fim (Prompt 1e, 22/10). O botão
            secundário "Copiar link" continua fora (o campo já copia). */}
        {linkState === "loading" && (
          <div className="h-[96px] w-full animate-pulse rounded-2xl bg-[#ECEEF1]" aria-hidden="true" />
        )}

        {linkState === "error" && (
          <div className="rounded-2xl border border-border bg-white p-4 text-center">
            <p className="text-sm text-muted-foreground">Não conseguimos gerar seu link agora. Tente de novo.</p>
            <button
              type="button"
              onClick={tentarDeNovo}
              className="mt-3 h-11 rounded-full bg-[#FD5F31] px-5 text-sm font-semibold text-white"
            >
              Tentar de novo
            </button>
          </div>
        )}

        {linkState === "ready" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-[#FAFAF9] px-4 py-3.5">
              <input
                readOnly
                value={link}
                className="w-full min-w-0 truncate bg-transparent text-sm text-foreground outline-none"
                aria-label="Seu link de indicação"
              />
              <button
                type="button"
                onClick={copiarLink}
                aria-label="Copiar link"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#FD5F31]"
              >
                <Copy size={20} />
              </button>
            </div>

            <button
              type="button"
              onClick={compartilhar}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#FD5F31] text-sm font-semibold text-white"
            >
              <Share size={20} weight="bold" /> Compartilhar
            </button>
          </div>
        )}

        {/* HowItWorks — mesmo estilo do card "Como funciona" da introdução de Assistências
            (fundo bg-[#FFF3EE], ícones de 32px, título + texto separados por borda). O texto de
            cada passo continua exatamente o da spec; só dividi na primeira ":" pra destacar a
            palavra-chave em negrito sem reescrever a frase. */}
        <Card className="border-0 bg-[#FFF3EE] shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Como funciona</h3>
              <button
                type="button"
                onClick={() => {
                  trackReferralRulesOpened(origin);
                  setRegrasAbertas(true);
                }}
                className="min-h-[44px] text-xs font-semibold text-[#FD5F31] underline underline-offset-2"
              >
                Regras do programa
              </button>
            </div>
            <div className="space-y-3">
              {COMO_FUNCIONA.map((passo, idx, arr) => (
                <div
                  key={passo.titulo}
                  className={`flex gap-3 ${idx !== arr.length - 1 ? "border-b border-[#FD5F31]/15 pb-3" : ""}`}
                >
                  <div className="shrink-0">{passo.icone}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{passo.titulo}:</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{passo.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MyReferralsList */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Minhas indicações</p>
          </div>

          {indicacoes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">Você ainda não tem indicações. Compartilhe seu link para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 rounded-2xl border border-border bg-white p-3">
                  <p className="text-[11px] text-muted-foreground">A receber</p>
                  <p className="text-base font-bold text-foreground">{formatarBRL(aReceber)}</p>
                </div>
                <div className="flex-1 rounded-2xl border border-border bg-white p-3">
                  <p className="text-[11px] text-muted-foreground">Já recebido</p>
                  <p className="text-base font-bold text-foreground">{formatarBRL(jaRecebido)}</p>
                </div>
              </div>
              {/* Escondido a pedido da Ellen (22/10) até o Financeiro confirmar a regra de prazo
                  de pagamento da comissão — mantido no código, só não é exibido na tela.
                  <p className="text-xs text-muted-foreground">Como e quando você recebe: [A CONFIRMAR com o Financeiro]</p> */}

              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
                {indicacoes.map((indicacao) => (
                  <li key={indicacao.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {indicacao.planoId === "familiar" ? "Familiar" : "Mensal (Individual)"}
                      </p>
                      <p className="text-xs text-muted-foreground">{indicacao.data}</p>
                      {indicacao.status === "estornada" && (
                        <p className="mt-0.5 text-xs text-muted-foreground">Cancelamento ou reembolso da contratação</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-foreground">{formatarBRL(indicacao.valorComissao)}</p>
                      <span
                        className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          indicacao.status === "paga"
                            ? "bg-[#F0FDF4] text-[#16A34A]"
                            : indicacao.status === "confirmada"
                            ? "bg-[#FFF3EE] text-[#FD5F31]"
                            : indicacao.status === "estornada"
                            ? "bg-[#F5F5F4] text-muted-foreground"
                            : "bg-[#FEF9E7] text-[#B45309]"
                        }`}
                      >
                        {STATUS_LABEL[indicacao.status]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* LegalNote — só o aviso agora; o acesso às regras já está no hero e no cabeçalho do
            "Como funciona", então não repete o link aqui de novo */}
        <div className="flex items-start gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>A BeneMed é Saúde por Assinatura. Não é plano de saúde.</p>
        </div>
      </div>

      <ProgramRulesSheet aberto={regrasAbertas} onFechar={() => setRegrasAbertas(false)} />
    </SubPageLayout>
  );
}
