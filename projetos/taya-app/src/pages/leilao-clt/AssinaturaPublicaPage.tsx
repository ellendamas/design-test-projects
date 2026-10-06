import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import UnicoNotice from "@/components/UnicoNotice";
import UnicoAguardando from "@/components/UnicoAguardando";
import { ERROS, ErrorScreen, type ErrorCategoria } from "@/components/ErrorScreen";

// Label do CTA de erro varia por categoria — as demais caem no default "Voltar à oferta".
const LABEL_BOTAO_ERRO: Partial<Record<ErrorCategoria, string>> = {
  leilao_link_outro_cpf: "Sair da conta",
  leilao_link_usado: "Voltar ao início",
};

// Rota: /leilao/oferta/assinatura — jornada pública/guest, apartada da jornada com conta
// (/leilao/assinatura). ?status=aguardando mostra o estado de retorno, ?status=preparando
// mostra o estado de espera antes do link da Unico chegar (DESIGN ONLY — sem polling real
// ainda); ?erro= mostra erro; ?assinarErro=1 mostra o alerta inline de falha ao iniciar
// assinatura (DESIGN ONLY).
export default function LeilaoAssinaturaPublicaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const etapa: "aviso" | "preparando" | "aguardando" =
    statusParam === "aguardando" ? "aguardando" : statusParam === "preparando" ? "preparando" : "aviso";
  const erroParam = searchParams.get("erro") as ErrorCategoria | null; // DESIGN ONLY
  const alertaAssinar = searchParams.get("assinarErro") === "1"; // DESIGN ONLY

  // Ao clicar em "Continuar para verificação" (aviso) ou "Reabrir verificação" (aguardando) —
  // abre a tela de redirecionamento para a Unico. Rota própria da jornada pública (não a
  // /leilao/redirecionando/unico da jornada com conta) para nunca depender de auth state.
  const handleIniciarVerificacao = () => {
    navigate("/leilao/oferta/redirecionando/unico", { state: location.state });
  };

  const handleCancelar = () => navigate("/leilao/oferta/cancelada");

  if (erroParam) {
    return (
      <PublicLayout>
        <ErrorScreen
          categoria={erroParam}
          labelBotao={LABEL_BOTAO_ERRO[erroParam] ?? "Voltar à oferta"}
          onTentarNovamente={() => navigate("/leilao/oferta")}
        />
      </PublicLayout>
    );
  }

  if (etapa === "preparando") {
    // Spinner padrão do app (mesmo anel usado em consignado-clt/LoadingPage.tsx) em vez do
    // ícone estático do ErrorScreen — aqui é loading de verdade, não um erro.
    const { headline, subtitulo } = ERROS.leilao_preparando_assinatura;
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#FD5F31] border-t-transparent" />
          <p className="text-base font-semibold text-foreground">{headline}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{subtitulo}</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {etapa === "aviso" ? (
        <UnicoNotice
          titulo="Falta só confirmar sua identidade!"
          descricao="Sua oferta de Crédito Consignado CLT foi aprovada. Você será direcionado para verificar sua identidade na plataforma segura da Unico."
          labelBotao="Continuar para verificação"
          onContinuar={handleIniciarVerificacao}
          alerta={alertaAssinar}
        />
      ) : (
        <UnicoAguardando
          titulo="Aguardando sua verificação"
          descricao="Você saiu antes de concluir a verificação de identidade. Toque em Reabrir verificação para continuar de onde parou."
          labelBotao="Reabrir verificação"
          onAssinar={handleIniciarVerificacao}
          onCancelar={handleCancelar}
        />
      )}
    </PublicLayout>
  );
}
