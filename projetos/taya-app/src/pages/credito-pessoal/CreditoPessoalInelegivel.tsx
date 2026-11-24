import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Headset, IdentificationCard, WarningCircle, Warning } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { CrossSellCarousel, type CrossSellBannerItem } from "@/components/CrossSellCarousel";
import { CreditoFacilBanner } from "@/components/CreditoFacilBanner";
import {
  consultarDisponibilidadeCreditoFacil,
  veioNegativadoClt,
  type CreditoFacilOffer,
} from "@/pages/credito-facil/creditoFacilApi";

type LocationState = Record<string, unknown>;

// DESIGN ONLY — mock state para acesso direto via URL de design
const MOCK_STATE: LocationState = {};

// Cross-sell em formato de carrossel de banners (mesmo padrão de peek/scroll do carrossel de
// categorias de AssistenciasPage, via PeekCarousel). Texto e destino de cada item são os mesmos
// que já existiam antes, só a estrutura visual virou banner com foto de fundo.
// FGTS OCULTO TEMPORARIAMENTE — produto em pausa. Remover o "|| false" do .filter abaixo para reativar.
const CROSS_SELL: CrossSellBannerItem[] = [
  // Assistências sempre primeiro — é recorrência, prioridade de venda sobre os outros produtos.
  {
    key: "assistencias-saude",
    imagem: "/images/cross-sell-assistencias-saude.png",
    titulo: "Saúde com desconto",
    descricao: "Descontos reais em consultas, exames, medicamentos e muito mais",
    preco: "a partir de R$39,90/mês",
    rota: "/assistencias/saude",
  },
  {
    key: "consignado-clt",
    imagem: "/images/cross-sell-clt.png",
    titulo: "Crédito Consignado CLT",
    descricao: "Para quem tem carteira assinada",
    rota: "/consignado-clt",
  },
  {
    key: "fgts",
    imagem: "/images/cross-sell-fgts.png",
    titulo: "Antecipação FGTS",
    descricao: "Use seu saldo do FGTS",
    rota: "/fgts",
  },
].filter((item) => item.key !== "fgts" || false);

// TODO: receber do campo "mensagem" do webhook de elegibilidade
const mensagemDivergenciaMock =
  "Seu nome está divergente na Receita Federal. Verifique seus dados cadastrais e solicite uma nova análise.";

export default function CreditoPessoalInelegivel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const _locationState =
    (location.state as LocationState | null) ?? MOCK_STATE; // DESIGN ONLY

  // DESIGN ONLY — ?motivo=sem_oferta (default) | divergencia | outro
  const motivo = (searchParams.get("motivo") ?? "sem_oferta") as
    | "sem_oferta"
    | "divergencia"
    | "outro"; // DESIGN ONLY

  // Banner do Crédito Fácil — no PROTÓTIPO aparece sempre por padrão, pra facilitar simular e
  // revisar o design sem depender de CPF salvo nem de uma chamada assíncrona. A regra real
  // (consulta de disponibilidade antes de mostrar + "nunca mais mostrar" após o primeiro toque)
  // fica documentada na journey-spec: docs/journey-specs/credito-facil-contorno-journey-spec.md
  //
  // DESIGN ONLY — parâmetros de simulação:
  // ?facil=indisponivel | erro — esconde o banner (simula não ter oferta disponível)
  // ?facilDispensado=true — esconde o banner (simula "o usuário já tinha dispensado antes")
  const facilForcado = searchParams.get("facil") as "indisponivel" | "erro" | null;
  const facilDispensado = searchParams.get("facilDispensado") === "true";
  const [facilOffer, setFacilOffer] = useState<CreditoFacilOffer | null>(
    facilDispensado || facilForcado
      ? null
      : { maxValue: 300, description: "Antecipe até R$ 300 com a Facio. Taxas a partir de R$ 9,90." },
  );

  useEffect(() => {
    if (facilDispensado || !facilForcado) return;
    let cancelado = false;
    consultarDisponibilidadeCreditoFacil({ forcarResultado: facilForcado })
      .then((resultado) => {
        if (!cancelado && resultado.isAvailable && resultado.offer) {
          setFacilOffer(resultado.offer);
        }
      })
      .catch(() => {
        // Falha na consulta: não mostra o banner, sem estado de erro visível nesta tela
        // (mesma regra de não expor o motivo de uma indisponibilidade).
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const facilBanner = facilOffer ? (
    <div className="w-full">
      <CreditoFacilBanner
        valorEstimado={facilOffer.maxValue}
        onClick={() => navigate("/credito-facil", { state: { offer: facilOffer } })}
      />
    </div>
  ) : null;

  // Dupla negativa (CLT + Crédito Pessoal): não faz sentido oferecer Saúde por Assinatura (algo
  // pra gastar) pra quem acabou de ser negado duas vezes e está precisando de dinheiro. Nesse
  // caso, esconde o cross-sell genérico e mostra só o Crédito Fácil. Ver journey-spec.
  // DESIGN ONLY — ?origemClt=negativado simula vir negativado do CLT, sem precisar repetir o
  // fluxo todo.
  const duplaNegativa = veioNegativadoClt() || searchParams.get("origemClt") === "negativado";

  // ── Caso 1 — Sem oferta disponível ──────────────────────────────────────
  if (motivo === "sem_oferta") {
    return (
      <SubPageLayout title="Resultado da consulta">
        <div className="flex flex-col items-center gap-6 pb-6 text-center md:mx-auto md:max-w-[560px]">
          <WarningCircle size={48} className="text-[#FD5F31]" />
          <div>
            <h2 className="text-xl font-bold">Não encontramos uma oferta para você agora</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Isso pode mudar. Você poderá tentar novamente em 7 dias.
            </p>
          </div>

          {/* Card de orientações */}
          <div className="w-full space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm text-left">
            {[
              { icon: IdentificationCard, text: "Verifique se há pendências no seu CPF" },
              { icon: Headset, text: "Fale com nosso suporte" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon size={20} className="mt-0.5 shrink-0 text-[#FD5F31]" />
                <p className="text-sm text-foreground">{text}</p>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-border" />

          <p className="w-full text-left text-base font-semibold text-foreground">
            Outros produtos disponíveis para você
          </p>

          {facilBanner}

          {/* Cross-sell genérico — apenas no Caso 1, oculto na dupla negativa (CLT + Crédito Pessoal) */}
          {!duplaNegativa && (
            <div className="w-full">
              <CrossSellCarousel items={CROSS_SELL} onNavegar={navigate} />
            </div>
          )}

          {/* Sem CTA de nova tentativa — bloqueio de 7 dias */}
          <div className="sticky bottom-20 z-40 w-full bg-background pb-4 pt-2 md:bottom-0">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white hover:bg-[#D94E28]"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </SubPageLayout>
    );
  }

  // ── Caso 2 — Dado divergente (DataPrev) ─────────────────────────────────
  if (motivo === "divergencia") {
    return (
      <SubPageLayout title="Resultado da consulta">
        <div className="flex flex-col items-center gap-6 pb-6 text-center md:mx-auto md:max-w-[560px]">
          <Warning size={48} className="text-amber-500" />
          <div>
            <h2 className="text-xl font-bold">Encontramos uma divergência nos seus dados</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Corrija as informações e solicite uma nova análise.
            </p>
          </div>

          {/* Card âmbar com mensagem da API */}
          {/* TODO: substituir mensagemDivergenciaMock pelo campo "mensagem" do webhook de elegibilidade */}
          <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <Warning size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-sm leading-relaxed text-amber-800">{mensagemDivergenciaMock}</p>
            </div>
          </div>

          <div className="sticky bottom-20 z-40 w-full bg-background pb-4 pt-2 md:bottom-0">
            <button
              type="button"
              onClick={() => navigate("/minha-conta/meus-dados")}
              className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white hover:bg-[#D94E28]"
            >
              Corrigir meus dados
            </button>
          </div>
        </div>
      </SubPageLayout>
    );
  }

  // ── Caso 3 — Fallback genérico (outro) ──────────────────────────────────
  return (
    <SubPageLayout title="Resultado da consulta">
      <div className="flex flex-col items-center gap-6 pb-6 text-center md:mx-auto md:max-w-[560px]">
        <WarningCircle size={48} className="text-[#FD5F31]" />
        <div>
          <h2 className="text-xl font-bold">Não foi possível processar sua solicitação agora</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente novamente ou entre em contato com nosso suporte.
          </p>
        </div>

        <div className="w-full space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm text-left">
          <div className="flex items-start gap-3">
            <Headset size={20} className="mt-0.5 shrink-0 text-[#FD5F31]" />
            <p className="text-sm text-foreground">Fale com nosso suporte</p>
          </div>
        </div>

        <div className="sticky bottom-20 z-40 w-full bg-background pb-4 pt-2 md:bottom-0 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/credito-pessoal")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white hover:bg-[#D94E28]"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="py-1 text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </SubPageLayout>
  );
}
