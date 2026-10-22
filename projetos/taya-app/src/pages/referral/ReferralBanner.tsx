import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "@/App";
import { isReferralEligible } from "@/config/referral";
import { useVisibilidadeFlag } from "./shared";
import { trackReferralBannerClicked, trackReferralBannerDismissed, trackReferralBannerViewed } from "./trackReferral";

type ReferralBannerProps = {
  variant: "pos_contratacao";
};

// IG-06 — banner na confirmação da contratação. Até aqui este componente também cobria o IG-05
// (banner do dashboard), mas esse virou um card dentro de "Para você agora" (ver HomeScreen em
// App.tsx e deveMostrarCardIndicacaoHoje() em shared.ts) — layout e regra de recorrência
// diferentes o suficiente pra não valer a pena manter como variante aqui. `variant` ficou só
// com "pos_contratacao" mesmo, pra não precisar tocar no call site de ConfirmacaoPage.tsx.
export function ReferralBanner({ variant }: ReferralBannerProps) {
  const navigate = useNavigate();
  const elegivel = isReferralEligible(getStoredUser()?.email);
  const estadoFlag = useVisibilidadeFlag(elegivel);
  const [dispensado, setDispensado] = useState(false);

  const placement = "pos_contratacao";
  const visivel = estadoFlag === "default" && !dispensado;

  useEffect(() => {
    if (visivel) trackReferralBannerViewed(placement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visivel]);

  if (estadoFlag === "oculto" || estadoFlag === "error" || dispensado) return null;

  if (estadoFlag === "loading") {
    return <div className="h-[96px] w-full animate-pulse rounded-2xl bg-[#ECEEF1]" aria-hidden="true" />;
  }

  const irParaIndicacao = () => {
    trackReferralBannerClicked(placement);
    navigate("/assistencias/saude/indique-e-ganhe", { state: { origin: "banner_pos_contratacao" } });
  };

  const dispensar = () => {
    trackReferralBannerDismissed(placement);
    setDispensado(true);
  };

  // Mesmo grafismo do hero da IG-02 (gradiente from-[#FD5F31] to-[#FA9832] + "10%" em destaque
  // tipográfico), só que menor — sem os cards de plano, que fazem sentido na tela cheia mas não
  // num banner. `variant` não é mais usado pra ramificar nada (só sobrou este caso), mas
  // continua recebido pra deixar explícito no call site o que está sendo renderizado.
  void variant;
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#FD5F31] to-[#FA9832] p-4 text-white">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-extrabold">
          10%
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Gostou? Indique a BeneMed</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/85">
            Indique para quem você ama e ganhe 10% da primeira mensalidade.
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={irParaIndicacao}
          className="h-11 flex-1 rounded-full bg-white px-4 text-sm font-semibold text-[#D94E28]"
        >
          Indicar agora
        </button>
        <button
          type="button"
          onClick={dispensar}
          className="h-11 min-w-[44px] rounded-full border border-white/40 bg-white/10 px-4 text-sm font-semibold text-white"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
