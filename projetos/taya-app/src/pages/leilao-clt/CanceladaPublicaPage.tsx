import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";

// Rota: /leilao/oferta/cancelada — jornada pública/guest, apartada da jornada com conta
// (/leilao/cancelada).
export default function LeilaoCanceladaPublicaPage() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <ErrorScreen categoria="leilao_cancelada" labelBotao="Fechar" onTentarNovamente={() => navigate("/")} />
    </PublicLayout>
  );
}
