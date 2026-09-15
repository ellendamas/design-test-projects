import { useNavigate } from "react-router-dom";
import { SubPageLayout, getStoredUser } from "@/App";
import { PublicLayout } from "@/components/PublicLayout";
import { ErrorScreen } from "@/components/ErrorScreen";

// Rota: /leilao/cancelada — compartilhada entre com conta e guest
export default function LeilaoCanceladaPage() {
  const navigate = useNavigate();
  const comConta = !!getStoredUser();

  const conteudo = (
    <ErrorScreen
      categoria="leilao_cancelada"
      labelBotao={comConta ? "Voltar ao início" : "Fechar"}
      onTentarNovamente={() => navigate(comConta ? "/painel" : "/")}
    />
  );

  if (comConta) {
    return <SubPageLayout title="Crédito Consignado CLT" hideNav>{conteudo}</SubPageLayout>;
  }
  return <PublicLayout>{conteudo}</PublicLayout>;
}
