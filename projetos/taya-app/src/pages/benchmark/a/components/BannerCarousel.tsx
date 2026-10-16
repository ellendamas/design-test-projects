import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { useReducedMotion } from "../useReducedMotion";

type Banner = { id: string; titulo: string; sub: string; cor: string };

// Carrossel de 3-4 banners, troca a cada 5s, pausa ao tocar, pontos de navegação. Guardrail 3:
// todo banner tem um jeito claro de dispensar (X). Guardrail 4: alvo de toque do X em 44px,
// mesmo sendo visualmente pequeno (ver padrão "alvo grande, indicador pequeno" nos pontos).
// Guardrail 4 (reduced motion): sem auto-troca quando o usuário pede menos movimento.
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [visiveis, setVisiveis] = useState(banners);
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || pausado || visiveis.length <= 1) return;
    const t = window.setInterval(() => {
      setIndice((i) => (i + 1) % visiveis.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [reduced, pausado, visiveis.length]);

  useEffect(() => {
    if (indice >= visiveis.length) setIndice(0);
  }, [visiveis.length, indice]);

  if (visiveis.length === 0) return null;
  const atual = visiveis[indice];

  const dispensar = (id: string) => {
    setVisiveis((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div
      className="space-y-2"
      onPointerDown={() => setPausado(true)}
      onPointerUp={() => setPausado(false)}
      onPointerLeave={() => setPausado(false)}
    >
      <div className={`relative min-h-[110px] overflow-hidden rounded-2xl bg-gradient-to-br ${atual.cor} p-4 text-white shadow-card`}>
        <button
          type="button"
          onClick={() => dispensar(atual.id)}
          aria-label="Dispensar banner"
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/15 text-white"
        >
          <X size={16} />
        </button>
        <p className="max-w-[75%] text-sm font-bold leading-snug">{atual.titulo}</p>
        <p className="mt-1 max-w-[75%] text-xs leading-relaxed text-white/85">{atual.sub}</p>
      </div>
      {visiveis.length > 1 && (
        <div className="flex items-center justify-center gap-1">
          {visiveis.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ir pro banner ${i + 1} de ${visiveis.length}`}
              className="flex h-11 w-8 items-center justify-center"
            >
              <span className={`h-1.5 rounded-full transition-all ${i === indice ? "w-5 bg-primary" : "w-1.5 bg-border"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
