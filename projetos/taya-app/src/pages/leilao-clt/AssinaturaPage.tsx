import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { SubPageLayout, getStoredUser } from "@/App";
import { PublicLayout } from "@/components/PublicLayout";
import UnicoNotice from "@/components/UnicoNotice";
import UnicoAguardando from "@/components/UnicoAguardando";
import { ErrorScreen, type ErrorCategoria } from "@/components/ErrorScreen";
import { OfertaResumoCard } from "./OfertaResumoCard";

// Rota: /leilao/assinatura — compartilhada entre a jornada com conta (SubPageLayout) e a
// pública/guest (PublicLayout). ?status=aguardando mostra o estado de retorno; ?erro= mostra erro.
export default function LeilaoAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const etapa: "aviso" | "aguardando" = searchParams.get("status") === "aguardando" ? "aguardando" : "aviso";
  const erroParam = searchParams.get("erro") as ErrorCategoria | null; // DESIGN ONLY
  const comConta = !!getStoredUser();

  // Ao clicar em "Continuar para verificação" (aviso) ou "Reabrir verificação" (aguardando) —
  // abre a tela de redirecionamento para a Unico (mesmo padrão de /consignado-clt/assinar)
  const handleIniciarVerificacao = () => {
    navigate("/leilao/redirecionando/unico", { state: location.state });
  };

  const handleCancelar = () => navigate("/leilao/cancelada");

  const conteudo = erroParam ? (
    <ErrorScreen categoria={erroParam} labelBotao="Voltar à oferta" onTentarNovamente={() => navigate("/leilao")} />
  ) : (
    <div className="space-y-4">
      {!comConta && <OfertaResumoCard />}
      {etapa === "aviso" ? (
        <UnicoNotice
          titulo="Falta só confirmar sua identidade!"
          descricao={
            comConta
              ? "Sua oferta de Crédito Consignado CLT já está aprovada. Você será redirecionado para a Unico para verificar sua identidade."
              : "Sua oferta de Crédito Consignado CLT foi aprovada. Você será direcionado para verificar sua identidade na plataforma segura da Unico."
          }
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
  );

  if (comConta) {
    return (
      <SubPageLayout title="Verificação de identidade" hideNav>
        {conteudo}
      </SubPageLayout>
    );
  }

  return <PublicLayout>{conteudo}</PublicLayout>;
}
