import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOTIVOS_CANCELAMENTO, PLANOS, type MotivoCancelamentoId, type Plano } from "./shared";

// Rota: /assistencias/saude/cancelar/motivo — primeira etapa do cancelamento, antes direto pro
// chat de suporte (ver AssinaturaPage.tsx). Escolha única, mesmo padrão visual de lista
// selecionável já usado em SaudePage.tsx (seleção de plano). Motivo segue pra etapa de
// retenção (CancelarRetencaoPage.tsx), não cancela nada ainda.
export default function AssistenciasCancelarMotivoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const [motivoSelecionado, setMotivoSelecionado] = useState<MotivoCancelamentoId | null>(null);

  const avancar = () => {
    if (!motivoSelecionado) return;
    navigate("/assistencias/saude/cancelar/retencao", { state: { plano, motivo: motivoSelecionado } });
  };

  return (
    <SubPageLayout title="Cancelar assinatura" hideNav>
      <div className="space-y-5 pb-28">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <XCircle size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Por que você quer cancelar?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Isso nos ajuda a melhorar a Saúde por Assinatura.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {MOTIVOS_CANCELAMENTO.map((motivo) => {
            const selecionado = motivoSelecionado === motivo.id;
            return (
              <button
                key={motivo.id}
                type="button"
                onClick={() => setMotivoSelecionado(motivo.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors",
                  selecionado ? "border-[#FD5F31] bg-[#FFF3EE]" : "border-border bg-white hover:border-[#FD5F31]/40",
                )}
              >
                <span className="text-sm font-medium text-foreground">{motivo.label}</span>
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                    selecionado ? "border-[#FD5F31] bg-[#FD5F31] text-white" : "border-border bg-white text-transparent",
                  )}
                >
                  <CheckCircle size={16} weight="fill" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <Button
          className="h-14 w-full rounded-full"
          disabled={!motivoSelecionado}
          onClick={avancar}
        >
          Continuar
        </Button>
      </div>
    </SubPageLayout>
  );
}
