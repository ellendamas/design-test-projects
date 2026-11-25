import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash, WarningCircle } from "@phosphor-icons/react";
import { SubPageLayout, getStoredUser } from "@/App";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { trackStep } from "@/utils/analytics";
import { contratos } from "@/data/contratos";
import { getAssinaturaBenemedAtiva } from "@/pages/assistencias/shared";
import { planoAtivoViaParametro } from "@/pages/saude/estadoAssinaturaDesignOnly";
import { contratoAtivoOverrideViaParametro } from "./shared";

// Rota: /minha-conta/excluir — primeira tela da jornada de exclusão de conta (22/10, trabalho
// novo pedido pela Ellen: clientes pedem exclusão de verdade e hoje só existe suspensão em
// produção, nem isso no protótipo). Dois ramos, decididos aqui e não repetidos nas telas
// seguintes: sem contrato ativo segue pro fluxo self-service completo; com contrato ativo pede
// ajuda do atendimento e não avança pelas próprias telas (decisão de negócio da Ellen).
export default function ExcluirContaImpactosPage() {
  const navigate = useNavigate();
  const { abrirChat, enviarMensagemContexto } = useChat();

  // Mesmo sinal que ContratosPage já usa pra saber se existe algo "ativo": contratos de
  // crédito/seguro/FGTS (array mockado) + assinatura BeneMed (shape separado, não entra no
  // array). contratoAtivoForcadoViaParametro() é só pra pré-visualizar o ramo sem precisar
  // simular uma contratação de verdade.
  const assinaturaBenemed = getAssinaturaBenemedAtiva() ?? planoAtivoViaParametro();
  const sinalReal = contratos.length > 0 || !!assinaturaBenemed;
  const temContratoAtivo = contratoAtivoOverrideViaParametro() ?? sinalReal;
  const totalContratosAtivos = contratos.length + (assinaturaBenemed ? 1 : 0);

  useEffect(() => {
    trackStep("conta_exclusao_impactos_visualizado", { tem_contrato_ativo: temContratoAtivo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const falarComAtendimento = () => {
    trackStep("conta_exclusao_atendimento_acionado", { total_contratos_ativos: totalContratosAtivos });
    abrirChat();
    enviarMensagemContexto(
      `[SISTEMA] Usuário ${getStoredUser()?.name ?? "não identificado"} solicitou exclusão de conta com contrato ativo (${totalContratosAtivos} contrato(s)). Encaminhar para suporte humano.`,
    );
    navigate("/minha-conta");
  };

  return (
    <SubPageLayout title="Excluir conta" hideNav>
      <div className="space-y-5 pb-28">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <Trash size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Excluir conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Antes de excluir, veja o que acontece.</p>
          </div>
        </div>

        {temContratoAtivo ? (
          <>
            <div className="rounded-2xl border border-[#FFD4C4] bg-[#FFF3EE] p-4">
              <div className="flex items-start gap-3">
                <FileText size={20} className="mt-0.5 shrink-0 text-[#D94E28]" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Você tem {totalContratosAtivos} {totalContratosAtivos === 1 ? "contrato ativo" : "contratos ativos"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Excluir a conta com um contrato ativo precisa da ajuda do nosso atendimento. Fale
                    com a gente pra seguir com o pedido.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Button className="h-14 w-full rounded-full" onClick={falarComAtendimento}>
                Falar com o atendimento
              </Button>
              <Button variant="outline" className="h-14 w-full rounded-full" onClick={() => navigate("/minha-conta")}>
                Manter minha conta
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              {[
                {
                  titulo: "Acesso",
                  texto: "Seu acesso é removido e você não vai conseguir entrar de novo com este CPF.",
                },
                {
                  titulo: "Dados",
                  texto:
                    "Seus dados de identificação são apagados. Alguns registros financeiros ficam guardados de forma anônima pelo prazo que a lei exige.",
                },
                {
                  titulo: "Permanência",
                  texto:
                    "Essa ação não pode ser desfeita. Diferente da suspensão, não existe reativação: para usar a Pode Já de novo, você precisaria criar uma conta nova.",
                },
              ].map((item) => (
                <div key={item.titulo} className="flex gap-3 rounded-2xl border border-border bg-white p-4">
                  <WarningCircle size={20} className="mt-0.5 shrink-0 text-[#D94E28]" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.titulo}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2">
              <Button
                className="h-14 w-full rounded-full"
                onClick={() => navigate("/minha-conta/excluir/motivo")}
              >
                Continuar
              </Button>
              <Button variant="outline" className="h-14 w-full rounded-full" onClick={() => navigate("/minha-conta")}>
                Manter minha conta
              </Button>
            </div>
          </>
        )}
      </div>
    </SubPageLayout>
  );
}
