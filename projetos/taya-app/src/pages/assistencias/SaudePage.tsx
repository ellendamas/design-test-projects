import { useState } from "react";
import { CheckCircle, Info, Stethoscope } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Rota: /assistencias/saude — primeira tela do fluxo de oferta BeneMed (vertical Saúde dentro
// de Assistências). Mostra os 3 planos lado a lado, sem pré-seleção. Dado de plano é mockado —
// ainda não integra com a API da BeneMed.
//
// Fora de escopo deste bloco: verificação de telefone, revisão/consentimento, pagamento Pix,
// confirmação e gestão da assinatura — vêm num próximo bloco. Por isso o CTA "Continuar" ainda
// não navega pra lugar nenhum.

type PlanoId = "mensal" | "semestral" | "anual";

type Plano = {
  id: PlanoId;
  nome: string;
  precoMes: string;
  cobranca: string;
  destaque?: string;
};

const PLANOS: Plano[] = [
  { id: "mensal", nome: "Mensal", precoMes: "R$ 39,90", cobranca: "Cobrança mensal" },
  { id: "semestral", nome: "Semestral", precoMes: "R$ 34,90", cobranca: "R$ 209,40 a cada 6 meses" },
  { id: "anual", nome: "Anual", precoMes: "R$ 29,90", cobranca: "R$ 358,80 a cada 12 meses", destaque: "Mais econômico" },
];

export default function AssistenciasSaudePage() {
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoId | null>(null);

  // TODO: navegar pro próximo passo do fluxo (verificação de telefone) quando esse bloco
  // for implementado — por enquanto não há destino.
  const handleContinuar = () => {};

  return (
    <SubPageLayout title="Saúde" hideNav>
      <div className="space-y-4 pb-32">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <Stethoscope size={28} className="text-[#FD5F31]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assistência Saúde · BeneMed
            </p>
            <h1 className="text-xl font-bold text-foreground">Escolha seu plano</h1>
          </div>
        </div>

        {/* Aviso obrigatório — não é plano de saúde regulamentado, não cobre urgência/emergência */}
        <div className="flex gap-3 rounded-2xl border border-[#F6C5A9] bg-[#FEF0E9] p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-[#C84A1F]" />
          <p className="text-xs leading-relaxed text-[#541A08]">
            A BeneMed é um plano de assistência à saúde, <strong>não é um plano de saúde</strong> regulamentado
            pela ANS. Não cobre atendimentos de urgência ou emergência.
          </p>
        </div>

        <div className="space-y-3">
          {PLANOS.map((plano) => {
            const selecionado = planoSelecionado === plano.id;
            return (
              <button
                key={plano.id}
                type="button"
                onClick={() => setPlanoSelecionado(plano.id)}
                className="w-full text-left"
              >
                <Card
                  className={cn(
                    "border transition-colors",
                    selecionado ? "border-[#FD5F31] bg-[#FFF3EE]" : "border-border bg-white hover:border-[#FD5F31]/40",
                  )}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{plano.nome}</p>
                        {plano.destaque && (
                          <span className="rounded-full bg-[#FD5F31] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            {plano.destaque}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{plano.cobranca}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#FD5F31]">{plano.precoMes}</p>
                        <p className="text-[11px] text-muted-foreground">por mês</p>
                      </div>
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                          selecionado ? "border-[#FD5F31] bg-[#FD5F31] text-white" : "border-border bg-white text-transparent",
                        )}
                      >
                        <CheckCircle size={16} weight="fill" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <Button
          className="h-14 w-full rounded-full"
          disabled={!planoSelecionado}
          onClick={handleContinuar}
        >
          Continuar
        </Button>
      </div>
    </SubPageLayout>
  );
}
