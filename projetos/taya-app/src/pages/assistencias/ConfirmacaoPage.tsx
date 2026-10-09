import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { AppStoreBadges } from "@/components/AppStoreBadges";
import { Button } from "@/components/ui/button";
import { ativarAssinaturaBenemed, cobrancaBenemedFalhou, PLANOS, resolverCobrancaBenemed, temAssinaturaBenemedAtiva, type Plano } from "./shared";

// Rota: /assistencias/saude/confirmacao — tela final tanto da primeira contratação quanto da
// regularização de cobrança (ver PagamentoPage.tsx). O modo é capturado uma vez, no mount —
// a própria ação desta tela (ativar ou resolver) muda o estado mockado que o determina, então
// recalcular a cada render trocaria o texto no meio da tela pro usuário.
export default function AssistenciasConfirmacaoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const [modoRegularizacao] = useState(() => temAssinaturaBenemedAtiva() && cobrancaBenemedFalhou());

  useEffect(() => {
    if (modoRegularizacao) {
      resolverCobrancaBenemed();
    } else {
      // Marca a assinatura como ativa (mock, sem backend) — é o que faz o card "O2" do Para
      // Você Agora sumir e a tela "Minha assinatura" ter o que mostrar.
      ativarAssinaturaBenemed(plano);
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
              ? "Sua mensalidade da BeneMed foi regularizada. Sua assinatura continua ativa normalmente."
              : `Sua assinatura do plano ${plano.nome} da BeneMed foi contratada com sucesso.`}
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
              <p className="text-sm font-semibold text-foreground">Ativação em até 48 horas</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Seu plano fica disponível para uso assim que a ativação for concluída pela BeneMed.
              </p>
            </div>

            <div className="w-full rounded-2xl bg-[#FFF3EE] p-4 text-left">
              <p className="text-sm font-semibold text-[#D94E28]">Acesso ao app da BeneMed</p>
              <p className="mt-1 text-xs leading-relaxed text-[#D94E28]">
                Você receberá as informações de acesso em breve.
              </p>
            </div>

            <div className="w-full">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Baixe o app Pode Já para acompanhar sua assinatura</p>
              <AppStoreBadges />
            </div>
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
