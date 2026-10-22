import { CaretRight, Gift } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "@/App";
import { isReferralEligible } from "@/config/referral";
import { IG01_CONTEUDO } from "@/data/saudeConteudo";
import { useVisibilidadeFlag } from "./shared";

// IG-01 — card "Indique e ganhe" dentro de Assistências, restaurado em 21/10 no hub
// (AssistenciasPage, App.tsx), logo abaixo do card de destaque da Saúde. Tinha sido removido no
// commit 9c485bc, voltou primeiro pra dentro da página do produto Saúde e, nesta correção,
// mudou de lugar de novo pro hub. O texto não cita o parceiro fora dos dois pontos permitidos
// pela regra de copy (docs/saude-conteudo-fonte.md). Card inteiro é área de toque (único
// <button>, alvo de 44 px ou mais), mesmo racional de R6/Clarity já documentado na versão
// original deste componente.
export function ReferralCard() {
  const navigate = useNavigate();
  const elegivel = isReferralEligible(getStoredUser()?.email);
  const estado = useVisibilidadeFlag(elegivel);

  if (estado === "oculto" || estado === "error") return null;

  if (estado === "loading") {
    return <div className="h-[104px] w-full animate-pulse rounded-2xl bg-[#ECEEF1]" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={() => navigate("/assistencias/saude/indique-e-ganhe", { state: { origin: "assistencias_hub" } })}
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
