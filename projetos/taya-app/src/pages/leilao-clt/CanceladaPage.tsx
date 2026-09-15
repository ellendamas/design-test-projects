import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";

// Rota: /leilao/cancelada
export default function LeilaoCanceladaPage() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <ErrorScreen categoria="leilao_cancelada" labelBotao="Fechar" onTentarNovamente={() => navigate("/")} />
    </PublicLayout>
  );
}
