import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trash } from "@phosphor-icons/react";
import { SubPageLayout, getStoredUser } from "@/App";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MOTIVOS_EXCLUSAO, type MotivoExclusaoId } from "./shared";

// Rota: /minha-conta/excluir/revisao — resumo antes da verificação de identidade. Checkbox
// começa desmarcada: o botão destrutivo só libera depois que a pessoa marca, mesmo padrão já
// usado em ConfirmarDadosPage.tsx (aceite do contrato de assinatura) e, antes dele, no aceite
// genérico da tela antiga de cadastro.
export default function ExcluirContaRevisaoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { motivo?: MotivoExclusaoId; comentario?: string } | null;
  const motivoLabel = MOTIVOS_EXCLUSAO.find((m) => m.id === state?.motivo)?.label ?? "Não informado";
  const user = getStoredUser();
  const [entendi, setEntendi] = useState(false);

  const avancar = () => {
    if (!entendi) return;
    navigate("/minha-conta/excluir/canal", { state: { motivo: state?.motivo, comentario: state?.comentario } });
  };

  return (
    <SubPageLayout title="Excluir conta" hideNav>
      <div className="space-y-5 pb-28">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <Trash size={28} className="text-[#FD5F31]" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Confirme antes de seguir</h1>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Titular</p>
              <p className="text-sm font-semibold text-foreground">{user?.name ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CPF</p>
              <p className="text-sm font-semibold text-foreground">{user?.cpf ?? "Não informado"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Motivo</p>
              <p className="text-sm font-semibold text-foreground">{motivoLabel}</p>
            </div>
            {state?.comentario && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Comentário</p>
                <p className="text-sm text-foreground">{state.comentario}</p>
              </div>
            )}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-white p-4">
          <Checkbox checked={entendi} onCheckedChange={(v) => setEntendi(v === true)} className="mt-0.5" />
          <span className="text-sm leading-relaxed text-foreground">
            Entendo que essa ação é permanente e não pode ser desfeita. Meus dados de identificação
            serão apagados, e alguns registros financeiros ficam guardados de forma anônima pelo
            prazo exigido por lei.
          </span>
        </label>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <Button variant="outline" className="h-14 w-full rounded-full" disabled={!entendi} onClick={avancar}>
          Solicitar exclusão
        </Button>
      </div>
    </SubPageLayout>
  );
}
