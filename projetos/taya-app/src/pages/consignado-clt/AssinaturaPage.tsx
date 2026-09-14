import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { SubPageLayout } from "@/App";
import UnicoNotice from "@/components/UnicoNotice";
import UnicoAguardando from "@/components/UnicoAguardando";
import { ErrorScreen, type ErrorCategoria } from "@/components/ErrorScreen";

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // DESIGN ONLY — ?erro=simulacao_invalida → tela de erro fullscreen, simulação expirada ou
  // fluxo acessado fora de ordem (mesmo padrão usado na assinatura do Crédito Pessoal)
  const erroParam = searchParams.get("erro") as ErrorCategoria | null; // DESIGN ONLY

  // DESIGN ONLY — ?status=aguardando pula direto para o estado de retorno (mesmo padrão do CP)
  const statusParam = searchParams.get("status"); // DESIGN ONLY
  const etapa: "aviso" | "aguardando" = statusParam === "aguardando" ? "aguardando" : "aviso"; // DESIGN ONLY

  const {
    valor = 10000,
    prazo = 36,
    taxaMensal = 3.48,
    ...restState
  } = (location.state as Record<string, unknown> & {
    valor?: number;
    prazo?: number;
    taxaMensal?: number;
  }) ?? {};

  // Ao clicar em "Continuar para verificação" (aviso) ou "Reabrir verificação" (aguardando) —
  // abre a tela de redirecionamento para a Unico (verificação acontece fora do app)
  const handleIniciarVerificacao = () => {
    // TODO: integrar SDK Unico para biometria facial real
    navigate("/consignado-clt/redirecionando/unico", {
      state: { ...location.state, valor, prazo, taxaMensal, ...restState },
    });
  };

  const handleCancelar = () => {
    // TODO: conectar ao DELETE /propostas/{id} quando API disponível
    navigate("/consignado-clt");
  };

  if (erroParam === "simulacao_invalida") {
    return (
      <SubPageLayout title="Verificação de identidade" hideNav>
        <ErrorScreen
          categoria="simulacao_invalida"
          labelBotao="Voltar à simulação"
          onTentarNovamente={() => navigate("/consignado-clt/simular")}
        />
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Verificação de identidade" hideNav>
      {etapa === "aviso" ? (
        <UnicoNotice
          titulo="Falta só confirmar sua identidade!"
          descricao="Sua proposta de Crédito Consignado CLT foi aprovada. Você será direcionado para verificar sua identidade na plataforma segura da Unico."
          labelBotao="Continuar para verificação"
          onContinuar={handleIniciarVerificacao}
        />
      ) : (
        <UnicoAguardando
          titulo="Aguardando sua verificação"
          descricao="Você saiu antes de concluir a verificação de identidade. Toque em Reabrir verificação para continuar de onde parou."
          labelBotao="Reabrir verificação"
          onAssinar={handleIniciarVerificacao}
          onCancelar={handleCancelar}
        />
      )}
    </SubPageLayout>
  );
}
