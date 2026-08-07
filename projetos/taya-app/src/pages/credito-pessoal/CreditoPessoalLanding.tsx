import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CaretDown,
  CheckCircle,
  CurrencyCircleDollar,
  ClockCountdown,
  Lock,
  ShieldCheck,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { FAQ } from "@/data/faq";

// ---------------------------------------------------------------------------
// Dados estáticos
// ---------------------------------------------------------------------------

const beneficios = [
  {
    icon: CurrencyCircleDollar,
    titulo: "Valor liberado diretamente na sua conta",
    desc: "Sem precisar comprometer FGTS ou margem consignável.",
  },
  {
    icon: ClockCountdown,
    titulo: "Resposta rápida, sem enrolação",
    desc: "Consulta em segundos. Proposta na tela em instantes.",
  },
  {
    icon: CalendarCheck,
    titulo: "Parcelas fixas e previsíveis",
    desc: "Você escolhe o prazo e sabe exatamente quanto vai pagar todo mês.",
  },
  {
    icon: ShieldCheck,
    titulo: "100% seguro e regulamentado",
    desc: "Operado pela Zema Financeira, empresa devidamente licenciada pelo Banco Central.",
  },
];

const pills = ["100% digital", "Sem consulta de margem", "Resposta imediata"];

const faq = FAQ["credito-pessoal"];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function CreditoPessoalLanding() {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  return (
    <SubPageLayout title="Crédito Pessoal">
      <div className="space-y-6 pb-24 md:mx-auto md:max-w-[640px]">

        {/* ── Hero com imagem e gradiente ── */}
        <div className="relative min-h-[200px] overflow-hidden rounded-2xl">
          <img
            src="/images/banner-intro-credito-pessoal.png"
            alt="Crédito Pessoal"
            className="absolute inset-0 h-full w-full object-cover object-right"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Overlay mobile — cor primária sólida com opacidade + filtro escuro pra contraste do texto */}
          <div className="absolute inset-0 bg-[#FD5F31]/75 md:hidden" />
          <div className="absolute inset-0 bg-black/25 md:hidden" />
          {/* Overlay desktop — gradiente horizontal, imagem visível à direita */}
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background: "linear-gradient(90deg, #D94E28 0%, rgba(253, 95, 49, 0.70) 40%, rgba(253, 95, 49, 0.00) 85%)",
            }}
          />
          <div className="relative z-10 flex min-h-[200px] max-w-full flex-col justify-end p-5 md:max-w-[55%]">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/75">
              Crédito Pessoal · Zema Financeira
            </p>
            <h1 className="mb-2 text-2xl font-bold leading-tight text-white">
              Dinheiro na sua conta em instantes
            </h1>
            <p className="text-sm text-white/85">
              Sem precisar de FGTS ou desconto em folha
            </p>
          </div>
        </div>

        {/* ── Pills de benefícios rápidos ── */}
        <div className="flex flex-wrap gap-2">
          {pills.map((label) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm"
            >
              <CheckCircle size={12} className="text-[#FD5F31]" weight="fill" />
              {label}
            </div>
          ))}
        </div>

        {/* ── Bloco de parceria Pode Já × Zema Financeira ── */}
        <div className="rounded-2xl border border-border bg-white p-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src="/images/logo-zema-financeira.png"
              alt="Zema Financeira"
              className="h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p className="text-xs font-medium text-muted-foreground">Parceiro oficial</p>
            <p className="text-xs text-muted-foreground leading-relaxed w-full">
              A Zema Financeira é uma instituição financeira autorizada pelo Banco Central, com mais de 30 anos de mercado e presença em todo o Brasil.
            </p>
          </div>
        </div>

        {/* ── Card de benefícios ── */}
        <Card className="border-border shadow-sm">
          <CardContent className="divide-y divide-border pt-0">
            {beneficios.map((b) => (
              <div key={b.titulo} className="flex gap-3 py-4 first:pt-5 last:pb-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF3EE] text-[#FD5F31]">
                  <b.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.titulo}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── FAQ ── */}
        <div className="space-y-2">
          <p className="mb-3 text-base font-semibold text-foreground">
            Perguntas frequentes
          </p>
          {faq.map((item, i) => {
            const open = faqOpen === i;
            return (
              <Card key={item.q} className="border-border">
                <CardContent className="p-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                    onClick={() => setFaqOpen(open ? null : i)}
                  >
                    <span className="text-sm font-medium text-foreground">{item.q}</span>
                    <CaretDown
                      size={16}
                      className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <p className="px-4 pb-4 text-xs leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Nota de segurança / operador ── */}
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-start gap-2">
            <Lock size={14} className="mt-0.5 shrink-0 text-[#FD5F31]" />
            <p className="text-xs text-muted-foreground">
              Operado por{" "}
              <span className="font-semibold text-foreground">Zema Financeira</span>.
              Seus dados são protegidos conforme a LGPD e a regulamentação do Banco Central.
            </p>
          </div>
        </div>

        {/* ── CTA fixo no rodapé ── */}
        <div className="sticky bottom-20 z-40 pb-3 md:bottom-0">
          <button
            type="button"
            onClick={() => navigate("/credito-pessoal/dados")}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#FD5F31] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Quero simular agora
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
