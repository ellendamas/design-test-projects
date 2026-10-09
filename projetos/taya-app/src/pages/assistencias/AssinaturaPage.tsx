import { useLocation } from "react-router-dom";
import { ShieldCheck } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { PLANOS, type Plano } from "./shared";

// Rota: /assistencias/saude/assinatura — "Meu plano" da assinatura BeneMed, mesmo padrão
// visual das telas de contrato existentes (ver ContratoSeguroPage em App.tsx: selo de status +
// grid de dados principais). O botão de cancelar NÃO chama nenhum endpoint de cancelamento
// ainda — só direciona pro chat de suporte, igual ao padrão já usado em
// minha-conta/VerificarContato.tsx (handleIniciarChatSuporte).
export default function AssistenciasAssinaturaPage() {
  const location = useLocation();
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const { abrirChat, enviarMensagemContexto } = useChat();

  const handleCancelar = () => {
    abrirChat();
    enviarMensagemContexto(
      "[SISTEMA] Usuário solicitou cancelamento da assinatura de Assistência Saúde (BeneMed). Encaminhar para suporte humano."
    );
  };

  return (
    <SubPageLayout title="Minha assinatura">
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-green-700">Ativo</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Assistência Saúde · BeneMed</h2>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Plano</p>
          <p className="text-sm font-semibold text-foreground">{plano.nome}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Valor</p>
          <p className="text-sm font-semibold text-foreground">{plano.precoMes} / mês</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Cobrança</p>
          <p className="text-sm font-semibold leading-snug text-foreground">{plano.cobranca}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Parceiro</p>
          <p className="text-sm font-semibold text-foreground">BeneMed</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#FD5F31]" />
          <h3 className="text-base font-bold text-foreground">Sobre o plano</h3>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          A BeneMed Cuidado não é um plano de saúde e não cobre atendimentos de urgência ou
          emergência. Consultas e exames presenciais são pagos à parte, com desconto.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Cancelar assinatura</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          O cancelamento é feito junto ao nosso time de atendimento.
        </p>
        <Button variant="outline" className="mt-3 h-11 w-full rounded-full" onClick={handleCancelar}>
          Falar com o suporte
        </Button>
      </div>
    </SubPageLayout>
  );
}
