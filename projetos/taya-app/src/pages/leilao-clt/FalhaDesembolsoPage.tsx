import { SubPageLayout } from "@/App";
import { ErrorScreen } from "@/components/ErrorScreen";
import { useChat } from "@/context/ChatContext";

// Rota: /leilao/falha-desembolso — jornada com conta. A jornada pública/guest tem sua própria
// tela apartada (FalhaDesembolsoPublicaPage.tsx, rota /leilao/oferta/falha-desembolso).
export default function LeilaoFalhaDesembolsoPage() {
  const { abrirChat } = useChat();
  return (
    <SubPageLayout title="Crédito Consignado CLT" hideNav>
      <ErrorScreen categoria="leilao_falha_desembolso" labelBotao="Falar com suporte" onTentarNovamente={abrirChat} />
    </SubPageLayout>
  );
}
