import { useLocation, useNavigate } from "react-router-dom";
import { Bell, CaretRight, CheckCircle, ShieldCheck } from "@phosphor-icons/react";
import { toast } from "sonner";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInteresse } from "@/context/InteresseContext";
import { getAssinaturaBenemedAtiva, getDiaCobrancaAtivo, PLANOS, type Plano } from "./shared";

// Rota: /assistencias/saude/assinatura — "Meu plano" da assinatura BeneMed, mesmo padrão
// visual das telas de contrato existentes (ver ContratoSeguroPage em App.tsx: selo de status +
// grid de dados principais). "Trocar dia de cobrança" e "Cancelar assinatura" ficam agrupados
// num único menu de lista, mesmo padrão visual dos grupos de Minha Conta (AccountScreen em
// App.tsx: Card + CardContent p-0 + linhas com border-b/last:border-0), em vez de botões soltos.
// "Cancelar assinatura" passa por uma etapa de motivo + retenção antes de chegar no suporte
// (ver CancelarMotivoPage.tsx/CancelarRetencaoPage.tsx) — não direciona mais direto pro chat.
//
// Prioriza o estado persistido (quem contratou de verdade e veio pela ConfirmacaoPage) sobre o
// location.state, pra funcionar também em acesso direto via URL/Contratos.
export default function AssistenciasAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plano = getAssinaturaBenemedAtiva() ?? (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const diaCobranca = getDiaCobrancaAtivo();
  const { interesses, registrarInteresse } = useInteresse();

  // Fake door — só existe pro plano Mensal, único com data de cobrança recorrente mês a mês
  // (ver DIAS_COBRANCA em shared.ts). Não troca nada de verdade, só registra interesse no mesmo
  // InteresseContext genérico usado em outros fake doors do app (ex: categorias "em breve" de
  // AssistenciasPage em App.tsx).
  const temDiaCobranca = plano.id === "mensal";
  const CHAVE_INTERESSE_TROCAR_DIA = "assistencias-saude-trocar-dia-cobranca";
  const jaSolicitouTrocaDia = interesses.includes(CHAVE_INTERESSE_TROCAR_DIA);

  const handleTrocarDiaCobranca = () => {
    if (jaSolicitouTrocaDia) return;
    registrarInteresse(CHAVE_INTERESSE_TROCAR_DIA);
    toast("Pedido registrado!", {
      duration: 5000,
      icon: <Bell size={16} className="text-[#FD5F31]" />,
      description: "Em breve você vai poder escolher um novo dia de cobrança direto por aqui.",
    });
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
        {temDiaCobranca && diaCobranca && (
          <div>
            <p className="text-xs text-muted-foreground">Próxima cobrança</p>
            <p className="text-sm font-semibold text-foreground">Dia {diaCobranca}</p>
          </div>
        )}
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

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          {temDiaCobranca && (
            <button
              type="button"
              onClick={handleTrocarDiaCobranca}
              disabled={jaSolicitouTrocaDia}
              className="w-full border-b border-border px-4 py-3.5 text-left text-sm text-foreground last:border-0 disabled:opacity-70"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {jaSolicitouTrocaDia && <CheckCircle size={16} className="text-green-600" weight="fill" />}
                  {jaSolicitouTrocaDia ? "Pedido de troca registrado" : "Trocar dia de cobrança"}
                </span>
                {!jaSolicitouTrocaDia && <CaretRight size={16} className="text-muted-foreground" />}
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/assistencias/saude/cancelar/motivo", { state: { plano } })}
            className="w-full border-b border-border px-4 py-3.5 text-left text-sm text-foreground last:border-0"
          >
            <div className="flex items-center justify-between">
              Cancelar assinatura
              <CaretRight size={16} className="text-muted-foreground" />
            </div>
          </button>
        </CardContent>
      </Card>
    </SubPageLayout>
  );
}
