import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, DeviceMobile, Lock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { openFinanceBanks, type OpenFinanceBankId } from "@/pages/open-finance/openFinanceData";
import { useOpenFinanceApiBase } from "./useOpenFinanceApiBase";

// DESIGN ONLY: bancoId tem fallback "nubank" pra permitir acesso direto por URL.
// Reaproveita o conceito e os passos reais de src/pages/open-finance/OpenFinanceGuidePage.tsx:
// mesmo na opção API Only, quem autentica o usuário no fim é o próprio banco, então esse
// passo reflete o mecanismo real do Open Finance.
export default function KlaviApiTransicaoBancoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { base } = useOpenFinanceApiBase();
  const bancoId = ((location.state as { bancoId?: OpenFinanceBankId } | null)?.bancoId ?? "nubank") as OpenFinanceBankId; // DESIGN ONLY
  const bank = openFinanceBanks.find((item) => item.id === bancoId) ?? openFinanceBanks[0];

  return (
    <main className="mx-auto min-h-screen w-full bg-background px-4 pb-28 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-[640px] space-y-4 md:pt-8">
        <button
          type="button"
          onClick={() => navigate(`${base}/autorizacao-lgpd`, { state: { bancoId } })}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Como funciona no {bank.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Siga esses passos quando o app abrir:</p>
          <p className="mt-2 text-xs font-semibold text-primary">{bank.eta}</p>
        </div>

        <div className="space-y-2">
          {bank.steps.map((text, idx) => (
            <div key={text} className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {idx + 1}
              </div>
              <p className="text-sm font-semibold text-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div
          className="flex h-[140px] items-center justify-center rounded-xl"
          style={{ backgroundColor: `${bank.color}26` }}
        >
          <div className="text-center">
            <DeviceMobile size={48} style={{ color: bank.color }} className="mx-auto" />
            <p className="mt-2 text-xs text-muted-foreground">Ilustração em breve</p>
          </div>
        </div>

        <Card className="border-0 bg-primary-light">
          <CardContent className="flex items-start gap-2 p-4">
            <Lock size={16} className="mt-0.5 text-primary" />
            <p className="text-xs text-primary-dark">
              Você vai sair da Pode Já por alguns segundos. Isso é normal e seguro, faz parte do processo
              oficial do Banco Central.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-3">
        <div className="mx-auto w-full max-w-[640px]">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate(`${base}/retorno`, { state: { bancoId: bank.id } })}
          >
            Entendi, vamos lá <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </main>
  );
}
