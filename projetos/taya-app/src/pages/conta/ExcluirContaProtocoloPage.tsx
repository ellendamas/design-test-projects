import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";

// Rota: /minha-conta/excluir/protocolo — tela final, só chega aqui no ramo self-service (sem
// contrato ativo). "Concluir" desloga de verdade (mesma chave de sessão que o Sair de
// AccountScreen usa) e manda pro login com ?conta=excluida, pra mostrar um aviso lá (ver
// LoginScreen em App.tsx). Sem passo de reativação, diferente do protocolo de suspensão em
// produção: exclusão é permanente.
export default function ExcluirContaProtocoloPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const protocolo = (location.state as { protocolo?: string } | null)?.protocolo ?? "EXC-00000000";

  // Chegar direto nesta rota (sem ter passado pelo fluxo) não deveria acontecer, mas por
  // segurança redireciona pra Minha Conta em vez de mostrar um protocolo falso.
  useEffect(() => {
    if (!(location.state as { protocolo?: string } | null)?.protocolo) {
      navigate("/minha-conta", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const concluir = () => {
    if (typeof window !== "undefined") window.localStorage.removeItem("podeja_user");
    navigate("/acesso?conta=excluida", { replace: true });
  };

  return (
    <SubPageLayout title="Excluir conta" hideNav>
      <div className="flex flex-col items-center gap-5 pb-6 pt-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle size={32} className="text-green-600" weight="fill" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Conta excluída</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Guarde o número do protocolo. Se precisar, fale com o suporte informando esse número.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-border bg-white p-4">
          <p className="text-xs text-muted-foreground">Protocolo</p>
          <p className="text-lg font-bold text-foreground">{protocolo}</p>
        </div>

        <div className="w-full space-y-3 rounded-2xl border border-border bg-white p-4 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-foreground">Pedido registrado</p>
              <p className="text-xs text-muted-foreground">Recebemos sua solicitação de exclusão.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-foreground">Conta excluída</p>
              <p className="text-xs text-muted-foreground">
                Você será desconectado de todos os dispositivos ao concluir.
              </p>
            </div>
          </div>
        </div>

        {/* Separado da timeline a pedido da Ellen — "Sem reativação" ali dentro parecia só mais
            um passo da lista (e ainda esmaecido, como se fosse o próximo passo a acontecer),
            quando na verdade é a informação mais importante da tela: não existe volta. Mesmo
            estilo de alerta já usado no ramo "com contrato ativo" de ExcluirContaImpactosPage. */}
        <div className="w-full rounded-2xl border border-[#FFD4C4] bg-[#FFF3EE] p-4 text-left">
          <div className="flex items-start gap-3">
            <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-[#D94E28]" />
            <div>
              <p className="text-sm font-semibold text-foreground">Sem reativação</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Para usar a Pode Já de novo, você vai precisar criar uma conta nova, do zero.
              </p>
            </div>
          </div>
        </div>

        <Button className="mt-2 h-14 w-full rounded-full" onClick={concluir}>
          Concluir
        </Button>
      </div>
    </SubPageLayout>
  );
}
