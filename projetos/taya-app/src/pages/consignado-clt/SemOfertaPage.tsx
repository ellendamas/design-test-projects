import { useNavigate } from "react-router-dom";
import { FileX, Info } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { CrossSellCarousel, type CrossSellBannerItem } from "@/components/CrossSellCarousel";

// Cross-sell em formato de carrossel de banners (mesmo padrão de peek/scroll do carrossel de
// categorias de AssistenciasPage, via PeekCarousel). Texto e destino de cada item são os mesmos
// que já existiam antes (card de Crédito Pessoal + banner de Assistências), só a estrutura
// visual virou banner com foto de fundo pra todos.
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
    key: "credito-pessoal",
    imagem: "/images/cross-sell-credito-pessoal.png",
    titulo: "Crédito Pessoal",
    descricao: "Dinheiro na conta em minutos, sem precisar de FGTS ou desconto em folha",
    rota: "/credito-pessoal",
  },
  {
    key: "fgts",
    imagem: "/images/cross-sell-fgts.png",
    titulo: "Antecipação FGTS",
    descricao: "Antecipe seu saldo do FGTS sem afetar a margem do salário",
    rota: "/fgts",
  },
].filter((item) => item.key !== "fgts" || false);

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTSemOfertaPage() {
  const navigate = useNavigate();

  return (
    <SubPageLayout title="" hideNav>
      <div className="space-y-6 pb-6">

        {/* ── Hero ── */}
        <div className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileX size={36} className="text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Não encontramos uma oferta agora
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sua margem consignável não está disponível no momento.
              Isso pode mudar — vale tentar novamente em 30 dias.
            </p>
          </div>
        </div>

        {/* ── Card informativo ── */}
        <div className="rounded-2xl bg-muted p-4">
          <div className="flex gap-3">
            <Info size={16} className="mt-0.5 shrink-0 text-[#FD5F31]" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Por que isso acontece?</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                O consignado CLT depende da sua margem consignável disponível.
                Se você já tem descontos próximos do limite permitido (35% do salário líquido),
                novas contratações ficam bloqueadas temporariamente.
              </p>
            </div>
          </div>
        </div>

        {/* ── Cross-sell — carrossel de banners com peek (ver CrossSellCarousel) ── */}
        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-foreground">Não fique sem dinheiro</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Temos outras opções que podem funcionar para você agora.
            </p>
          </div>

          <CrossSellCarousel items={CROSS_SELL} onNavegar={navigate} />
        </div>

        {/* ── Rodapé ── */}
        <div className="space-y-1 pt-2">
          <button
            type="button"
            onClick={() => navigate("/credito-pessoal")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Conhecer o Crédito Pessoal
          </button>
          <button
            type="button"
            onClick={() => navigate("/painel")}
            className="w-full py-3 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Voltar para o início
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
