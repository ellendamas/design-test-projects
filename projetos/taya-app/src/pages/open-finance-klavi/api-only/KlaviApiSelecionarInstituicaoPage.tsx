import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bank, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { BRANDS_EM_DESTAQUE, celcoinBrandsPF } from "./celcoinBrandsData";
import { useOpenFinanceApiBase } from "./useOpenFinanceApiBase";

// DESIGN ONLY: lista de bancos no formato da API de Discovery da Celcoin (ver
// celcoinBrandsData.ts). Na jornada real, pula direto pra tela de instrução do banco: não tem
// mais etapa separada de documento nem de autorização LGPD (quem autoriza de verdade é o
// próprio banco, depois do redirecionamento). No protótipo de comparação solto, mantém a
// cadeia antiga (documento → LGPD) como referência de como seria com a Klavi.
//
// ?jaConectado=nubank,itau ou ?jaConectado=todos simula bancos já conectados sem precisar
// passar pela jornada de verdade antes: útil pra testar a tag "Conectado" e o clique num
// banco já conectado, que não repete a jornada, só avisa.
export default function KlaviApiSelecionarInstituicaoPage() {
  const navigate = useNavigate();
  const { base, isReal } = useOpenFinanceApiBase();
  const { bancosConectados } = useOpenFinance();
  const [searchParams] = useSearchParams();
  const [bankSearch, setBankSearch] = useState("");

  const jaConectadoParam = searchParams.get("jaConectado"); // DESIGN ONLY
  const connectedIds = new Set(bancosConectados.map((b) => b.id));
  if (jaConectadoParam === "todos") {
    celcoinBrandsPF.forEach((brand) => connectedIds.add(brand.brandId));
  } else if (jaConectadoParam) {
    jaConectadoParam.split(",").forEach((id) => connectedIds.add(id.trim()));
  }

  const query = bankSearch.trim().toLowerCase();
  const matches = celcoinBrandsPF.filter((brand) => brand.customerFriendlyName.toLowerCase().includes(query));
  const destaque = matches.filter((brand) => BRANDS_EM_DESTAQUE.includes(brand.brandId));
  const outros = matches.filter((brand) => !BRANDS_EM_DESTAQUE.includes(brand.brandId));

  const onBankClick = (brandId: string, nome: string) => {
    if (connectedIds.has(brandId)) {
      toast(`Você já conectou o ${nome}.`);
      return;
    }
    navigate(isReal ? `${base}/transicao-banco` : `${base}/confirmar-documento`, { state: { bancoId: brandId } });
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
          <span className="text-xs font-medium text-muted-foreground">{isReal ? "Passo 1 de 2" : "Passo 1 de 4"}</span>
        </div>
        <Progress value={isReal ? 50 : 25} className="h-1 bg-secondary [&>div]:bg-primary" />

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
          {destaque.map((brand) => (
            <button
              key={brand.brandId}
              type="button"
              onClick={() => onBankClick(brand.brandId, brand.customerFriendlyName)}
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-left transition-colors hover:bg-[#FAFAFA]"
            >
              <div className="flex items-center gap-3">
                {brand.customerFriendlyLogoUri ? (
                  <img src={brand.customerFriendlyLogoUri} alt="" className="h-10 w-10 rounded-full object-contain" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Bank size={20} />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{brand.customerFriendlyName}</p>
                  {connectedIds.has(brand.brandId) && (
                    <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#15803D]">Conectado</span>
                  )}
                </div>
              </div>
              <CaretRight size={16} className="text-muted-foreground" />
            </button>
          ))}

          {outros.length > 0 && (
            <p className="pt-3 text-xs font-medium text-muted-foreground">Outros bancos</p>
          )}

          {outros.map((brand) => (
            <button
              key={brand.brandId}
              type="button"
              onClick={() => onBankClick(brand.brandId, brand.customerFriendlyName)}
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-left transition-colors hover:bg-[#FAFAFA]"
            >
              <div className="flex items-center gap-3">
                {brand.customerFriendlyLogoUri ? (
                  <img src={brand.customerFriendlyLogoUri} alt="" className="h-10 w-10 rounded-full object-contain" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Bank size={20} />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{brand.customerFriendlyName}</p>
                  {connectedIds.has(brand.brandId) && (
                    <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#15803D]">Conectado</span>
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
