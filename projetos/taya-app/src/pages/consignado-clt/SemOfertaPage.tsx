import { useNavigate } from "react-router-dom";
import {
  FileX,
  Info,
  CreditCard,
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
    <SubPageLayout title="">
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
            <Info size={16} className="mt-0.5 shrink-0 text-[#E8590A]" />
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

          {/* Card Saque Fácil — clicável */}
          <button
            type="button"
            onClick={() => navigate("/saque-facil")}
            className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-colors hover:border-[#E8590A]/40"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF0E7]">
                <CreditCard size={20} className="text-[#E8590A]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Saque Fácil no cartão</p>
                <p className="mt-0.5 text-xs font-medium text-[#E8590A]">Aprovação em minutos</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Use o limite do seu cartão de crédito. Sem consulta ao Serasa, sem análise de crédito.
                </p>
              </div>
              <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground" />
            </div>
          </button>

          {/* Card Antecipação FGTS — placeholder em breve */}
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

          {/* Card Crédito Pessoal — placeholder em breve */}
          {/* TODO: ativar quando produto Crédito Pessoal estiver disponível */}
          <div className="w-full rounded-2xl border border-border bg-white p-4 opacity-60 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Wallet size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Crédito Pessoal</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Em breve
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Crédito sem vínculo empregatício, com parcelas que cabem no seu bolso.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Rodapé ── */}
        <div className="space-y-1 pt-2">
          <button
            type="button"
            onClick={() => navigate("/saque-facil")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Conhecer o Saque Fácil
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
