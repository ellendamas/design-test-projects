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
  Vault,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Dados estáticos
// ---------------------------------------------------------------------------

const features = [
  {
    icon: Vault,
    title: "Use seu próprio dinheiro",
    desc: "O FGTS já é seu. A gente só adianta o que é seu por direito.",
  },
  {
    icon: Lightning,
    title: "Aprovação imediata",
    desc: "Sem consulta ao Serasa. Sem análise de crédito.",
  },
  {
    icon: CalendarCheck,
    title: "Parcelas automáticas",
    desc: "Descontadas do seu saldo aniversário, uma vez por ano.",
  },
];

const pills = ["Receba em minutos", "Sem análise de crédito", "100% digital"];

const faq = [
  {
    q: "O que é o Saque Aniversário?",
    a: "É uma modalidade do FGTS que permite sacar uma parte do saldo todo ano, no mês do seu aniversário. Você precisa optar por ela no app do FGTS para poder antecipar.",
  },
  {
    q: "Preciso optar pelo Saque Aniversário antes?",
    a: "Sim. Se você ainda não optou, a gente te guia pelo processo — leva menos de 2 minutos no app do FGTS.",
  },
  {
    q: "Quem pode antecipar?",
    a: "Qualquer trabalhador com FGTS ativo que tenha optado pelo Saque Aniversário. Não há consulta ao Serasa ou análise de crédito.",
  },
  {
    q: "Quanto tempo leva para receber?",
    a: "Após a aprovação, o valor cai na sua conta em até 15 minutos.",
  },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function FGTSLandingPage() {
  const navigate = useNavigate();
  const [isConsulting, setIsConsulting] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const handleConsult = () => {
    setIsConsulting(true);
    navigate("/fgts/copiloto");
  };

  return (
    <SubPageLayout title="Antecipação FGTS">
      <div className="space-y-6 pb-24">

        {/* Hero */}
        <div className="relative min-h-[200px] overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80&fit=crop&crop=center"
            alt="Antecipação FGTS"
            className="absolute inset-0 h-full w-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80&fit=crop&crop=center";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#D94E28] via-[#FD5F31]/70 to-transparent" />
          <div className="relative z-10 flex min-h-[200px] flex-col justify-end p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              ANTECIPAÇÃO FGTS
            </p>
            <h1 className="mb-2 text-2xl font-bold leading-snug text-white">
              Receba seu saldo do FGTS agora
            </h1>
            <p className="text-sm text-white/80">
              Sem burocracia. O dinheiro cai na sua conta em minutos.
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
              <CheckCircle size={12} className="text-[#FD5F31]" />
              {label}
            </div>
          ))}
        </div>

        {/* Card de features */}
        <Card className="border-border shadow-sm">
          <CardContent className="divide-y divide-border pt-0">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3 py-4 first:pt-5 last:pb-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF3EE] text-[#FD5F31]">
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
          <p className="mb-3 text-base font-semibold text-foreground">Perguntas frequentes</p>
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

        {/* Caixa informativa BMP */}
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-start gap-2">
            <Lock size={14} className="mt-0.5 shrink-0 text-[#FD5F31]" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Para antecipar, você precisará autorizar nossa parceira{" "}
              <span className="font-medium text-foreground">BMP SOCIEDADE DE CREDITO DIRETO S.A</span> a consultar
              seu saldo no app do FGTS. A gente te guia em cada passo.
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
              isConsulting
                ? "cursor-not-allowed bg-[#FD5F31] opacity-70"
                : "bg-[#FD5F31] hover:bg-[#d04e08] active:scale-[0.98]"
            }`}
          >
            {isConsulting ? (
              <>
                <Spinner size={20} className="animate-spin" />
                Abrindo copiloto...
              </>
            ) : (
              <>
                Quero antecipar meu FGTS
                <ArrowRight size={16} className="ml-1" />
              </>
            )}
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
