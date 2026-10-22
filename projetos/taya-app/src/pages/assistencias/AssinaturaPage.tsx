import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Bell, CaretRight, CheckCircle, ShieldCheck } from "@phosphor-icons/react";
import { toast } from "sonner";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInteresse } from "@/context/InteresseContext";
import { PARCEIRO_NOME } from "@/config/parceiro";
import { estadoAssinaturaViaParametro } from "@/pages/saude/estadoAssinaturaDesignOnly";
import { ESTADOS_COM_CANCELAR, MINHA_ASSINATURA_POR_ESTADO, CHIP_ESTADO_ASSINATURA, type AcaoEstadoAssinatura } from "@/pages/saude/estadosAssinaturaConteudo";
import { useMensalidades } from "@/pages/saude/useMensalidades";
import { formatarDataBR, getAssinaturaBenemedAtiva, getDiaCobrancaAtivo, PLANOS, type Plano } from "./shared";

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
// ?assinaturaPlano=mensal|semestral|anual|familiar na URL (DESIGN ONLY, ver shared.ts) simula
// ter essa assinatura ativa sem precisar completar o fluxo de contratação de verdade.
export default function AssistenciasAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const plano = getAssinaturaBenemedAtiva() ?? (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const diaCobranca = getDiaCobrancaAtivo();
  const { interesses, registrarInteresse } = useInteresse();
  // DESIGN ONLY (Prompt 1e, 22/10) — estado simulado por ?assinaturaEstado= na própria URL
  // desta tela, independente de ?assinaturaPlano= (esta tela sempre tem algum `plano` pra
  // mostrar, real ou PLANOS[0] como fallback). Sem o parâmetro, "ativo" é o padrão — mesmo
  // comportamento de hoje.
  const estado = estadoAssinaturaViaParametro() ?? "ativo";
  const chip = CHIP_ESTADO_ASSINATURA[estado];
  const { mensagem, botao } = MINHA_ASSINATURA_POR_ESTADO[estado];

  const irParaPagamentoPix = () => navigate("/assistencias/saude/pagamento", { state: { plano } });
  const executarAcaoBotao = (acao: AcaoEstadoAssinatura) => {
    if (acao === "pagar_pix" || acao === "regularizar") irParaPagamentoPix();
    else navigate("/assistencias/saude/assinatura/benemed");
  };

  // Fake door de "Trocar dia de cobrança" — existe pros planos Mensal e Familiar, os dois com
  // data de cobrança recorrente mês a mês (ver DIAS_COBRANCA em shared.ts). Não troca nada de
  // verdade, só registra interesse no mesmo InteresseContext genérico usado em outros fake
  // doors do app (ex: categorias "em breve" de AssistenciasPage em App.tsx).
  // ?trocaDiaCobranca=solicitado na URL (DESIGN ONLY) simula o estado "pedido já registrado"
  // sem precisar clicar — só pra pré-visualização, não persiste (basta tirar o parâmetro pra
  // voltar ao estado real).
  const temDiaCobranca = plano.id === "mensal" || plano.id === "familiar";

  // Seção 5 do Prompt 1f (22/10) — "Próxima mensalidade"/"Mensalidades pagas" (ou "Venceu em"
  // no atraso) só nos planos com dia de cobrança (Mensal/Familiar) e só nos estados em que faz
  // sentido mostrar uma cobrança futura/vencida: pendente, cancelamento e cancelado não têm
  // uma data de próxima mensalidade de verdade (sem cobrança agendada rodando).
  const { proximoVencimento, mensalidadesPagas } = useMensalidades(diaCobranca);
  const mostraDadosMensalidade = temDiaCobranca && (estado === "ativo" || estado === "ativacao" || estado === "atraso");
  const labelVencimento = estado === "atraso" ? "Venceu em" : "Próxima mensalidade";

  const CHAVE_INTERESSE_TROCAR_DIA = "assistencias-saude-trocar-dia-cobranca";
  const forcarTrocaSolicitada = searchParams.get("trocaDiaCobranca") === "solicitado"; // DESIGN ONLY
  const jaSolicitouTrocaDia = forcarTrocaSolicitada || interesses.includes(CHAVE_INTERESSE_TROCAR_DIA);

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
          <div className={`h-2 w-2 rounded-full ${chip.corPonto}`} />
          <span className={`text-sm font-medium ${chip.corTexto}`}>{chip.label}</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Saúde por Assinatura</h2>
      </div>

      {mensagem && (
        <div className="mb-5 rounded-2xl border border-border bg-[#FFF3EE] p-4">
          <p className="text-sm text-foreground">{mensagem}</p>
        </div>
      )}

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
          <p className="text-sm font-semibold text-foreground">{PARCEIRO_NOME}</p>
        </div>
        {mostraDadosMensalidade && (
          <>
            <div>
              <p className="text-xs text-muted-foreground">{labelVencimento}</p>
              <p className="text-sm font-semibold text-foreground">{formatarDataBR(proximoVencimento)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mensalidades pagas</p>
              <p className="text-sm font-semibold text-foreground">{mensalidadesPagas}</p>
            </div>
          </>
        )}
        {/* Semestral/Anual (seção 5): "Vence em" pediria a data real de vigência, que não
            existe no app hoje — vigenciaBenemedProximaDoFim() em shared.ts só guarda um
            booleano "perto de vencer ou não", sem data nenhuma por trás. Não inventei a data;
            registrado na entrega como pergunta em aberto. */}
      </div>

      {botao && (
        <Button
          className="mb-6 h-14 w-full rounded-full"
          onClick={() => executarAcaoBotao(botao.acao)}
        >
          {botao.label}
        </Button>
      )}

      <div className="mb-6 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#FD5F31]" />
          <h3 className="text-base font-bold text-foreground">Sobre o plano</h3>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Saúde por Assinatura não é plano de saúde e não cobre urgência nem emergência.
          Consultas e exames presenciais são pagos à parte, com valor reduzido.
        </p>
      </div>

      {(temDiaCobranca || ESTADOS_COM_CANCELAR.includes(estado)) && (
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
          {/* Prompt 1e (22/10) — "Cancelar assinatura" só faz sentido enquanto ainda existe algo
              rodando pra cancelar: "ativo" e "ativacao". Nos demais estados (pagamento pendente
              ou atrasado, cancelamento já pedido, ou já cancelado) a linha some. */}
          {ESTADOS_COM_CANCELAR.includes(estado) && (
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
          )}
        </CardContent>
      </Card>
      )}
    </SubPageLayout>
  );
}
