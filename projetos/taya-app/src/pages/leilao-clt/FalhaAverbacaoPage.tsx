import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";
import { useChat } from "@/context/ChatContext";

// Rota: /leilao/falha-averbacao
export default function LeilaoFalhaAverbacaoPage() {
  const { abrirChat } = useChat();
  return (
    <PublicLayout>
      <ErrorScreen categoria="leilao_falha_averbacao" labelBotao="Falar com suporte" onTentarNovamente={abrirChat} />
    </PublicLayout>
  );
}
