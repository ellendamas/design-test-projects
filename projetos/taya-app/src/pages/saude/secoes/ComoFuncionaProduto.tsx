import { CreditCard, IdentificationCard, ListChecks } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { PASSOS_CONTEUDO } from "@/data/saudeConteudo";
import type { ModoSaudeProduto } from "@/data/saudeConteudo";

// Mesmo Card pêssego "Como funciona" do hub de Assistências (AssistenciasPage, App.tsx) — classe
// por classe, com os 3 passos do modo app. A v1 tinha um grid de 3 colunas com números, sem
// relação nenhuma com o "Como funciona" que já existe no app.
export function ComoFunciona({ modo }: { modo: ModoSaudeProduto }) {
  const passos = [
    { icon: <ListChecks size={32} className="text-[#FD5F31]" />, titulo: PASSOS_CONTEUDO.passo1.titulo, sub: PASSOS_CONTEUDO.passo1.sub as string | undefined },
    { icon: <IdentificationCard size={32} className="text-[#FD5F31]" />, titulo: PASSOS_CONTEUDO.passo2[modo].titulo, sub: PASSOS_CONTEUDO.passo2[modo].sub },
    { icon: <CreditCard size={32} className="text-[#FD5F31]" />, titulo: PASSOS_CONTEUDO.passo3.titulo, sub: PASSOS_CONTEUDO.passo3.sub },
  ];

  return (
    <Card className="border-0 bg-[#FFF3EE] shadow-sm">
      <CardContent className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Como funciona</h3>
        <div className="space-y-3">
          {passos.map((item, idx, arr) => (
            <div key={item.titulo} className={`flex gap-3 ${idx !== arr.length - 1 ? "border-b border-[#FD5F31]/15 pb-3" : ""}`}>
              <div className="shrink-0">{item.icon}</div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.titulo}</p>
                {item.sub && <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
