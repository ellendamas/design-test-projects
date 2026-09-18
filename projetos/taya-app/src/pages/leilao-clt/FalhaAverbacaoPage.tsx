import { SubPageLayout } from "@/App";
import { ErrorScreen } from "@/components/ErrorScreen";
import { useChat } from "@/context/ChatContext";

// Rota: /leilao/falha-averbacao — jornada com conta. A jornada pública/guest tem sua própria
// tela apartada (FalhaAverbacaoPublicaPage.tsx, rota /leilao/oferta/falha-averbacao).
export default function LeilaoFalhaAverbacaoPage() {
  const { abrirChat } = useChat();
  return (
    <SubPageLayout title="Crédito Consignado CLT" hideNav>
      <ErrorScreen categoria="leilao_falha_averbacao" labelBotao="Falar com suporte" onTentarNovamente={abrirChat} />
    </SubPageLayout>
  );
}
