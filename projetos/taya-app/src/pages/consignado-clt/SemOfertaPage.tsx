import { useNavigate } from "react-router-dom";
import {
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
