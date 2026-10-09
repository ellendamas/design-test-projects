import { useNavigate } from "react-router-dom";
import {
  CaretRight,
  FileX,
  Info,
  Vault,
  Wallet,
  ArrowRight,
} from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

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

        {/* ── Cross-sell ── */}
        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-foreground">Não fique sem dinheiro</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Temos outras opções que podem funcionar para você agora.
            </p>
          </div>

          {/* Card Crédito Pessoal — clicável */}
          <button
            type="button"
            onClick={() => navigate("/credito-pessoal")}
            className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-colors hover:border-[#FD5F31]/40"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EE]">
                <Wallet size={20} className="text-[#FD5F31]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Crédito Pessoal</p>
                <p className="mt-0.5 text-xs font-medium text-[#FD5F31]">Dinheiro na conta em minutos</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Sem precisar de FGTS ou desconto em folha.
                </p>
              </div>
              <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground" />
            </div>
          </button>

          {/* Card Antecipação FGTS — placeholder em breve */}
          {/* FGTS OCULTO TEMPORARIAMENTE — produto em pausa. Remover o false && para reativar. */}
          {false && (
          <div className="w-full rounded-2xl border border-border bg-white p-4 opacity-60 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Vault size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Antecipação FGTS</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Em breve
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Antecipe seu saldo do FGTS sem afetar a margem do salário.
                </p>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* ── Banner de descoberta — Assistências. Mesma estrutura do hero que já existe no
            topo da própria página de Assistências (AssistenciasPage em App.tsx): imagem de
            fundo inteira, não um recorte ao lado do texto — é pra parecer peça promocional,
            não mais um card de lista como o de Crédito Pessoal acima. ── */}
        <button
          type="button"
          onClick={() => navigate("/assistencias/saude")}
          className="relative block min-h-[200px] w-full overflow-hidden rounded-2xl text-left"
        >
          <img
            src="/images/banner-intro-assistencias.png"
            alt=""
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
          <div className="relative z-10 flex min-h-[200px] max-w-full flex-col justify-end p-5 md:max-w-[60%]">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              Assistências Pode Já
            </p>
            <h3 className="mb-1 text-xl font-bold leading-snug text-white">
              Saúde com desconto, a partir de R$ 29,90/mês
            </h3>
            <p className="mb-3 text-sm leading-relaxed text-white/85">
              Cuide de você e da sua família com descontos de até 85% em consultas e exames.
            </p>
            <span className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-white">
              Conhecer planos <CaretRight size={14} />
            </span>
          </div>
        </button>

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
