import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Bank,
  CheckCircle,
  CircleNotch,
  ClockCountdown,
  Lock,
  Prohibit,
  ShieldCheck,
  Warning,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { SubPageLayout } from "@/App";
import {
  consultarDisponibilidadeCreditoFacil,
  lerDadosCreditoFacil,
  podeFazerFastTrackCreditoFacil,
  type CreditoFacilOffer,
} from "./creditoFacilApi";

// Mesma estrutura visual da intro de Crédito Pessoal (CreditoPessoalLanding.tsx): hero com
// gradiente, pills, bloco de parceria, card de benefícios, nota de segurança e CTA fixo. Ver
// journey-spec: docs/journey-specs/credito-facil-contorno-journey-spec.md

const pills = ["100% online", "Não precisa de carteira assinada", "Negativado pode simular"];

const beneficios = [
  {
    icon: Bank,
    titulo: "Dinheiro via Pix, em minutos",
    desc: "Sem agência, sem papelada, sem foto de documento.",
  },
  {
    icon: ClockCountdown,
    titulo: "Funciona 24 horas",
    desc: "Inclusive fins de semana e madrugada, pelo app ou pelo site.",
  },
  {
    icon: CheckCircle,
    titulo: "Aceita quem outros créditos não aceitam",
    desc: "CLT, autônomos, MEIs, aposentados e pensionistas. Nome negativado não impede a análise.",
  },
  {
    icon: ShieldCheck,
    titulo: "Sem tarifa de cadastro",
    desc: "Nada é cobrado antes da liberação. Taxas e valor total aparecem antes de você confirmar.",
  },
];

type LocationState = { offer?: CreditoFacilOffer } | null;

export default function CreditoFacilIntroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const offerFromState = (location.state as LocationState)?.offer ?? null;
  const [status, setStatus] = useState<"carregando" | "disponivel" | "indisponivel" | "erro">(
    offerFromState ? "disponivel" : "carregando",
  );
  const [offer, setOffer] = useState<CreditoFacilOffer | null>(offerFromState);

  // DESIGN ONLY — ?pularConfirmacao=true|false força o fast-track (ver
  // podeFazerFastTrackCreditoFacil): pular a tela de confirmar dados quando o usuário já tem tudo
  // disponível e pelo menos um contato verificado. Sem o parâmetro, usa a regra real — que hoje
  // nunca fecha como true, porque data de nascimento não tem fonte persistida ainda.
  const fastTrackParam = searchParams.get("pularConfirmacao");
  const fastTrackForcado = fastTrackParam === null ? undefined : fastTrackParam === "true";

  // DESIGN ONLY — ?resultado=disponivel|indisponivel|erro, só usado quando a tela é acessada
  // direto (sem vir do banner da CP-12, que já traz a oferta pronta via state)
  const resultadoForcado = searchParams.get("resultado") as
    | "disponivel"
    | "indisponivel"
    | "erro"
    | null;

  useEffect(() => {
    if (offerFromState) return;
    let cancelado = false;
    consultarDisponibilidadeCreditoFacil({ forcarResultado: resultadoForcado ?? undefined })
      .then((resultado) => {
        if (cancelado) return;
        if (resultado.isAvailable && resultado.offer) {
          setOffer(resultado.offer);
          setStatus("disponivel");
        } else {
          setStatus("indisponivel");
        }
      })
      .catch(() => {
        if (!cancelado) setStatus("erro");
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "carregando") {
    return (
      <SubPageLayout title="Crédito Fácil">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <CircleNotch size={32} className="animate-spin text-[#FD5F31]" />
          <p className="text-sm text-muted-foreground">Consultando sua oferta...</p>
        </div>
      </SubPageLayout>
    );
  }

  if (status === "indisponivel") {
    return (
      <SubPageLayout title="Crédito Fácil">
        <div className="flex flex-col items-center gap-4 py-16 text-center md:mx-auto md:max-w-[560px]">
          <Prohibit size={48} className="text-[#6B7280]" />
          <h2 className="text-xl font-bold text-foreground">
            No momento não temos uma oferta disponível pra você
          </h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-2 flex h-12 items-center justify-center rounded-full bg-[#FD5F31] px-8 text-sm font-semibold text-white hover:bg-[#D94E28]"
          >
            Voltar
          </button>
        </div>
      </SubPageLayout>
    );
  }

  if (status === "erro") {
    return (
      <SubPageLayout title="Crédito Fácil">
        <div className="flex flex-col items-center gap-4 py-16 text-center md:mx-auto md:max-w-[560px]">
          <Warning size={48} className="text-[#6B7280]" />
          <h2 className="text-xl font-bold text-foreground">Não conseguimos consultar sua oferta agora</h2>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 flex h-12 items-center justify-center rounded-full bg-[#FD5F31] px-8 text-sm font-semibold text-white hover:bg-[#D94E28]"
          >
            Tentar novamente
          </button>
        </div>
      </SubPageLayout>
    );
  }

  const valorFormatado = (offer?.maxValue ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  return (
    <SubPageLayout title="Crédito Fácil">
      <div className="space-y-6 pb-24 md:mx-auto md:max-w-[640px]">

        {/* ── Hero com imagem e gradiente ── */}
        <div className="relative min-h-[200px] overflow-hidden rounded-2xl">
          <img
            src="/images/banner-intro-credito-facil.png"
            alt="Crédito Fácil"
            className="absolute inset-0 h-full w-full object-cover object-right"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-[#FD5F31]/75 md:hidden" />
          <div className="absolute inset-0 bg-black/25 md:hidden" />
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background: "linear-gradient(90deg, #D94E28 0%, rgba(253, 95, 49, 0.70) 40%, rgba(253, 95, 49, 0.00) 85%)",
            }}
          />
          <div className="relative z-10 flex min-h-[200px] max-w-full flex-col justify-end p-5 md:max-w-[55%]">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/75">
              Crédito Fácil · Facio
            </p>
            <h1 className="mb-2 text-2xl font-bold leading-tight text-white">
              Você pode ter até {valorFormatado} pré-aprovado
            </h1>
            <p className="text-sm text-white/85">
              Esse valor é uma estimativa e pode mudar depois que você conectar sua conta na Facio
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

        {/* ── Bloco de parceria Pode Já × Facio ── */}
        <div className="rounded-2xl border border-border bg-white p-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src="/images/logo-facio.png"
              alt="Facio"
              className="h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p className="text-xs font-medium text-muted-foreground">Parceiro oficial</p>
            <p className="text-xs text-muted-foreground leading-relaxed w-full">
              A Fácil é um empréstimo pessoal em parcela única, operado pela Facio, correspondente
              bancário da QI Tech.
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

        {/* ── Nota de segurança / operador ── */}
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-start gap-2">
            <Lock size={14} className="mt-0.5 shrink-0 text-[#FD5F31]" />
            <p className="text-xs text-muted-foreground">
              Operado por{" "}
              <span className="font-semibold text-foreground">Facio</span>.
              Seus dados são protegidos conforme a LGPD.
            </p>
          </div>
        </div>

        {/* ── CTA fixo no rodapé ── */}
        <div className="sticky bottom-20 z-40 pb-3 md:bottom-0">
          <button
            type="button"
            onClick={() => {
              const podePular = podeFazerFastTrackCreditoFacil({ forcar: fastTrackForcado });
              if (podePular) {
                navigate("/credito-facil/redirecionando", { state: { dados: lerDadosCreditoFacil() } });
              } else {
                navigate("/credito-facil/confirmar-dados");
              }
            }}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#FD5F31] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Continuar
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
