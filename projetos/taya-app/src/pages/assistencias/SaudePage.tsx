import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Stethoscope } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLANOS, proximaEtapaAposVerificacao, type PlanoId } from "./shared";

// Rota: /assistencias/saude — primeira tela do fluxo de oferta BeneMed (vertical Saúde dentro
// de Assistências). Todos os 4 planos numa lista só, sem abas — o Familiar se destaca pelo
// próprio tratamento visual (fundo na cor da marca, maior que os individuais), não por estar
// separado em outra aba. Dado de plano é mockado — ainda não integra com a API da BeneMed.
//
// Os dependentes do plano Familiar não são cadastrados nessa tela — isso acontece depois, do
// lado da BeneMed, por isso o copy aqui só descreve a cobertura ("Você + 3 dependentes"), nunca
// promete um passo de cadastro dentro desse fluxo.
//
// Ao continuar: telefone e e-mail são sempre exigidos agora, em qualquer plano — não só quando
// a cobrança é recorrente. proximaEtapaAposVerificacao() intercala a verificação do que estiver
// faltando (celular primeiro, depois e-mail) antes da confirmação de dados.

export default function AssistenciasSaudePage() {
  const navigate = useNavigate();
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoId | null>(null);

  const handleContinuar = () => {
    const plano = PLANOS.find((p) => p.id === planoSelecionado);
    if (!plano) return;
    const destino = proximaEtapaAposVerificacao();
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

        <div className="space-y-3">
          {PLANOS.map((plano) => {
            const selecionado = planoSelecionado === plano.id;

            if (plano.modalidade === "familiar") {
              return (
                <button
                  key={plano.id}
                  type="button"
                  onClick={() => setPlanoSelecionado(plano.id)}
                  className="w-full text-left"
                >
                  <div
                    className={cn(
                      "overflow-hidden rounded-2xl bg-gradient-to-br from-[#FD5F31] to-[#D94E28] p-5 text-white transition-shadow",
                      selecionado ? "shadow-lg ring-2 ring-[#FD5F31] ring-offset-2" : "shadow-sm",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-bold">{plano.nome}</p>
                          {plano.destaque && (
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              {plano.destaque}
                            </span>
                          )}
                        </div>
                        {plano.cobertura && <p className="mt-1 text-sm font-semibold text-white">{plano.cobertura}</p>}
                        <p className="mt-0.5 text-xs text-white/75">{plano.cobranca}</p>
                      </div>
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                          selecionado ? "border-white bg-white text-[#FD5F31]" : "border-white/50 bg-transparent text-transparent",
                        )}
                      >
                        <CheckCircle size={18} weight="fill" />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold">
                      {plano.precoMes}
                      <span className="text-sm font-medium text-white/80"> /mês</span>
                    </p>
                  </div>
                </button>
              );
            }

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
