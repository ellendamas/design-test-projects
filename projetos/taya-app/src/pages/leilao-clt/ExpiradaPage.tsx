import { useNavigate } from "react-router-dom";
import { ClockCountdown } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { ErrorScreen } from "@/components/ErrorScreen";

// Rota: /leilao/expirada — jornada com conta. A jornada pública/guest tem sua própria tela
// apartada (ExpiradaPublicaPage.tsx, rota /leilao/oferta/expirada).
export default function LeilaoExpiradaPage() {
  const navigate = useNavigate();
  return (
    <SubPageLayout title="Crédito Consignado CLT" hideNav>
      <ErrorScreen categoria="leilao_expirada" icone={ClockCountdown} labelBotao="Voltar ao início" onTentarNovamente={() => navigate("/painel")} />
    </SubPageLayout>
  );
}
