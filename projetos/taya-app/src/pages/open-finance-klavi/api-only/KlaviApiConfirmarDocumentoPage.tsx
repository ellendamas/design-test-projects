import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { OpenFinanceBankId } from "@/pages/open-finance/openFinanceData";
import { useOpenFinanceApiBase } from "./useOpenFinanceApiBase";

// DESIGN ONLY: bancoId tem fallback "nubank" pra permitir acesso direto por URL.
// Etapa nova nesta opção: a documentação da Klavi descreve a confirmação de CPF/CNPJ
// como parte do fluxo de consentimento, antes da autorização LGPD.
export default function KlaviApiConfirmarDocumentoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { base } = useOpenFinanceApiBase();
  const bancoId = ((location.state as { bancoId?: OpenFinanceBankId } | null)?.bancoId ?? "nubank") as OpenFinanceBankId; // DESIGN ONLY

  const [documento, setDocumento] = useState("123.456.789-00"); // DESIGN ONLY: mock pra não deixar o campo vazio

  return (
    <main className="mx-auto min-h-screen w-full bg-background px-4 pb-28 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-[640px] space-y-4 md:pt-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`${base}/selecionar-instituicao`)}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs font-medium text-muted-foreground">Passo 2 de 4</span>
        </div>
        <Progress value={50} className="h-1 bg-secondary [&>div]:bg-primary" />

        <div>
          <h2 className="text-2xl font-bold text-foreground">Confirme seu CPF ou CNPJ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            É esse documento que vamos usar para iniciar sua autorização de compartilhamento de dados.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documento">CPF ou CNPJ</Label>
          <Input
            id="documento"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            placeholder="000.000.000-00"
            className="h-12 rounded-xl border-[#E5E7EB] bg-white"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-3">
        <div className="mx-auto w-full max-w-[640px]">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            disabled={documento.trim().length === 0}
            onClick={() => navigate(`${base}/autorizacao-lgpd`, { state: { bancoId } })}
          >
            Continuar <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </main>
  );
}
