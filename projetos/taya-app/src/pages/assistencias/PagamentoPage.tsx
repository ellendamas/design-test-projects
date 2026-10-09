import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Clock, Copy, QrCode } from "@phosphor-icons/react";
import { toast } from "sonner";
import { SubPageLayout } from "@/App";
import { PLANOS, type Plano } from "./shared";

// Rota: /assistencias/saude/pagamento — Pix mockado (QR + copia e cola), sem chamada real de
// API ainda. O payload do QR e o código copia-e-cola abaixo são só texto de exemplo.
//
// Sem webhook real de confirmação: copiar o código Pix dispara a simulação do pagamento
// confirmado 10s depois (DESIGN ONLY), em vez de um botão manual de "simular pagamento".
const PIX_COPIA_COLA =
  "00020126580014BR.GOV.BCB.PIX0136benemed-podeja-mock@exemplo.com.br5204000053039865406" +
  "0000.005802BR5913Pode Ja Pagto6009SAO PAULO62070503***6304ABCD";

export default function AssistenciasPagamentoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const [copiado, setCopiado] = useState(false);
  const [qrFalhou, setQrFalhou] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  useEffect(() => {
    if (!aguardandoConfirmacao) return;
    const t = window.setTimeout(() => {
      navigate("/assistencias/saude/confirmacao", { state: { plano }, replace: true });
    }, 10000);
    return () => window.clearTimeout(t);
  }, [aguardandoConfirmacao, navigate, plano]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(PIX_COPIA_COLA);
    } catch {
      // ambiente sem permissão de clipboard — segue sem quebrar a tela
    }
    setCopiado(true);
    setAguardandoConfirmacao(true);
    toast.success("Código Pix copiado!");
    window.setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <SubPageLayout title="Pagamento" hideNav>
      <div className="space-y-5 pb-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <QrCode size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Pague com Pix para ativar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plano {plano.nome} · {plano.cobranca}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
          {!qrFalhou ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(PIX_COPIA_COLA)}`}
              alt="QR Code Pix"
              className="h-[220px] w-[220px] rounded-xl"
              onError={() => setQrFalhou(true)}
            />
          ) : (
            <div className="flex h-[220px] w-[220px] flex-col items-center justify-center gap-2 rounded-xl bg-[#F3F4F6]">
              <QrCode size={48} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">QR Code indisponível</p>
            </div>
          )}
          <p className="text-2xl font-bold text-[#FD5F31]">{plano.precoMes}</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold text-foreground">Pix copia e cola</p>
          <div className="flex items-center gap-2 rounded-xl bg-[#F3F4F6] p-3">
            <p className="flex-1 truncate font-mono text-xs text-muted-foreground">{PIX_COPIA_COLA}</p>
          </div>
          <button
            type="button"
            onClick={copiar}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#FD5F31] text-sm font-semibold text-[#FD5F31]"
          >
            {copiado ? <Check size={16} /> : <Copy size={16} />}
            {copiado ? "Copiado" : "Copiar código"}
          </button>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-[#F3F4F6] p-3">
          <Clock size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Esse código expira em 30 minutos. Após o pagamento, a confirmação pode levar alguns
            instantes.
          </p>
        </div>

        {aguardandoConfirmacao && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#FD5F31] border-t-transparent" />
            <p className="text-sm font-medium text-foreground">Aguardando confirmação do pagamento...</p>
          </div>
        )}
      </div>
    </SubPageLayout>
  );
}
