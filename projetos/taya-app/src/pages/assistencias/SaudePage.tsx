import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Stethoscope } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLANOS, telefoneJaValidado, type ModalidadePlano, type PlanoId } from "./shared";

// Rota: /assistencias/saude — primeira tela do fluxo de oferta BeneMed (vertical Saúde dentro
// de Assistências). Alterna entre as 3 periodicidades do plano Individual (Mensal/Semestral/
// Anual) e a única opção do Familiar por enquanto, sem pré-seleção em nenhum dos dois. Dado de
// plano é mockado — ainda não integra com a API da BeneMed.
//
// Os dependentes do plano Familiar não são cadastrados nessa tela — isso acontece depois, do
// lado da BeneMed, por isso o copy aqui só descreve a cobertura ("Você + 3 dependentes"), nunca
// promete um passo de cadastro dentro desse fluxo.
//
// Ao continuar: se o telefone do usuário ainda não foi validado (mesma flag usada no resto do
// app), intercala a etapa de verificação por SMS antes da confirmação de dados; senão, pula
// direto pra ela.

export default function AssistenciasSaudePage() {
  const navigate = useNavigate();
  const [modalidade, setModalidade] = useState<ModalidadePlano>("individual");
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoId | null>(null);

  const trocarModalidade = (nova: ModalidadePlano) => {
    if (nova === modalidade) return;
    setModalidade(nova);
    setPlanoSelecionado(null); // evita levar selecionado de uma modalidade pra outra
  };

  const planosVisiveis = PLANOS.filter((p) => p.modalidade === modalidade);

  const handleContinuar = () => {
    const plano = PLANOS.find((p) => p.id === planoSelecionado);
    if (!plano) return;
    const destino = telefoneJaValidado() ? "/assistencias/saude/confirmar-dados" : "/assistencias/saude/verificar-celular";
    navigate(destino, { state: { plano } });
  };

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

        <div className="flex rounded-full bg-muted p-1">
          {([
            { id: "individual" as const, label: "Individual" },
            { id: "familiar" as const, label: "Familiar" },
          ]).map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => trocarModalidade(opcao.id)}
              className={cn(
                "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                modalidade === opcao.id ? "bg-white text-[#FD5F31] shadow-sm" : "text-muted-foreground",
              )}
            >
              {opcao.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {planosVisiveis.map((plano) => {
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
                      {plano.cobertura && (
                        <p className="mt-1 text-xs font-medium text-foreground">{plano.cobertura}</p>
                      )}
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
