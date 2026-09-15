import { SubPageLayout, getStoredUser } from "@/App";
import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";
import { useChat } from "@/context/ChatContext";

// Rota: /leilao/falha-desembolso — compartilhada entre com conta e guest
export default function LeilaoFalhaDesembolsoPage() {
  const { abrirChat } = useChat();
  const comConta = !!getStoredUser();

  const conteudo = <ErrorScreen categoria="leilao_falha_desembolso" labelBotao="Falar com suporte" onTentarNovamente={abrirChat} />;

  if (comConta) {
    return <SubPageLayout title="Crédito Consignado CLT" hideNav>{conteudo}</SubPageLayout>;
  }
  return <PublicLayout>{conteudo}</PublicLayout>;
}
