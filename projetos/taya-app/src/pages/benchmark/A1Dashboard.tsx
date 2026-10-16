import { Bell, CaretRight } from "@phosphor-icons/react";
import { Logo } from "@/components/Logo";
import { Shell } from "./components/Shell";
import { BottomNavA } from "./components/BottomNavA";
import { ICON_MAP } from "./components/iconMap";
import { ATALHOS_A, CROSS_SELL_A1, PARA_VOCE_AGORA_A, PRODUTOS_ATIVOS, USUARIO } from "./mockData";

// A1 — Dashboard do Grupo A (Alipay pré-2026): densidade máxima, tudo exposto sem scroll de
// descoberta — grid de atalhos, carrossel de banners, recomendações e produtos ativos todos
// visíveis já na primeira tela.
export default function A1Dashboard() {
  return (
    <Shell navBar={<BottomNavA ativo="Início" />}>
      <div className="space-y-5 p-4 pb-6">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
              {USUARIO.nome[0]}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#FD5F31] to-[#FA9832] p-4 text-white shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">{USUARIO.saldoScoreLabel}</p>
          <p className="mt-1 text-3xl font-bold">{USUARIO.saldoScore}</p>
          <p className="mt-1 text-xs text-white/80">Olá, {USUARIO.nome} — seu score está ótimo hoje.</p>
        </div>

        <div className="grid grid-cols-4 gap-y-4">
          {ATALHOS_A.map((item) => {
            const Icon = ICON_MAP[item.icone];
            return (
              <button key={item.id} type="button" className="flex flex-col items-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Icon size={22} />
                </div>
                <span className="text-center text-[10px] font-medium leading-tight text-foreground">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Carrossel de cross-sell — mesmo tratamento visual do CrossSellCarousel.tsx do app
            real (foto de fundo + gradiente laranja + texto real), versão simplificada sem o
            drag-to-scroll completo do PeekCarousel: scroll nativo com snap já é suficiente
            pra esse mock. */}
        <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollSnapType: "x mandatory" }}>
          {CROSS_SELL_A1.map((item) => (
            <div
              key={item.id}
              className="relative aspect-[351/177] w-[240px] shrink-0 overflow-hidden rounded-2xl shadow-card"
              style={{ scrollSnapAlign: "start" }}
            >
              <img src={item.imagem} alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, #D94E28 0%, rgba(217, 78, 40, 0.55) 45%, rgba(217, 78, 40, 0.05) 75%)",
                }}
              />
              <div className="relative z-10 flex h-full max-w-[75%] flex-col justify-center gap-1 p-3.5">
                <h3 className="text-xs font-bold leading-snug text-white">{item.titulo}</h3>
                <p className="line-clamp-2 text-[10px] leading-relaxed text-white/85">{item.descricao}</p>
                <span className="mt-1 inline-flex w-fit items-center rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-[#D94E28]">
                  {item.preco ?? "Conhecer"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Para você agora</h3>
          {PARA_VOCE_AGORA_A.map((card) => (
            <div key={card.id} className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-2.5 shadow-card">
              <p className="pr-2 text-xs font-medium text-foreground">{card.titulo}</p>
              <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary">
                {card.cta} <CaretRight size={12} />
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Seus produtos ativos</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {PRODUTOS_ATIVOS.map((p) => (
              <div key={p.id} className="w-[160px] shrink-0 rounded-xl border border-border bg-white p-3 shadow-card">
                <p className="text-xs font-semibold text-foreground">{p.nome}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{p.detalhe}</p>
                <p className="mt-1.5 text-sm font-bold text-primary">{p.valor}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
