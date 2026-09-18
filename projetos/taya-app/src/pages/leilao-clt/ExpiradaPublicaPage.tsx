import { useNavigate } from "react-router-dom";
import { ClockCountdown } from "@phosphor-icons/react";
import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";

// Rota: /leilao/oferta/expirada — jornada pública/guest, apartada da jornada com conta
// (/leilao/expirada).
export default function LeilaoExpiradaPublicaPage() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <ErrorScreen categoria="leilao_expirada" icone={ClockCountdown} labelBotao="Fechar" onTentarNovamente={() => navigate("/")} />
    </PublicLayout>
  );
}
