import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { openFinanceBankDirectory, tier1BankIds, type OpenFinanceBankId } from "./openFinanceData";

export default function OpenFinanceSelectBankPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bancosConectados } = useOpenFinance();
  const [bankSearch, setBankSearch] = useState("");

  const mode = ((location.state as { modo?: "adicionar" | "onboarding" } | null)?.modo ?? "onboarding") as "adicionar" | "onboarding";
  const connectedIds = new Set(bancosConectados.map((b) => b.id));
  const query = bankSearch.trim().toLowerCase();
  const matches = openFinanceBankDirectory.filter((bank) => bank.name.toLowerCase().includes(query));
  const connected = matches.filter((bank) => connectedIds.has(bank.id));
  const top = matches.filter((bank) => bank.group === "top" && !connectedIds.has(bank.id));
  const others = matches.filter((bank) => bank.group === "other" && !connectedIds.has(bank.id));

  const onBankClick = (id: string) => {
    if (tier1BankIds.includes(id as OpenFinanceBankId)) {
      navigate(`/cadastro/guia-banco/${id}`, { state: { modo: mode } });
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
            onClick={() => navigate("/cadastro/open-finance")}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs font-medium text-muted-foreground">Passo 5 de 5</span>
        </div>
        <Progress value={100} className="h-1 bg-secondary [&>div]:bg-primary" />

        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {mode === "adicionar" ? "Conectar outro banco" : "Qual é o seu banco principal?"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "adicionar"
              ? "Quanto mais bancos você conecta, mais completa fica sua visão financeira."
              : "Você pode adicionar mais bancos depois."}
          </p>
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
          {mode === "adicionar" && connected.length > 0 && (
            <p className="pt-1 text-xs font-medium text-muted-foreground">Já conectados</p>
          )}
          {mode === "adicionar" && connected.map((bank) => (
            <div key={bank.id} className="flex w-full items-center justify-between rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] px-3 py-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: bank.color }}>
                  {bank.initials}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{bank.name}</p>
                  <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#15803D]">Conectado</span>
                </div>
              </div>
            </div>
          ))}

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
