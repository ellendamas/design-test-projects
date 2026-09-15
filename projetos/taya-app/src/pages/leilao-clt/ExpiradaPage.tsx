import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";

// Rota: /leilao/expirada
export default function LeilaoExpiradaPage() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <ErrorScreen categoria="leilao_expirada" labelBotao="Fechar" onTentarNovamente={() => navigate("/")} />
    </PublicLayout>
  );
}
