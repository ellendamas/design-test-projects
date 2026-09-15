import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";
import { useChat } from "@/context/ChatContext";

// Rota: /leilao/oferta/falha-desembolso — jornada pública/guest, apartada da jornada com conta
// (/leilao/falha-desembolso).
export default function LeilaoFalhaDesembolsoPublicaPage() {
  const { abrirChat } = useChat();
  return (
    <PublicLayout>
      <ErrorScreen categoria="leilao_falha_desembolso" labelBotao="Falar com suporte" onTentarNovamente={abrirChat} />
    </PublicLayout>
  );
}
