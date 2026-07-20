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

const faq = [
  {
    q: "Quem pode contratar?",
    a: "Qualquer pessoa física com CPF regular, maior de 18 anos e com renda comprovável. Não é necessário ter vínculo empregatício CLT nem FGTS.",
  },
  {
    q: "Precisa de garantia?",
    a: "Não. O Crédito Pessoal da Zema Financeira é um crédito sem garantia real — não é preciso colocar bens como garantia para contratar.",
  },
  {
    q: "Em quanto tempo o dinheiro cai?",
    a: "Após a aprovação e assinatura do contrato, o valor é transferido em até 1 dia útil. Na maioria dos casos, o crédito aparece no mesmo dia.",
  },
  {
    q: "Afeta meu score de crédito?",
    a: "A consulta inicial é feita de forma simplificada. Em caso de aprovação e contratação, o contrato é registrado nas bureaus de crédito conforme exigido pelo Banco Central.",
  },
];

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
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&fit=crop&crop=center"
            alt="Crédito Pessoal"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#A33D05] via-[#E8590A]/70 to-transparent" />
          <div className="relative z-10 flex min-h-[200px] flex-col justify-end p-5">
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
              <CheckCircle size={12} className="text-[#E8590A]" weight="fill" />
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEF0E7] text-[#E8590A]">
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
            <Lock size={14} className="mt-0.5 shrink-0 text-[#E8590A]" />
            <p className="text-xs text-muted-foreground">
              Operado por{" "}
              <span className="font-semibold text-foreground">Zema Financeira</span>.
              Seus dados são protegidos conforme a LGPD e a regulamentação do Banco Central.
            </p>
          </div>
        </div>

        {/* ── CTA fixo no rodapé ── */}
        <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
          <button
            type="button"
            onClick={() => navigate("/credito-pessoal/dados")}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Quero simular agora
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
