import { useNavigate } from "react-router-dom";
import { Coins } from "@phosphor-icons/react";
import { useReducedMotion } from "../useReducedMotion";

// Botão flutuante de pontos — leva pra /benchmark/a/pontos. Pulso vira estático quando o
// usuário pede menos movimento (guardrail 4). 56px de altura, bem acima do mínimo de 44px.
export function FloatingPointsButton({ pontos }: { pontos: number }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {!reduced && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-primary/40" />}
      <button
        type="button"
        onClick={() => navigate("/benchmark/a/pontos")}
        aria-label={`Ver seus ${pontos} pontos`}
        className="relative flex h-14 items-center gap-2 rounded-full bg-primary px-4 text-white shadow-[0_8px_24px_rgba(253,95,49,0.45)]"
      >
        <Coins size={20} weight="fill" />
        <span className="text-sm font-bold">{pontos.toLocaleString("pt-BR")}</span>
      </button>
    </div>
  );
}
