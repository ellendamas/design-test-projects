import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { HourglassMedium } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import UnicoNotice from "@/components/UnicoNotice";
import UnicoAguardando from "@/components/UnicoAguardando";
import { ErrorScreen, type ErrorCategoria } from "@/components/ErrorScreen";

// Label do CTA de erro varia por categoria — as demais caem no default "Voltar à oferta".
const LABEL_BOTAO_ERRO: Partial<Record<ErrorCategoria, string>> = {
  leilao_link_outro_cpf: "Sair da conta",
  leilao_link_usado: "Voltar ao início",
};

// Rota: /leilao/assinatura — jornada com conta. ?status=aguardando mostra o estado de
// retorno, ?status=preparando mostra o estado de espera antes do link da Unico chegar
// (DESIGN ONLY — sem polling real ainda); ?erro= mostra erro; ?assinarErro=1 mostra o alerta
// inline de falha ao iniciar assinatura (DESIGN ONLY). A jornada pública/guest tem sua própria
// tela apartada (AssinaturaPublicaPage.tsx, rota /leilao/oferta/assinatura).
export default function LeilaoAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const etapa: "aviso" | "preparando" | "aguardando" =
    statusParam === "aguardando" ? "aguardando" : statusParam === "preparando" ? "preparando" : "aviso";
  const erroParam = searchParams.get("erro") as ErrorCategoria | null; // DESIGN ONLY
  const alertaAssinar = searchParams.get("assinarErro") === "1"; // DESIGN ONLY

  // Ao clicar em "Continuar para verificação" (aviso) ou "Reabrir verificação" (aguardando) —
  // abre a tela de redirecionamento para a Unico (mesmo padrão de /consignado-clt/assinar)
  const handleIniciarVerificacao = () => {
    navigate("/leilao/redirecionando/unico", { state: location.state });
  };

  const handleCancelar = () => navigate("/leilao/cancelada");

  if (erroParam) {
    return (
      <SubPageLayout title="Verificação de identidade" hideNav>
        <ErrorScreen
          categoria={erroParam}
          labelBotao={LABEL_BOTAO_ERRO[erroParam] ?? "Voltar à oferta"}
          onTentarNovamente={() => navigate("/leilao")}
        />
      </SubPageLayout>
    );
  }

  if (etapa === "preparando") {
    return (
      <SubPageLayout title="Verificação de identidade" hideNav>
        <ErrorScreen categoria="leilao_preparando_assinatura" icone={HourglassMedium} />
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Verificação de identidade" hideNav>
      {etapa === "aviso" ? (
        <UnicoNotice
          titulo="Falta só confirmar sua identidade!"
          descricao="Sua oferta de Crédito Consignado CLT já está aprovada. Você será redirecionado para a Unico para verificar sua identidade."
          labelBotao="Continuar para verificação"
          onContinuar={handleIniciarVerificacao}
          alerta={alertaAssinar}
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
