import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { SubPageLayout } from "@/App";
import UnicoNotice from "@/components/UnicoNotice";
import UnicoAguardando from "@/components/UnicoAguardando";
import { ErrorScreen, type ErrorCategoria } from "@/components/ErrorScreen";

// Rota: /leilao/assinatura — jornada com conta. ?status=aguardando mostra o estado de
// retorno; ?erro= mostra erro. A jornada pública/guest tem sua própria tela apartada
// (AssinaturaPublicaPage.tsx, rota /leilao/oferta/assinatura).
export default function LeilaoAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const etapa: "aviso" | "aguardando" = searchParams.get("status") === "aguardando" ? "aguardando" : "aviso";
  const erroParam = searchParams.get("erro") as ErrorCategoria | null; // DESIGN ONLY

  // Ao clicar em "Continuar para verificação" (aviso) ou "Reabrir verificação" (aguardando) —
  // abre a tela de redirecionamento para a Unico (mesmo padrão de /consignado-clt/assinar)
  const handleIniciarVerificacao = () => {
    navigate("/leilao/redirecionando/unico", { state: location.state });
  };

  const handleCancelar = () => navigate("/leilao/cancelada");

  if (erroParam) {
    return (
      <SubPageLayout title="Verificação de identidade" hideNav>
        <ErrorScreen categoria={erroParam} labelBotao="Voltar à oferta" onTentarNovamente={() => navigate("/leilao")} />
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
