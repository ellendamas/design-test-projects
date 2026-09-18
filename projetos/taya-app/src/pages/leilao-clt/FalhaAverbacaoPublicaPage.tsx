import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";
import { useChat } from "@/context/ChatContext";

// Rota: /leilao/oferta/falha-averbacao — jornada pública/guest, apartada da jornada com conta
// (/leilao/falha-averbacao).
export default function LeilaoFalhaAverbacaoPublicaPage() {
  const { abrirChat } = useChat();
  return (
    <PublicLayout>
      <ErrorScreen categoria="leilao_falha_averbacao" labelBotao="Falar com suporte" onTentarNovamente={abrirChat} />
    </PublicLayout>
  );
}
