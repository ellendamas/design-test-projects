import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubPageLayout } from "@/App";
import EnderecoSelector from "@/components/EnderecoSelector";
import ContaSelector from "@/components/ContaSelector";

type Step = 1 | 2;

// Rota: /leilao/dados-pendentes
// TODO: pré-preencher com dados reais do token quando API disponível
export default function LeilaoDadosPendentesPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  return (
    <SubPageLayout title="Confirme seus dados" hideNav>
      <div className="space-y-4 pb-4 md:mx-auto md:max-w-[560px]">
        {/* Barra de progresso — 2 steps */}
        <div className="flex gap-1">
          {[1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#FD5F31]" : "bg-border"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Etapa {step} de 2 — {step === 1 ? "Endereço" : "Conta bancária"}
        </p>

        {step === 1 ? (
          <EnderecoSelector
            enderecos={[]}
            permitirExcluir={false}
            onConfirmar={() => setStep(2)}
          />
        ) : (
          <ContaSelector
            contas={[]}
            permitirExcluir={false}
            mostrarPix
            onConfirmar={() => navigate("/leilao/assinatura")}
          />
        )}
      </div>
    </SubPageLayout>
  );
}
