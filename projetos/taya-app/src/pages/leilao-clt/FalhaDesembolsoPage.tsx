import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";
import { useChat } from "@/context/ChatContext";

// Rota: /leilao/falha-desembolso
export default function LeilaoFalhaDesembolsoPage() {
  const { abrirChat } = useChat();
  return (
    <PublicLayout>
      <ErrorScreen categoria="leilao_falha_desembolso" labelBotao="Falar com suporte" onTentarNovamente={abrirChat} />
    </PublicLayout>
  );
}
