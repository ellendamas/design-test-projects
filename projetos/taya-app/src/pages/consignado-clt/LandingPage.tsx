import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CaretDown,
  CheckCircle,
  Lightning,
  Lock,
  Spinner,
  TrendDown,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Dados estáticos
// ---------------------------------------------------------------------------

const features = [
  {
    icon: TrendDown,
    title: "Taxa mais baixa do mercado",
    desc: "A parcela sai direto da folha — isso reduz o risco e o custo para você.",
  },
  {
    icon: Lightning,
    title: "Sem aprovação da empresa",
    desc: "100% digital. Contrate agora e receba em minutos.",
  },
  {
    icon: CalendarCheck,
    title: "Parcela fixa todo mês",
    desc: "O valor sai sempre igual, antes de você receber o salário.",
  },
];

const pills = ["100% digital", "Sem aprovação da empresa", "Parcela fixa"];

const faq = [
  {
    q: "Quem pode contratar?",
    a: "Qualquer trabalhador com carteira assinada (CLT) ativa. A contratação é 100% digital, sem precisar ir a nenhuma agência.",
  },
  {
    q: "Como funciona o desconto em folha?",
    a: "A parcela é descontada direto no seu salário antes de você receber. Isso garante taxas menores, porque o risco de inadimplência é quase zero.",
  },
  {
    q: "Precisa de aprovação da minha empresa?",
    a: "Não. A consulta é feita diretamente na Carteira de Trabalho Digital. Sua empresa não é notificada nem precisa autorizar nada.",
  },
  {
    q: "Quanto tempo leva para receber?",
    a: "Após a aprovação, o valor cai na sua conta em até 1 dia útil. Em muitos casos, o crédito aparece no mesmo dia.",
  },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function ConsignadoCLTLandingPage() {
  const navigate = useNavigate();
  const [isConsulting, setIsConsulting] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const handleConsult = () => {
    setIsConsulting(true);
    navigate("/consignado-clt/loading");
  };

  return (
    <SubPageLayout title="Consignado CLT">
      <div className="space-y-6 pb-24">

        {/* Hero */}
        <div className="relative min-h-[200px] overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop&crop=center"
            alt="Consignado CLT"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#A33D05] via-[#E8590A]/70 to-transparent" />
          <div className="relative z-10 flex min-h-[200px] flex-col justify-end p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              Crédito do trabalhador CLT
            </p>
            <h1 className="mb-2 text-2xl font-bold leading-snug text-white">
              O crédito com as menores taxas do mercado
            </h1>
            <p className="text-sm text-white/80">
              Em parcelas fixas, descontadas direto no salário
            </p>
          </div>
        </div>

        {/* Pills de benefício rápido */}
        <div className="flex flex-wrap gap-2">
          {pills.map((label) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm"
            >
              <CheckCircle size={12} className="text-[#E8590A]" />
              {label}
            </div>
          ))}
        </div>

        {/* Card de features */}
        <Card className="border-border shadow-sm">
          <CardContent className="divide-y divide-border pt-0">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3 py-4 first:pt-5 last:pb-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEF0E7] text-[#E8590A]">
                  <f.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FAQ accordion */}
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
                      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
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

        {/* Consentimento Dataprev */}
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-start gap-2">
            <Lock size={14} className="mt-0.5 shrink-0 text-[#E8590A]" />
            <p className="text-xs text-muted-foreground">
              Ao continuar, você autoriza a consulta dos seus dados na Carteira de Trabalho
              Digital (Dataprev).{" "}
              <button
                type="button"
                className="text-xs text-[#E8590A] underline underline-offset-2"
                onClick={() => {
                  // TODO: abrir modal de Termos de Consulta
                }}
              >
                Ver Termos de Consulta
              </button>
            </p>
          </div>
        </div>

        {/* CTA fixo no rodapé */}
        <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
          <button
            type="button"
            disabled={isConsulting}
            onClick={handleConsult}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold text-white transition-colors ${
              isConsulting ? "cursor-not-allowed bg-[#E8590A] opacity-70" : "bg-[#E8590A] hover:bg-[#d04e08]"
            }`}
          >
            {isConsulting ? (
              <>
                <Spinner size={20} className="animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                Consultar minha oferta
                <ArrowRight size={16} className="ml-1" />
              </>
            )}
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
