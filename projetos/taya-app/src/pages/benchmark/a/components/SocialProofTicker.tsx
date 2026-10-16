import { useEffect, useState } from "react";
import { Megaphone } from "@phosphor-icons/react";
import { useReducedMotion } from "../useReducedMotion";

// Ticker de prova social — troca de mensagem a cada 4s. Reduced motion: para de trocar
// sozinho, fica parado na primeira mensagem.
export function SocialProofTicker({ mensagens }: { mensagens: string[] }) {
  const [indice, setIndice] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || mensagens.length <= 1) return;
    const t = window.setInterval(() => setIndice((i) => (i + 1) % mensagens.length), 4000);
    return () => window.clearInterval(t);
  }, [reduced, mensagens.length]);

  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
      <Megaphone size={16} className="shrink-0 text-primary" />
      <p className="truncate text-xs text-foreground">{mensagens[indice]}</p>
    </div>
  );
}
