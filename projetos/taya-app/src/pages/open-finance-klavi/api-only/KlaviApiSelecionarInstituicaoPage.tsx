import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { openFinanceBankDirectory, tier1BankIds, type OpenFinanceBankId } from "@/pages/open-finance/openFinanceData";
import { useOpenFinanceApiBase } from "./useOpenFinanceApiBase";

// DESIGN ONLY: reaproveita a lista de bancos de src/pages/open-finance/openFinanceData.ts
// por referência (mesmos nomes e cores reais de banco), sem duplicar os dados. Na opção
// API Only, essa lista viria do catálogo de instituições da Klavi.
export default function KlaviApiSelecionarInstituicaoPage() {
  const navigate = useNavigate();
  const { base, isReal } = useOpenFinanceApiBase();
  const [bankSearch, setBankSearch] = useState("");

  const query = bankSearch.trim().toLowerCase();
  const matches = openFinanceBankDirectory.filter((bank) => bank.name.toLowerCase().includes(query));
  const top = matches.filter((bank) => bank.group === "top");
  const others = matches.filter((bank) => bank.group === "other");

  // DESIGN ONLY: na jornada real, o CPF já foi coletado no início do cadastro (a Pode Já só
  // atende pessoa física), então pula direto pra autorização LGPD. No protótipo de comparação
  // solto, mantém a etapa de confirmação de documento como referência do que o parceiro de
  // Open Finance exporia nesse ponto via API.
  const onBankClick = (id: string) => {
    if (tier1BankIds.includes(id as OpenFinanceBankId)) {
      navigate(isReal ? `${base}/autorizacao-lgpd` : `${base}/confirmar-documento`, { state: { bancoId: id } });
      return;
    }
    toast("Em breve! O guia para este banco será disponibilizado em breve.");
  };

  return (
    <main className="mx-auto min-h-screen w-full bg-background px-4 pb-6 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-[640px] space-y-4 md:pt-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(base)}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs font-medium text-muted-foreground">{isReal ? "Passo 1 de 3" : "Passo 1 de 4"}</span>
        </div>
        <Progress value={isReal ? 33 : 25} className="h-1 bg-secondary [&>div]:bg-primary" />

        <div>
          <h2 className="text-2xl font-bold text-foreground">Qual é o seu banco principal?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Você pode adicionar mais bancos depois.</p>
        </div>

        <div className="sticky top-0 z-10 bg-background pb-2">
          <div className="relative">
            <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Buscar banco..."
              className="h-11 rounded-xl border-[#E5E7EB] bg-white pl-9"
            />
          </div>
        </div>

        <div className="max-h-[56vh] space-y-2 overflow-y-auto pr-1">
          {top.map((bank) => (
            <button
              key={bank.id}
              type="button"
              onClick={() => onBankClick(bank.id)}
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-left transition-colors hover:bg-[#FAFAFA]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: bank.color }}>
                  {bank.initials}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{bank.name}</p>
                  {!bank.available && (
                    <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#DC2626]">Sem Open Finance</span>
                  )}
                </div>
              </div>
              <CaretRight size={16} className="text-muted-foreground" />
            </button>
          ))}

          {others.length > 0 && (
            <p className="pt-3 text-xs font-medium text-muted-foreground">Outros bancos</p>
          )}

          {others.map((bank) => (
            <button
              key={bank.id}
              type="button"
              onClick={() => onBankClick(bank.id)}
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-left transition-colors hover:bg-[#FAFAFA]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: bank.color }}>
                  {bank.initials}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{bank.name}</p>
                  {!bank.available && (
                    <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#DC2626]">Sem Open Finance</span>
                  )}
                </div>
              </div>
              <CaretRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
