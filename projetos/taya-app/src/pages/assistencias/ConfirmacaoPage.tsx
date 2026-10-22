import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { AppStoreBadges } from "@/components/AppStoreBadges";
import { Button } from "@/components/ui/button";
import { ativarAssinaturaBenemed, cobrancaBenemedFalhou, formatarDataBR, PLANOS, resolverCobrancaBenemed, temAssinaturaBenemedAtiva, type DiaCobranca, type Plano } from "./shared";
import { ReferralCard } from "@/pages/referral/ReferralCard";
import { useMensalidades } from "@/pages/saude/useMensalidades";

// Rota: /assistencias/saude/confirmacao — tela final tanto da primeira contratação quanto da
// regularização de cobrança (ver PagamentoPage.tsx). O modo é capturado uma vez, no mount —
// a própria ação desta tela (ativar ou resolver) muda o estado mockado que o determina, então
// recalcular a cada render trocaria o texto no meio da tela pro usuário.
export default function AssistenciasConfirmacaoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const diaCobranca = (location.state as { diaCobranca?: DiaCobranca | null } | null)?.diaCobranca ?? null;
  const [modoRegularizacao] = useState(() => temAssinaturaBenemedAtiva() && cobrancaBenemedFalhou());
  // Seção 4 do Prompt 1f — só na primeira contratação dos planos mensais, nunca em
  // regularização nem em Semestral/Anual (sem dia de cobrança escolhido).
  const mostraVencimento = !modoRegularizacao && (plano.id === "mensal" || plano.id === "familiar");
  const { proximoVencimento } = useMensalidades(diaCobranca);

  useEffect(() => {
    if (modoRegularizacao) {
      resolverCobrancaBenemed();
    } else {
      // Marca a assinatura como ativa (mock, sem backend) — é o que faz o card "O2" do Para
      // Você Agora sumir e a tela "Minha assinatura" ter o que mostrar. diaCobranca só existe
      // pro plano Mensal (ver DIAS_COBRANCA em shared.ts) — persistido pra "Minha assinatura"
      // poder mostrar a data real da próxima cobrança.
      ativarAssinaturaBenemed(plano, diaCobranca);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SubPageLayout title={modoRegularizacao ? "Cobrança regularizada" : "Assinatura confirmada"} hideNav>
      <div className="flex flex-col items-center gap-5 pb-6 pt-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={40} className="text-green-600" weight="fill" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Pagamento confirmado!</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {modoRegularizacao
              ? "Sua mensalidade da Saúde por Assinatura foi regularizada. Sua assinatura continua ativa normalmente."
              : `Seu plano ${plano.nome} da Saúde por Assinatura foi contratado com sucesso.`}
          </p>
        </div>

        {modoRegularizacao ? (
          <div className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm">
            <p className="text-sm font-semibold text-foreground">Cobrança em dia</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Sua próxima cobrança segue a data habitual do seu plano, sem nenhuma outra ação
              necessária.
            </p>
          </div>
        ) : (
          <>
            <div className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm">
              <p className="text-sm font-semibold text-foreground">Ativação em até 48 horas úteis</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Seu plano fica disponível para uso assim que a ativação for concluída pela BeneMed.
              </p>
              {mostraVencimento && (
                <p className="mt-2 text-xs font-medium text-foreground">
                  Próxima mensalidade: {formatarDataBR(proximoVencimento)}
                </p>
              )}
            </div>

            <div className="w-full rounded-2xl bg-[#FFF3EE] p-4 text-left">
              <p className="text-sm font-semibold text-[#D94E28]">Baixe o app para usar seu plano</p>
              <p className="mt-1 text-xs leading-relaxed text-[#D94E28]">
                É por lá que você agenda consultas, exames e acompanha tudo do seu plano. As
                informações de acesso chegam em breve.
              </p>
              <div className="mt-3">
                <AppStoreBadges />
              </div>
            </div>

            {/* IG-06 — Prompt 1d (22/10): era o ReferralBanner (layout próprio, dispensável),
                agora é o mesmo componente IG-01 usado em todo lugar. Continua só na primeira
                contratação confirmada. origin="banner_pos_contratacao" mantém os eventos
                trackReferralBannerViewed/Clicked que o banner antigo já disparava aqui. */}
            <ReferralCard origin="banner_pos_contratacao" />
          </>
        )}

        <div className="mt-2 w-full space-y-2">
          <Button
            className="h-14 w-full rounded-full"
            onClick={() => navigate("/assistencias/saude/assinatura", { state: { plano } })}
          >
            Ver minha assinatura
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-full"
            onClick={() => navigate("/painel")}
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    </SubPageLayout>
  );
}
