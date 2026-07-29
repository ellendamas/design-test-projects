import { useState } from "react";
import { toast } from "sonner";
import {
  CaretDown,
  CheckCircle,
  Coins,
  Heartbeat,
  ShieldCheck,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import { useInteresse } from "@/context/InteresseContext";

// ---------------------------------------------------------------------------
// Dados estáticos
// ---------------------------------------------------------------------------

const features = [
  {
    icon: ShieldCheck,
    title: "Morte natural ou acidental",
    desc: "Indenização para sua família em caso de falecimento.",
  },
  {
    icon: Heartbeat,
    title: "Invalidez permanente",
    desc: "Cobertura em caso de invalidez total por acidente.",
  },
  {
    icon: Coins,
    title: "Assistência funeral",
    desc: "Suporte completo para sua família no momento mais difícil.",
  },
];

const pills = ["Aprovação simplificada", "Cobertura completa", "Parcelas acessíveis"];

const faq = [
  {
    q: "Quem pode contratar?",
    a: "Pessoas entre 18 e 65 anos, residentes no Brasil.",
  },
  {
    q: "Como acionar o seguro?",
    a: "Em caso de sinistro, entre em contato pelo nosso canal de atendimento. Nossa equipe vai te orientar em cada etapa.",
  },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function SeguroVidaLandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const { interesses, registrarInteresse } = useInteresse();
  const jaAvisado = interesses.includes("seguro-vida");

  const handleAvisar = () => {
    // TODO: salvar interesse no backend
    registrarInteresse("seguro-vida");
    toast("Ótimo! Você será notificado assim que o produto estiver disponível.");
  };

  return (
    <SubPageLayout title="Seguro de Vida" hideNav>
      <div className="space-y-6 pb-24">

        {/* Hero */}
        <div className="relative min-h-[200px] overflow-hidden rounded-2xl">
          <img
            src="/images/banner-intro-seguros.png"
            alt="Seguro de Vida"
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
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              Seguro de Vida
            </p>
            <h1 className="mb-2 text-2xl font-bold leading-snug text-white">
              Proteção para você e sua família
            </h1>
            <p className="text-sm text-white/80">
              Com parcelas que cabem no bolso
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

        {/* CTA fixo no rodapé */}
        <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
          {jaAvisado ? (
            <button
              type="button"
              disabled
              className="flex h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-[#FD5F31] bg-[#FFF3EE] text-base font-semibold text-[#FD5F31]"
            >
              <CheckCircle size={20} weight="fill" />
              Interesse registrado
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAvisar}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#FD5F31] text-base font-semibold text-white transition-colors hover:bg-[#d04e08]"
            >
              Quero ser avisado quando disponível
            </button>
          )}
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Em breve disponível no Pode Já.
          </p>
        </div>

      </div>
    </SubPageLayout>
  );
}
