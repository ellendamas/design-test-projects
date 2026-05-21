import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bank,
  CalendarCheck,
  Coins,
  CreditCard,
  Fire,
  Heartbeat,
  Lightning,
  MapPin,
  Wallet,
  X,
  ArrowRight,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { type IconeRecomendacao, useRecomendacoes } from "@/context/RecomendacoesContext";

const iconMap: Record<IconeRecomendacao, JSX.Element> = {
  CalendarCheck: <CalendarCheck size={24} className="text-[#E8590A]" />,
  MapPin: <MapPin size={24} className="text-[#E8590A]" />,
  Bank: <Bank size={24} className="text-[#E8590A]" />,
  CreditCard: <CreditCard size={24} className="text-[#E8590A]" />,
  Coins: <Coins size={24} className="text-[#E8590A]" />,
  Heartbeat: <Heartbeat size={24} className="text-[#E8590A]" />,
  Lightning: <Lightning size={24} className="text-[#E8590A]" />,
  Wallet: <Wallet size={24} className="text-[#E8590A]" />,
  Fire: <Fire size={24} className="text-[#E8590A]" />,
};

export function ParaVoceAgora() {
  const navigate = useNavigate();
  const { cards, dispensar } = useRecomendacoes();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [canScroll, setCanScroll] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScrollState = () => {
      const hasOverflow = el.scrollWidth - el.clientWidth > 2;
      setCanScroll(hasOverflow);
      setCanLeft(el.scrollLeft > 2);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [cards.length, loading]);

  const hasCards = cards.length > 0;

  if (!loading && !hasCards) return null;

  const skeletons = useMemo(() => ["s1", "s2"], []);

  return (
    <div className="relative">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/80">Para você agora</p>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-0 pb-2 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.currentTarget.scrollBy({ left: e.deltaY, behavior: "auto" });
          }
        }}
      >
        {loading ? (
          skeletons.map((id) => (
            <div key={id} className="h-[92px] min-w-[280px] rounded-xl border border-white/20 bg-white/20 p-4 animate-pulse" style={{ scrollSnapAlign: "start" }} />
          ))
        ) : (
          <AnimatePresence initial={false}>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ scrollSnapAlign: "start" }}
                className="shrink-0"
              >
                <Card className="h-[96px] min-w-[280px] max-w-[300px] rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
                  <CardContent className="flex h-full items-start gap-3 p-3">
                    <button
                      className="flex h-full min-w-0 flex-1 items-stretch gap-3 text-left"
                      onClick={() => navigate(card.destino)}
                    >
                      <div className="shrink-0">{iconMap[card.icone]}</div>
                      <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                        <p className="line-clamp-2 text-[13px] font-medium leading-5 text-[#111827]">{card.texto}</p>
                        <p className="inline-flex items-center text-[13px] font-semibold text-[#E8590A]">
                          {card.cta ? `${card.cta} ` : ""}
                          <ArrowRight size={14} className="ml-0.5" />
                        </p>
                      </div>
                    </button>

                    {card.dispensavel ? (
                      <button
                        type="button"
                        onClick={() => dispensar(card.id)}
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F5F4F2]"
                        aria-label="Dispensar recomendação"
                      >
                        <X size={14} />
                      </button>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className={`pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 md:flex ${canScroll ? "" : "opacity-0"}`}>
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
          disabled={!canLeft}
          className="pointer-events-auto -ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#E8590A] shadow disabled:opacity-40"
          aria-label="Ver recomendações anteriores"
        >
          <CaretLeft size={16} />
        </button>
      </div>

      <div className={`pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 md:flex ${canScroll ? "" : "opacity-0"}`}>
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
          disabled={!canRight}
          className="pointer-events-auto -mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#E8590A] shadow disabled:opacity-40"
          aria-label="Ver próximas recomendações"
        >
          <CaretRight size={16} />
        </button>
      </div>
    </div>
  );
}
