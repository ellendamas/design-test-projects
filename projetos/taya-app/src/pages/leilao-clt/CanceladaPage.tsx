import { useNavigate } from "react-router-dom";
import { SubPageLayout } from "@/App";
import { ErrorScreen } from "@/components/ErrorScreen";

// Rota: /leilao/cancelada — jornada com conta. A jornada pública/guest tem sua própria tela
// apartada (CanceladaPublicaPage.tsx, rota /leilao/oferta/cancelada).
export default function LeilaoCanceladaPage() {
  const navigate = useNavigate();
  return (
    <SubPageLayout title="Crédito Consignado CLT" hideNav>
      <ErrorScreen categoria="leilao_cancelada" labelBotao="Voltar ao início" onTentarNovamente={() => navigate("/painel")} />
    </SubPageLayout>
  );
}
