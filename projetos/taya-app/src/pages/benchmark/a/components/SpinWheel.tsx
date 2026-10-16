import { useState } from "react";
import { Gift } from "@phosphor-icons/react";
import { useReducedMotion } from "../useReducedMotion";

// "Gire e ganhe" — roleta em CSS (conic-gradient girando via transform), prêmio mock fixo
// (nunca crédito — guardrail 5). Reduced motion: pula a animação, mostra o prêmio na hora.
export function SpinWheel({ premio }: { premio: { label: string } }) {
  const reduced = useReducedMotion();
  const [girando, setGirando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [rotacao, setRotacao] = useState(0);

  const girar = () => {
    if (girando) return;
    if (reduced) {
      setResultado(premio.label);
      return;
    }
    setGirando(true);
    setResultado(null);
    setRotacao((r) => r + 1440 + 30);
    window.setTimeout(() => {
      setGirando(false);
      setResultado(premio.label);
    }, 2200);
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
      <div className="flex items-center gap-4">
        <div
          className="relative h-20 w-20 shrink-0 rounded-full"
          style={{
            background: "conic-gradient(#FD5F31 0deg 90deg, #FA9832 90deg 180deg, #FFCC05 180deg 270deg, #D94E28 270deg 360deg)",
            transform: `rotate(${rotacao}deg)`,
            transition: reduced ? "none" : "transform 2.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow">
            <Gift size={16} className="text-primary" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">Gire e ganhe</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {resultado ? `Você ganhou: ${resultado}!` : "Gire uma vez por dia e ganhe prêmios"}
          </p>
          <button
            type="button"
            onClick={girar}
            disabled={girando}
            className="mt-2 flex h-11 items-center justify-center rounded-full bg-primary px-4 text-xs font-bold text-white disabled:opacity-60"
          >
            {girando ? "Girando..." : "Girar agora"}
          </button>
        </div>
      </div>
    </div>
  );
}
