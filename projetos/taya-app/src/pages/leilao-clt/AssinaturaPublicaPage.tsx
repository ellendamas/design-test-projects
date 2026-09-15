import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import UnicoNotice from "@/components/UnicoNotice";
import UnicoAguardando from "@/components/UnicoAguardando";
import { ErrorScreen, type ErrorCategoria } from "@/components/ErrorScreen";
import { OfertaResumoCard } from "./OfertaResumoCard";

// Rota: /leilao/oferta/assinatura — jornada pública/guest, apartada da jornada com conta
// (/leilao/assinatura). ?status=aguardando mostra o estado de retorno; ?erro= mostra erro.
export default function LeilaoAssinaturaPublicaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const etapa: "aviso" | "aguardando" = searchParams.get("status") === "aguardando" ? "aguardando" : "aviso";
  const erroParam = searchParams.get("erro") as ErrorCategoria | null; // DESIGN ONLY

  // Ao clicar em "Continuar para verificação" (aviso) ou "Reabrir verificação" (aguardando) —
  // abre a tela de redirecionamento para a Unico
  const handleIniciarVerificacao = () => {
    navigate("/leilao/redirecionando/unico", { state: location.state });
  };

  const handleCancelar = () => navigate("/leilao/oferta/cancelada");

  if (erroParam) {
    return (
      <PublicLayout>
        <ErrorScreen categoria={erroParam} labelBotao="Voltar à oferta" onTentarNovamente={() => navigate("/leilao/oferta")} />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="space-y-4">
        <OfertaResumoCard />
        {etapa === "aviso" ? (
          <UnicoNotice
            titulo="Falta só confirmar sua identidade!"
            descricao="Sua oferta de Crédito Consignado CLT foi aprovada. Você será direcionado para verificar sua identidade na plataforma segura da Unico."
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
      </div>
    </PublicLayout>
  );
}
