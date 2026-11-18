import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { animate, useMotionValue } from "framer-motion";
import {
  ArrowsClockwise,
  Bag,
  Bank,
  Car,
  CaretLeft,
  CaretRight,
  CreditCard,
  DeviceMobile,
  Eye,
  EyeSlash,
  ForkKnife,
  Gauge,
  HouseLine,
  Info,
  Lightning,
  Pill,
  Receipt,
  Tag,
  TrendUp,
} from "@phosphor-icons/react";
import { usePrivacy } from "@/context/PrivacyContext";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { getDestaques } from "./vidaFinanceiraData";

// Ícone de info que, ao tocar, abre/fecha uma bolha de texto explicando um termo (ex.: por que
// "Limite da conta" é sobre cheque especial). Toque de novo, ou em outro, fecha.
export function InfoTooltip({ texto }: { texto: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAberto((v) => !v);
        }}
        className="flex h-4 w-4 items-center justify-center text-muted-foreground"
        aria-label="Mais informações"
      >
        <Info size={14} />
      </button>
      {aberto && (
        <div
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-1 w-48 -translate-x-1/2 rounded-lg bg-foreground px-3 py-2 text-left text-xs font-normal text-white shadow-lg"
        >
          {texto}
        </div>
      )}
    </span>
  );
}

// Tooltip de gráfico (recharts `content`) com o visual validado pela Ellen no Ritmo de gastos
// da Home: box branco arredondado com sombra, bolinha colorida por série e valor em negrito.
// Reaproveitado em todo gráfico de barra/linha do módulo, no lugar do tooltip padrão do recharts.
type ChartTooltipPayloadItem = {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
  fill?: string;
  payload?: Record<string, unknown>;
};

export function ChartTooltip({
  active,
  payload,
  label,
  formatter = (value: number) => `R$ ${value.toLocaleString("pt-BR")}`,
  nameFor,
}: {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string | number;
  formatter?: (value: number) => string;
  nameFor?: (item: ChartTooltipPayloadItem) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-white p-3 text-xs shadow-lg">
      {label !== undefined && <p className="mb-2 font-semibold text-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((item, i) => {
          const name = nameFor ? nameFor(item) : (item.name ?? (item.payload?.nome as string | undefined) ?? String(item.dataKey ?? ""));
          const color = item.color ?? item.fill ?? (item.payload?.fill as string | undefined) ?? "#FD5F31";
          return (
            <div key={`${item.dataKey ?? i}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {name}
              </span>
              <span className="font-semibold text-foreground">{formatter(Number(item.value))}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mesmo visual acima, mas para o par "atual vs anterior" (ex.: Ritmo de gastos da Home, Gastos
// por período): duas linhas com bolinha + valor, e um selo de Aumento/Redução com a variação %.
export function ComparativoTooltip({
  active,
  payload,
  label,
  labelPrefix = "",
  atualLabel = "Este mês",
  anteriorLabel = "Mês passado",
}: {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string | number;
  labelPrefix?: string;
  atualLabel?: string;
  anteriorLabel?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const atual = payload.find((p) => p.dataKey === "atual")?.value ?? 0;
  const anterior = payload.find((p) => p.dataKey === "anterior")?.value ?? 0;
  const corAtual = payload.find((p) => p.dataKey === "atual")?.color ?? "#16A34A";
  const delta = atual - anterior;
  const pct = anterior > 0 ? Math.round((Math.abs(delta) / anterior) * 100) : 0;
  return (
    <div className="rounded-xl border border-border bg-white p-3 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-foreground">{labelPrefix}{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: corAtual }} />
          {atualLabel}
        </span>
        <span className="font-semibold text-foreground">R$ {atual.toLocaleString("pt-BR")}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[#C4C4C4]" />
          {anteriorLabel}
        </span>
        <span className="font-semibold text-foreground">R$ {anterior.toLocaleString("pt-BR")}</span>
      </div>
      <div className={`mt-2 rounded-lg px-2 py-1 text-center font-semibold ${delta > 0 ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#DCFCE7] text-[#15803D]"}`}>
        {delta > 0 ? "Aumento" : "Redução"} {delta > 0 ? "+" : "-"}R$ {Math.abs(delta).toLocaleString("pt-BR")} ({pct}%)
      </div>
    </div>
  );
}

// Replica os padrões de SensitiveData e PrivacyToggle do App.tsx (não são exportados de lá),
// mesmo padrão já usado em outras páginas fora de App.tsx (ex.: assistencias/ConfirmarDadosPage.tsx).
// SensitiveData ganhou a variante `light`, que o App.tsx não precisa: texto branco sobre fundo
// colorido (o box de saldo), sem a qual o valor ficava em preto sobre o degradê laranja.
export function SensitiveData({ value, type = "text", light = false }: { value: string; type?: "cpf" | "phone" | "currency" | "text"; light?: boolean }) {
  const { dataVisible } = usePrivacy();
  const masked = { cpf: "•••.•••.•••-••", phone: "(••) •••••-••••", currency: "R$ ••••", text: "••••••••" }[type];
  return <span className={`font-medium ${light ? "text-white" : "text-foreground"}`}>{dataVisible ? value : masked}</span>;
}

// Valor em R$ que conta a partir de 0 quando entra na tela, mesmo padrão já usado em
// "seu saldo" do seubônus (App.tsx). Só pros valores principais (totais), não pra cada linha.
export function AnimatedCurrency({
  value,
  light = false,
  prefix = "",
  className = "",
}: {
  value: number;
  light?: boolean;
  prefix?: string;
  className?: string;
}) {
  const { dataVisible } = usePrivacy();
  const animatedValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!dataVisible) return;
    const controls = animate(animatedValue, value, { duration: 0.7, ease: "easeOut" });
    const unsub = animatedValue.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, dataVisible, animatedValue]);

  return (
    <span className={`font-medium ${light ? "text-white" : "text-foreground"} ${className}`}>
      {dataVisible ? `${prefix}R$ ${display.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "R$ ••••"}
    </span>
  );
}

// Número (ou %, qualquer coisa não-monetária, por isso sem máscara de privacidade) que conta
// a partir de 0 quando entra na tela.
export function AnimatedCount({ value, formatter = (v) => String(Math.round(v)), className = "" }: { value: number; formatter?: (v: number) => string; className?: string }) {
  const animatedValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(animatedValue, value, { duration: 0.6, ease: "easeOut" });
    const unsub = animatedValue.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, animatedValue]);

  return <span className={className}>{formatter(display)}</span>;
}

// Avatar de banco (círculo colorido com a inicial do nome). Os bancos mockados no
// OpenFinanceContext não têm logo real, então é o mesmo substituto já usado em Minha Conta >
// Open Finance e no saldo por banco.
export function BankAvatar({ banco, size = 32 }: { banco: { nome: string; cor: string }; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: banco.cor, width: size, height: size }}
    >
      {banco.nome.charAt(0)}
    </span>
  );
}

// Badge (elipse) de cartão: ícone do banco + final do número, usado como seletor nas telas de
// cartão (Home, Faturas, Parcelas). `null` representa "Todos os cartões" (nenhum selecionado).
export function CardBadge({
  cartao,
  selected,
  onClick,
}: {
  cartao: { nome: string; bancoCor: string; final: string } | null;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        selected ? "border-primary bg-primary-light text-primary" : "border-border bg-white text-foreground"
      }`}
    >
      {cartao ? (
        <>
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: cartao.bancoCor }}>
            {cartao.nome.charAt(0)}
          </span>
          **** {cartao.final}
        </>
      ) : (
        "Todos os cartões"
      )}
    </button>
  );
}

// Mesmo badge, mas só como informação (sem clique, um pouco menor). Usado no card de
// rotativo em Faturas, pra deixar claro de qual cartão/banco é aquele rotativo.
export function CardBadgeStatic({ cartao }: { cartao: { nome: string; bancoCor: string; final: string } }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-white/70 px-2 py-1 text-[11px] font-semibold text-amber-900">
      <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: cartao.bancoCor }}>
        {cartao.nome.charAt(0)}
      </span>
      **** {cartao.final}
    </span>
  );
}

// Linha com arraste pelo mouse além do scroll por toque/trackpad. Usada nos badges de
// cartão, que tendem a crescer conforme mais bancos são conectados.
export function DragScrollRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    drag.current = { isDown: true, startX: e.clientX, scrollLeft: el.scrollLeft };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !drag.current.isDown) return;
    el.scrollLeft = drag.current.scrollLeft - (e.clientX - drag.current.startX);
  };
  const endDrag = () => {
    drag.current.isDown = false;
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className={`flex cursor-grab gap-2 overflow-x-auto active:cursor-grabbing ${className}`}
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}

// Cor da barra de progresso de limite: normal até 70%, aviso de 70% a 99%, vermelho a partir
// de 100% (quando o usado alcança ou passa do limite).
export function corLimite(pct: number) {
  if (pct >= 100) return "bg-[#DC2626]";
  if (pct >= 70) return "bg-amber-500";
  return "bg-primary";
}

const CARTOES_TABS = [
  { value: "/vida-financeira/cartoes/faturas", label: "Faturas" },
  { value: "/vida-financeira/cartoes/parcelas", label: "Parcelas" },
  { value: "/vida-financeira/cartoes/limites", label: "Limites" },
];

// Seletor "Faturas / Parcelas / Limites" no topo das 3 telas internas de cartão, pra trocar
// de sub-seção sem precisar voltar pra Vida financeira a cada vez. No topo da página, os 3
// botões dividem a largura toda do conteúdo com um rótulo maior; ao rolar, gruda logo abaixo
// do header (com fundo branco atrás, pra não ficar confuso com o conteúdo) e o rótulo volta
// ao tamanho padrão dos outros seletores da tela.
//
// DESIGN ONLY: esse componente precisa ser o próprio elemento sticky, retornado direto (sem
// nenhuma div "só pra agrupar" por fora). Um sticky só tem espaço pra deslizar dentro da altura
// do seu pai direto no DOM. Um wrapper extra, menor que a página inteira, deixava esse pai
// baixo demais e o sticky não tinha corredor nenhum pra grudar (bug anterior: a barra trocava
// de estilo ao rolar, mas nunca ficava fixa). Sendo o próprio primeiro filho do `space-y-4` da
// página, o pai passa a ser a página inteira, alta o bastante pra sticky funcionar de verdade.
export function CartoesSubNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stuck, setStuck] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) setHeaderHeight(header.getBoundingClientRect().height);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = barRef.current;
      if (!el) return;
      setStuck(el.getBoundingClientRect().top <= headerHeight + 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headerHeight]);

  return (
    // z-20: precisa ficar acima do conteúdo normal da página (ex.: o gráfico logo abaixo, que
    // sem isso passava por cima da barra ao grudar) e a posição já garante que não encosta no
    // header, então não precisa mais ficar propositalmente abaixo dele.
    <div
      ref={barRef}
      className={`sticky z-20 mb-2 -mx-4 px-4 md:mx-0 md:px-0 ${stuck ? "bg-white py-2 shadow-sm" : ""}`}
      style={{ top: headerHeight }}
    >
      <div className="grid grid-cols-3 gap-2">
        {CARTOES_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => navigate(tab.value)}
            className={`rounded-full font-semibold transition-all ${stuck ? "py-1.5 text-xs" : "py-2.5 text-sm"} ${
              location.pathname === tab.value ? "bg-primary text-white" : "border border-border text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Grupo de botões (pill) reutilizado nos seletores de período/banco/mês das telas de Vida
// financeira. Mesmo visual que já era usado isoladamente no seletor de período de Gastos.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
            value === opt.value ? "bg-primary text-white" : "border border-border text-muted-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Ícones das categorias de gasto, usados em Gastos e em Atividades (cada transação mostra a
// categoria). Mapeados pela string salva em vidaFinanceiraData.ts.
export const CATEGORIA_ICON_MAP: Record<string, ReactNode> = {
  ForkKnife: <ForkKnife size={16} />,
  Car: <Car size={16} />,
  DeviceMobile: <DeviceMobile size={16} />,
  Tag: <Tag size={16} />,
  HouseLine: <HouseLine size={16} />,
  Bag: <Bag size={16} />,
  Pill: <Pill size={16} />,
};

const DESTAQUE_ICON_MAP: Record<string, ReactNode> = {
  ...CATEGORIA_ICON_MAP,
  Receipt: <Receipt size={16} />,
  Bank: <Bank size={16} />,
  CreditCard: <CreditCard size={16} />,
  ArrowsClockwise: <ArrowsClockwise size={16} />,
  Gauge: <Gauge size={16} />,
  TrendUp: <TrendUp size={16} />,
};

const MAX_DESTAQUES_CARROSSEL = 4;

// Carrossel "Para você": mesmo padrão visual do RecomendacoesCarousel da dashboard (cards
// brancos, sem X pra dispensar: um destaque não é uma sugestão pra ignorar, é um recorte do
// dado de agora, então ele muda sozinho quando o dado muda). Mostra só os primeiros
// MAX_DESTAQUES_CARROSSEL; havendo mais, o último card vira "Ver mais" pra tela com a lista
// completa. A variante `light` é pra usar dentro do box laranja de saldo.
export function VidaFinanceiraInsightsCarousel({ variant = "default" }: { variant?: "light" | "default" }) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const { bancosConectados } = useOpenFinance();

  const todosDestaques = getDestaques(bancosConectados);
  const temMais = todosDestaques.length > MAX_DESTAQUES_CARROSSEL;
  const destaques = temMais ? todosDestaques.slice(0, MAX_DESTAQUES_CARROSSEL) : todosDestaques;

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth - el.clientWidth > 2;
    setCanScroll(hasOverflow);
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [destaques.length]);

  if (destaques.length === 0) return null;

  const cardClass = `flex min-h-[120px] w-[180px] min-w-[180px] max-w-[180px] flex-col justify-between rounded-xl p-3 text-left shadow-sm ${
    variant === "light" ? "border-0 bg-white/95" : "border border-border bg-white"
  }`;

  return (
    <div className="relative">
      <p className={`mb-2 px-1 text-sm font-medium ${variant === "light" ? "text-white/80" : "text-foreground"}`}>Destaques do mês</p>
      <div
        ref={scrollRef}
        className={`flex gap-2 ${canScroll ? "overflow-x-auto" : "overflow-x-hidden"} px-1 md:[&::-webkit-scrollbar]:hidden`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {destaques.map((d) => (
          <button key={d.id} type="button" onClick={() => navigate(d.destino)} className={cardClass}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]">
              {DESTAQUE_ICON_MAP[d.icone] ?? <Lightning size={16} />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{d.titulo}</p>
              <p className="truncate text-sm font-semibold text-foreground">{d.subtitulo}</p>
              {d.tipoValor === "currency" ? (
                <SensitiveData value={`R$ ${d.valor.toLocaleString("pt-BR")}`} type="currency" />
              ) : (
                <span className="text-sm font-medium text-foreground">{d.valor}%</span>
              )}
            </div>
          </button>
        ))}
        {temMais && (
          <button
            type="button"
            onClick={() => navigate("/vida-financeira/destaques")}
            className={`flex min-h-[120px] w-fit shrink-0 items-center justify-center rounded-xl border border-dashed px-3 py-3 ${
              variant === "light" ? "border-white/50" : "border-muted-foreground/40"
            }`}
          >
            {/* DESIGN ONLY: writing-mode (não rotate numa caixa fixa) deixa o próprio card
                fit-content à largura do texto deitado, bem mais fino que os outros. */}
            <span
              className={`text-sm font-semibold ${variant === "light" ? "text-white" : "text-foreground"}`}
              style={{ writingMode: "vertical-rl" }}
            >
              Ver mais
            </span>
          </button>
        )}
      </div>
      <div className={`pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 md:flex ${canScroll ? "" : "opacity-0"}`}>
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" })}
          disabled={!canLeft}
          className="pointer-events-auto -ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#FD5F31] shadow disabled:opacity-40"
          aria-label="Ver anteriores"
        >
          <CaretLeft size={16} />
        </button>
      </div>
      <div className={`pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 md:flex ${canScroll ? "" : "opacity-0"}`}>
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" })}
          disabled={!canRight}
          className="pointer-events-auto -mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#FD5F31] shadow disabled:opacity-50"
          aria-label="Ver próximos"
        >
          <CaretRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Banner "ads" pra Saúde por Assinatura, numa sessão própria embaixo dos destaques (pedido da
// Ellen em 16/11/2026, modelo em Figma: node 365:22 do arquivo "Pode Já | Protótipos"). Fica
// fora do carrossel de destaques: é publicidade de um produto, não um fato sobre os dados do
// usuário, por isso não some quando os destaques mudam nem compete pelo mesmo espaço de scroll.
export function VidaFinanceiraSaudeBanner() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate("/assistencias/saude")}
      className="relative flex w-full items-center overflow-hidden rounded-lg border border-[#EBEAE9] text-left"
    >
      <img src="/images/vida-financeira-saude-banner.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, #FEF2EC 39%, rgba(254,242,236,0.7) 62%, rgba(254,242,236,0) 85%)" }}
      />
      <div className="relative flex flex-1 items-center gap-0.5 px-3 py-3">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs text-[#1C1917]/85">Gaste menos com farmácia e exames</p>
          <p className="text-xl font-semibold leading-tight text-[#E8590A]">Conheça o Saúde por Assinatura Pode Já</p>
        </div>
        <div className="h-[83px] w-[112px] shrink-0" aria-hidden />
      </div>
    </button>
  );
}
