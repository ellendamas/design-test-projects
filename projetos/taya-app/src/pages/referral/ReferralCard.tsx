import { useEffect } from "react";
import { CaretRight, Gift } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "@/App";
import { isReferralEligible } from "@/config/referral";
import { IG01_CONTEUDO } from "@/data/saudeConteudo";
import { useVisibilidadeFlag, type ReferralOrigin } from "./shared";
import { trackReferralBannerClicked, trackReferralBannerViewed } from "./trackReferral";

type ReferralCardProps = {
  // Obrigatória, sem valor padrão: o hub que antes decidia essa origem sozinho não existe mais
  // (Prompt 1d, 22/10) — cada lugar que usa o card precisa dizer explicitamente de onde é, pra
  // não mascarar a origem real do clique no evento trackReferralScreenViewed.
  origin: ReferralOrigin;
};

// IG-01 — card "Indique e ganhe". Até o Prompt 1d só existia no hub de Assistências (a tela
// inteira foi apagada nesta tarefa, a Saúde virou a porta de entrada). Agora aparece em dois
// lugares, cada um passando a própria origem: `/assistencias/saude` pra quem já tem plano ativo
// e a confirmação de compra, no lugar onde antes ficava o ReferralBanner (ver
// ConfirmacaoPage.tsx). Quando origin === "banner_pos_contratacao" o card também dispara
// trackReferralBannerViewed/Clicked com placement "pos_contratacao" — os mesmos dois eventos
// que o ReferralBanner disparava ali, pra não perder esse dado já coletado. Em nenhum outro
// lugar esses dois disparam. O texto não cita o parceiro fora dos dois pontos permitidos pela
// regra de copy (docs/saude-conteudo-fonte.md). Card inteiro é área de toque (único <button>,
// alvo de 44 px ou mais), mesmo racional de R6/Clarity já documentado na versão original deste
// componente.
export function ReferralCard({ origin }: ReferralCardProps) {
  const navigate = useNavigate();
  const elegivel = isReferralEligible(getStoredUser()?.email);
  const estado = useVisibilidadeFlag(elegivel);
  const ehPosContratacao = origin === "banner_pos_contratacao";

  useEffect(() => {
    if (ehPosContratacao && estado === "default") trackReferralBannerViewed("pos_contratacao");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehPosContratacao, estado]);

  if (estado === "oculto" || estado === "error") return null;

  if (estado === "loading") {
    return <div className="h-[104px] w-full animate-pulse rounded-2xl bg-[#ECEEF1]" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (ehPosContratacao) trackReferralBannerClicked("pos_contratacao");
        navigate("/assistencias/saude/indique-e-ganhe", { state: { origin } });
      }}
      className="flex min-h-[44px] w-full items-center gap-3 rounded-2xl border border-[#FFD4C4] bg-[#FFF3EE] p-4 text-left transition-colors hover:bg-[#FFE9DF]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#FD5F31]">
        <Gift size={22} weight="fill" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{IG01_CONTEUDO.titulo}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{IG01_CONTEUDO.texto}</p>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#FD5F31]">
          {IG01_CONTEUDO.cta} <CaretRight size={12} />
        </span>
      </div>
    </button>
  );
}
