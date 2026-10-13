import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Headset, IdentificationCard, Clock, XCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { CrossSellCarousel, type CrossSellBannerItem } from "@/components/CrossSellCarousel";

type LocationState = Record<string, unknown>;

// DESIGN ONLY — mock state para acesso direto via URL de design
const MOCK_STATE: LocationState = {}; // TODO: receber da API

// Cross-sell em formato de carrossel de banners (mesmo padrão de peek/scroll do carrossel de
// categorias de AssistenciasPage, via PeekCarousel). Texto e destino de cada item são os mesmos
// que já existiam antes, só a estrutura visual virou banner com foto de fundo.
// FGTS OCULTO TEMPORARIAMENTE — produto em pausa. Remover o "|| false" do .filter abaixo para reativar.
const CROSS_SELL: CrossSellBannerItem[] = [
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
  {
    key: "assistencias-saude",
    imagem: "/images/cross-sell-assistencias-saude.png",
    titulo: "Saúde com desconto",
    descricao: "Descontos reais em consultas, exames, medicamentos e muito mais",
    preco: "a partir de R$39,90/mês",
    rota: "/assistencias/saude",
  },
].filter((item) => item.key !== "fgts" || false);

export default function CreditoPessoalReprovada() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const _locationState =
    (location.state as LocationState | null) ?? MOCK_STATE; // DESIGN ONLY

  // DESIGN ONLY — ?etapa=simulacao (default) | formalizacao
  const etapa = (searchParams.get("etapa") ?? "simulacao") as
    | "simulacao"
    | "formalizacao"; // DESIGN ONLY

  // ── Caso 1 — Reprovado na simulação (bloqueio 7 dias) ───────────────────
  if (etapa === "simulacao") {
    return (
      <SubPageLayout title="Resultado">
        <div className="flex flex-col items-center gap-6 pb-6 text-center md:mx-auto md:max-w-[560px]">

          <XCircle size={48} className="text-[#6B7280]" />

          <div>
            <h2 className="text-xl font-bold text-foreground">
              Não foi possível aprovar sua proposta agora
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Você poderá tentar novamente em 7 dias.
            </p>
          </div>

          {/* Card de orientações */}
          <div className="w-full space-y-3 rounded-2xl border border-border bg-white p-4 text-left shadow-sm">
            {[
              { icon: Clock, text: "Você poderá tentar novamente em 7 dias" },
              { icon: IdentificationCard, text: "Verifique pendências no seu CPF" },
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

          {/* Cross-sell — carrossel de banners com peek (ver CrossSellCarousel) */}
          <div className="w-full">
            <CrossSellCarousel items={CROSS_SELL} onNavegar={navigate} />
          </div>

          {/* Sem CTA de nova proposta — bloqueio de 7 dias */}
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

  // ── Caso 2 — Reprovado pós-formalização (sem bloqueio) ──────────────────
  return (
    <SubPageLayout title="Resultado">
      <div className="flex flex-col items-center gap-6 pb-6 text-center md:mx-auto md:max-w-[560px]">

        <XCircle size={48} className="text-[#6B7280]" />

        <div>
          <h2 className="text-xl font-bold text-foreground">
            Sua proposta não foi aprovada
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Você pode solicitar uma nova proposta agora mesmo.
          </p>
        </div>

        {/* Card com mensagem específica da API */}
        {/* TODO: exibir campo "mensagem" do retorno quando disponível — ocultar este card se ausente */}
        <div className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {/* TODO: substituir pelo campo "mensagem" do retorno da API */}
            Sua proposta foi analisada e não atendeu aos critérios de aprovação neste momento.
          </p>
        </div>

        <div className="h-px w-full bg-border" />

        <p className="w-full text-left text-base font-semibold text-foreground">
          Outros produtos disponíveis para você
        </p>

        {/* Cross-sell — carrossel de banners com peek (ver CrossSellCarousel) */}
        <div className="w-full">
          <CrossSellCarousel items={CROSS_SELL} onNavegar={navigate} />
        </div>

        {/* CTA — nova proposta sem bloqueio */}
        <div className="sticky bottom-20 z-40 w-full bg-background pb-4 pt-2 md:bottom-0 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/credito-pessoal")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white hover:bg-[#D94E28]"
          >
            Iniciar nova proposta
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
