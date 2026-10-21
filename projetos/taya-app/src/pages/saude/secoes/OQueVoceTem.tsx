import { CheckCircle } from "@phosphor-icons/react";
import { FAIXA_CONFIANCA } from "@/data/saudeConteudo";

// Pílulas no mesmo padrão de "O crédito com as menores taxas do mercado" (Consignado CLT,
// LandingPage.tsx: "border border-border" + CheckCircle 12px) — já é o vocabulário que as
// páginas de introdução de produto do app usam logo abaixo do banner, não um chip inventado.
// Troca o Card branco anterior: tira um bloco branco a mais bem em cima do carrossel seguinte.
export function OQueVoceTem() {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FAIXA_CONFIANCA.map((item) => (
          <div key={item} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm">
            <CheckCircle size={12} className="text-[#FD5F31]" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
