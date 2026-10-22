import { useEffect, useRef, useState, type ReactNode } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useReducedMotion } from "framer-motion";

// Carrossel horizontal com "peek" (pedacinho do próximo item visível na borda) — mesmo
// padrão de drag-to-scroll + scroll-snap já usado no carrossel de categorias da página de
// Assistências (AssistenciasPage em App.tsx), extraído aqui pra ser reaproveitado em outros
// lugares (ex: carrossel de cross-sell nas telas de negativa) sem duplicar a lógica.
export function PeekCarousel({
  children,
  scrollStep = 220,
  showProgress = false,
  ariaLabel,
}: {
  children: ReactNode;
  scrollStep?: number;
  /** Mostra uma barra de progresso fina abaixo da faixa, proporcional ao quanto já foi rolado. */
  showProgress?: boolean;
  /** Rótulo acessível da região rolável, pra leitor de tela e pra navegação por teclado. */
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduceMotion = useReducedMotion();
  const scrollBehavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";

  const updateControls = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0);
  };

  useEffect(() => {
    updateControls();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => updateControls();
    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className={`flex w-full gap-3 overflow-x-auto pb-1 touch-pan-x select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-scrollbar]:hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            ref.current?.scrollBy({ left: scrollStep, behavior: scrollBehavior });
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            ref.current?.scrollBy({ left: -scrollStep, behavior: scrollBehavior });
          }
        }}
        onPointerDown={(e) => {
          const el = ref.current;
          if (!el) return;
          setDragging(true);
          dragStartX.current = e.clientX;
          dragStartScroll.current = el.scrollLeft;
          // Não captura o pointer aqui — só depois de confirmar arraste de verdade em
          // onPointerMove (ver comentário lá). Capturar direto no pointerdown faz o clique
          // sintetizado nos cards/banners dentro do carrossel ser retargetado pro container,
          // que não tem onClick, e o clique nunca acontece.
        }}
        onPointerMove={(e) => {
          const el = ref.current;
          if (!el || !dragging) return;
          const deltaX = e.clientX - dragStartX.current;
          // Só captura o pointer a partir de um arraste de verdade (>4px) — um toque/clique
          // simples solta o pointer sem nunca ter sido capturado, então o clique no elemento
          // tocado dispara normalmente.
          if (!el.hasPointerCapture(e.pointerId) && Math.abs(deltaX) > 4) {
            el.setPointerCapture(e.pointerId);
          }
          el.scrollLeft = dragStartScroll.current - deltaX;
        }}
        onPointerUp={(e) => {
          const el = ref.current;
          if (!el) return;
          setDragging(false);
          if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={(e) => {
          const el = ref.current;
          if (!el) return;
          setDragging(false);
          if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        }}
      >
        {children}
      </div>

      <div className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 md:flex">
        <button
          type="button"
          onClick={() => ref.current?.scrollBy({ left: -scrollStep, behavior: scrollBehavior })}
          disabled={!canLeft}
          className="pointer-events-auto -ml-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#FD5F31] shadow disabled:opacity-40"
          aria-label="Ver itens anteriores"
        >
          <CaretLeft size={16} />
        </button>
      </div>
      <div className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 md:flex">
        <button
          type="button"
          onClick={() => ref.current?.scrollBy({ left: scrollStep, behavior: scrollBehavior })}
          disabled={!canRight}
          className="pointer-events-auto -mr-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#FD5F31] shadow disabled:opacity-40"
          aria-label="Ver próximos itens"
        >
          <CaretRight size={16} />
        </button>
      </div>

      {showProgress && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#ECEEF1]" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[#FD5F31] transition-[width]"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
