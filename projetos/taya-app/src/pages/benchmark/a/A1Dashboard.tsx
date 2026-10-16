import { Bell, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";
import { Shell } from "../components/Shell";
import { ProtoBadge } from "./components/ProtoBadge";
import { BottomNavA } from "./components/BottomNavA";
import { FloatingPointsButton } from "./components/FloatingPointsButton";
import { BannerCarousel } from "./components/BannerCarousel";
import { CheckInStrip } from "./components/CheckInStrip";
import { CouponStrip } from "./components/CouponStrip";
import { FlashDeals } from "./components/FlashDeals";
import { DailyMissions } from "./components/DailyMissions";
import { SpinWheel } from "./components/SpinWheel";
import { SocialProofTicker } from "./components/SocialProofTicker";
import { ICON_MAP_A } from "./iconMap";
import {
  ATALHOS_GRANDES,
  ATALHOS_GRID,
  BANNERS_A1,
  CHECKIN_SEMANA,
  CUPONS,
  MISSOES_DIA,
  OFERTAS_RELAMPAGO,
  PARA_VOCE_AGORA_CREDITO,
  PARCEIROS_DESTAQUE,
  PREMIO_ROLETA,
  PRODUTOS_ATIVOS_A1,
  PROVA_SOCIAL,
  USUARIO_A,
} from "./mock";

// A1 — Dashboard da Versão A ("visão Alipay" densa/promocional/gamificada pedida pelo GPM).
// Densidade alta de propósito (grade de atalhos, carrossel, cupons, ofertas relâmpago,
// missões, roleta, ticker de prova social), mas a ZONA DE CRÉDITO (seção 11) fica isolada por
// divisor, sem nenhum elemento promocional dentro — guardrail 1, inegociável. Mecânicas
// visíveis nessa tela: check-in, missões, roleta, prova social, contagem regressiva (estática,
// ver FlashDeals.tsx) e botão flutuante de pontos — as 6 pedidas no briefing.
export default function A1Dashboard() {
  return (
    <Shell navBar={<BottomNavA ativo="Início" />}>
      <ProtoBadge />
      <div className="space-y-5 p-4 pb-24">
        {/* 1. Header compacto */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Logo size="sm" />
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Notificações, 3 novas"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted"
              >
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white">
                  3
                </span>
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                {USUARIO_A.nome[0]}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5">
            <MagnifyingGlass size={16} className="text-muted-foreground" />
            <input
              placeholder="Buscar serviço, parceiro ou oferta"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* 2. Âncora de hierarquia — card de score + 3 atalhos grandes */}
        <div className="space-y-3 rounded-2xl bg-gradient-to-br from-[#FD5F31] to-[#FA9832] p-4 text-white shadow-card">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">Score financeiro</p>
            <p className="mt-1 text-3xl font-bold">{USUARIO_A.saldoScore}</p>
            <p className="mt-1 text-xs text-white/80">Olá, {USUARIO_A.nome} — seu score está ótimo hoje.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ATALHOS_GRANDES.map((a) => {
              const Icon = ICON_MAP_A[a.icone];
              return (
                <button
                  key={a.id}
                  type="button"
                  className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-xl bg-white/15 px-1"
                >
                  <Icon size={22} />
                  <span className="text-center text-xs font-semibold leading-tight">{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Faixa de check-in diário */}
        <CheckInStrip dias={CHECKIN_SEMANA} />

        {/* 4. Grade de 20 atalhos */}
        <div className="grid grid-cols-5 gap-x-2 gap-y-4">
          {ATALHOS_GRID.map((item) => {
            const Icon = ICON_MAP_A[item.icone];
            return (
              <button key={item.id} type="button" className="relative flex flex-col items-center gap-1.5">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Icon size={22} />
                  {"selo" in item && item.selo ? (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white">
                      {item.selo}
                    </span>
                  ) : null}
                </div>
                {item.tag && (
                  <span className="absolute -top-1 right-0 rounded-full bg-[#DC2626] px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {item.tag}
                  </span>
                )}
                <span className="text-center text-xs font-medium leading-tight text-foreground">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. Carrossel de banners */}
        <BannerCarousel banners={BANNERS_A1} />

        {/* 6. Faixa de cupons */}
        <CouponStrip cupons={CUPONS} />

        {/* 7. Ofertas relâmpago */}
        <FlashDeals ofertas={OFERTAS_RELAMPAGO} />

        {/* 8. Missões do dia */}
        <DailyMissions missoes={MISSOES_DIA} />

        {/* 9. Gire e ganhe */}
        <SpinWheel premio={PREMIO_ROLETA} />

        {/* 10. Prova social */}
        <SocialProofTicker mensagens={PROVA_SOCIAL} />

        {/* 11. Zona de crédito — isolada por divisor, sem nenhum elemento promocional dentro
            (guardrail 1: sem banner, cupom, tag, contagem ou missão aqui). */}
        <div className="space-y-4 border-t-2 border-border pt-5">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Para você agora</h3>
            {PARA_VOCE_AGORA_CREDITO.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-white px-3 py-3 shadow-card"
              >
                <p className="text-xs font-medium leading-snug text-foreground">{card.titulo}</p>
                <span className="flex h-11 shrink-0 items-center gap-0.5 text-xs font-semibold text-primary">
                  {card.cta} <CaretRight size={12} />
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Seus produtos</h3>
            <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {PRODUTOS_ATIVOS_A1.map((p) => (
                <div key={p.id} className="w-[160px] shrink-0 rounded-xl border border-border bg-white p-3 shadow-card">
                  <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.detalhe}</p>
                  <p className="mt-1.5 text-sm font-bold text-primary">{p.valor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 12. Parceiros em destaque */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Parceiros em destaque</h3>
          <div className="grid grid-cols-2 gap-3">
            {PARCEIROS_DESTAQUE.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-white p-3 shadow-card">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                  {p.nome[0]}
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.categoria}</p>
                <span className="mt-1 inline-block rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
                  {p.selo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 13. Botão flutuante de pontos */}
      <FloatingPointsButton pontos={USUARIO_A.pontos} />
    </Shell>
  );
}
