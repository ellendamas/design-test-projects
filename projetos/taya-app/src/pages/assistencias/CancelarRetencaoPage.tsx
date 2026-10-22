import { useLocation, useNavigate } from "react-router-dom";
import { Heartbeat } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { MOTIVOS_CANCELAMENTO, PLANOS, type MotivoCancelamentoId, type Plano } from "./shared";

// Rota: /assistencias/saude/cancelar/retencao — segunda etapa do cancelamento (ver
// CancelarMotivoPage.tsx), antes de ir pro suporte. Mensagem de retenção é só reforço geral de
// valor — NÃO lista benefícios específicos (Funeral, AP, bem-estar etc.), isso ainda depende de
// confirmação interna (fora de escopo, ver AssinaturaPage.tsx/SaudePage.tsx).
// "Confirmar cancelamento" ainda não tem endpoint automático do lado da BeneMed — só encaminha
// pro chat de suporte, igual ao comportamento direto que existia antes dessa etapa intermediária.
export default function AssistenciasCancelarRetencaoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { plano?: Plano; motivo?: MotivoCancelamentoId } | null;
  const plano = state?.plano ?? PLANOS[0];
  const motivoLabel = MOTIVOS_CANCELAMENTO.find((m) => m.id === state?.motivo)?.label ?? "Não informado";
  const { abrirChat, enviarMensagemContexto } = useChat();

  const continuarAssinando = () => {
    navigate("/assistencias/saude/assinatura", { state: { plano } });
  };

  const confirmarCancelamento = () => {
    abrirChat();
    enviarMensagemContexto(
      `[SISTEMA] Usuário solicitou cancelamento da assinatura de Assistência Saúde (BeneMed), plano ${plano.nome}. Motivo informado: ${motivoLabel}. Encaminhar para suporte humano.`,
    );
    navigate("/assistencias/saude/assinatura", { state: { plano } });
  };

  return (
    <SubPageLayout title="Antes de cancelar" hideNav>
      <div className="flex flex-col items-center gap-5 pb-6 pt-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3EE]">
          <Heartbeat size={32} className="text-[#FD5F31]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Tem certeza que quer cancelar?</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sua assinatura {plano.nome} dá acesso a médico por vídeo e descontos em remédios,
            consultas e exames. O cancelamento vale na hora, e você usa o plano até o fim do
            período já pago. Não há devolução de valores, e só dá para contratar de novo depois
            de 3 meses. Para concluir, você fala com o atendimento da Pode Já.
          </p>
        </div>

        <div className="mt-2 w-full space-y-2">
          <Button className="h-14 w-full rounded-full" onClick={continuarAssinando}>
            Continuar assinando
          </Button>
          {/* Prompt 1e (22/10) — era um link sublinhado pequeno; vira botão secundário, mesmo
              componente/variante já usado em outras telas de duas ações (ex: ConfirmacaoPage.tsx,
              PixExpiradoPage.tsx), só com a altura igual à do botão principal aqui, como pedido. */}
          <Button variant="outline" className="h-14 w-full rounded-full" onClick={confirmarCancelamento}>
            Confirmar cancelamento
          </Button>
        </div>
      </div>
    </SubPageLayout>
  );
}
