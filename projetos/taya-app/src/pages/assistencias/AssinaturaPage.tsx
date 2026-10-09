import { useLocation, useNavigate } from "react-router-dom";
import { CaretRight, ShieldCheck } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { getAssinaturaBenemedAtiva, PLANOS, type Plano } from "./shared";

// Rota: /assistencias/saude/assinatura — "Meu plano" da assinatura BeneMed, mesmo padrão
// visual das telas de contrato existentes (ver ContratoSeguroPage em App.tsx: selo de status +
// grid de dados principais). "Cancelar assinatura" é só um item de lista simples, no mesmo
// padrão dos botões de Minha Conta (AccountScreen em App.tsx) — NÃO chama nenhum endpoint de
// cancelamento ainda, só direciona pro chat de suporte, igual ao padrão já usado em
// minha-conta/VerificarContato.tsx (handleIniciarChatSuporte).
//
// Prioriza o estado persistido (quem contratou de verdade e veio pela ConfirmacaoPage) sobre o
// location.state, pra funcionar também em acesso direto via URL/Contratos.
export default function AssistenciasAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plano = getAssinaturaBenemedAtiva() ?? (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
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

      <Button
        className="mb-6 h-14 w-full rounded-full"
        onClick={() => navigate("/assistencias/saude/assinatura/benemed")}
      >
        Ir para BeneMed
      </Button>

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

      <button
        type="button"
        onClick={handleCancelar}
        className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-left text-sm text-foreground"
      >
        <div className="flex items-center justify-between">
          Cancelar assinatura
          <CaretRight size={16} className="text-muted-foreground" />
        </div>
      </button>
    </SubPageLayout>
  );
}
