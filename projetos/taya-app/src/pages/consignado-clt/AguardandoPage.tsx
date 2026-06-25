import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Bell, BellRinging } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

export default function ConsignadoCLTAguardandoPage() {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleEnableNotifications = async () => {
    // TODO: integrar com solução de push (Firebase, OneSignal, etc.)
    setNotificationsEnabled(true);
  };

  return (
    <SubPageLayout title="Aguardando retorno" hideNav>
      <div className="space-y-4 pb-24">

        {/* Bloco — status da solicitação */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
              <Clock size={24} className="text-[#E8590A]" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Aguardando retorno
              </p>
              <h1 className="text-lg font-semibold leading-snug text-foreground">
                Sua solicitação está na fila
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A Carteira de Trabalho Digital está com muitas consultas agora. Assim que sua
                oferta estiver pronta, você recebe uma notificação.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco — estimativa de tempo */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock size={16} className="shrink-0 text-[#E8590A]" />
            <span className="text-sm">
              <span className="text-muted-foreground">Tempo estimado: </span>
              <span className="font-medium text-foreground">algumas horas</span>
            </span>
          </div>
        </div>

        {/* Bloco — ações */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            {notificationsEnabled ? (
              <button
                type="button"
                disabled
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-green-600 text-base font-semibold text-white"
              >
                <BellRinging size={20} />
                Notificações ativadas
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08]"
              >
                <Bell size={20} />
                Ativar notificações
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate("/painel")}
              className="flex h-11 w-full items-center justify-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Voltar para o início
            </button>
          </div>
        </div>

      </div>
    </SubPageLayout>
  );
}
